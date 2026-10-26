
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'josh-amor-cart-v1'

function readStoredCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item) =>
        item &&
        typeof item.key === 'string' &&
        typeof item.slug === 'string' &&
        Number.isFinite(item.price) &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart)
  const [cartOpen, setCartOpen] = useState(false)

  // Persist every cart change, including quantity and removal updates.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // The cart remains usable if browser storage is unavailable.
    }
  }, [items])

  function addItem(product, variant, quantity = 1) {
    const key = `${product.id}:${variant.color}:${variant.size}`

    setItems((current) => {
      const existing = current.find((item) => item.key === key)

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...current,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          currency: product.currency || 'NGN',
          color: variant.color,
          size: variant.size,
          image: variant.image || product.colors?.[0]?.images?.[0] || '',
          quantity,
        },
      ]
    })

    setCartOpen(true)
  }

  function updateQuantity(key, quantity) {
    if (quantity <= 0) {
      removeItem(key)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, quantity } : item
      )
    )
  }

  function removeItem(key) {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const value = {
    items,
    cartOpen,
    setCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
