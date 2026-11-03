
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { syncGuestCart } from '../services/api'

const CartContext = createContext(null)
const STORAGE_KEY = 'josh-amor-cart-v1'
const GUEST_CART_ID_KEY = 'josh-amor-guest-cart-id-v1'

function getOrCreateGuestCartId() {
  try {
    const existing = localStorage.getItem(GUEST_CART_ID_KEY)

    if (existing) return existing

    const id =
      globalThis.crypto?.randomUUID?.() ||
      `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`

    localStorage.setItem(GUEST_CART_ID_KEY, id)

    return id
  } catch {
    return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function createNewGuestCartId() {
  const id =
    globalThis.crypto?.randomUUID?.() ||
    `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`

  try {
    localStorage.setItem(GUEST_CART_ID_KEY, id)
  } catch {
    // Cart can still operate for this browser session.
  }

  return id
}


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
  const [guestCartId, setGuestCartId] = useState(
    getOrCreateGuestCartId
  )
  const [cartSyncStatus, setCartSyncStatus] = useState('idle')
  const [cartSyncError, setCartSyncError] = useState('')
  const [cartSyncDetails, setCartSyncDetails] = useState([])

  // Persist every cart change, including quantity and removal updates.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // The cart remains usable if browser storage is unavailable.
    }
  }, [items])

  // Synchronize the local cart with the backend.
  useEffect(() => {
    const controller = new AbortController()

    const timeoutId = setTimeout(async () => {
      setCartSyncStatus('syncing')
      setCartSyncError('')
      setCartSyncDetails([])

      try {
        const result = await syncGuestCart(
          guestCartId,
          items,
          { signal: controller.signal }
        )

        if (controller.signal.aborted) return

        const serverItems = result?.data?.items || []

        // Use MongoDB's current product information and stock.
        const serverItemsMap = new Map(
          serverItems.map(item => [
            `${item.productId}:${item.variantId}`,
            item,
          ])
        )

        setItems(current => {
          let hasChanged = false

          const updatedItems = current.map(item => {
            const serverItem = serverItemsMap.get(
              `${item.productId}:${item.variantId}`
            )

            if (!serverItem) return item

            const updatedItem = {
              ...item,
              productId: serverItem.productId,
              variantId: serverItem.variantId,
              name: serverItem.name,
              slug: serverItem.slug,
              price: serverItem.price,
              currency: serverItem.currency,
              sku: serverItem.sku,
              stock: serverItem.stock,
              color: serverItem.color,
              size: serverItem.size,
              image: serverItem.image || item.image,
            }

            const fields = [
              'name',
              'slug',
              'price',
              'currency',
              'sku',
              'stock',
              'image',
              'color',
              'size',
            ]

            const changed = fields.some(
              field => updatedItem[field] !== item[field]
            )

            if (changed) {
              hasChanged = true
              return updatedItem
            }

            return item
          })

          return hasChanged ? updatedItems : current
        })

        setCartSyncStatus('synced')
      } catch (error) {
        if (controller.signal.aborted) return

        setCartSyncStatus('error')
        setCartSyncError(
          error.message || 'Unable to synchronize your cart.'
        )
        setCartSyncDetails(error.details || [])
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [guestCartId, items])

  function startNewGuestCart() {
    const newGuestCartId = createNewGuestCartId()

    setGuestCartId(newGuestCartId)

    return newGuestCartId
  }

  function addItem(product, variant, quantity = 1) {
    const productId = product._id || product.id

    const variantId =
      variant.variantId ||
      variant.id ||
      variant._id ||
      null

    const key = variantId
      ? `${productId}:${variantId}`
      : `${productId}:${variant.color}:${variant.size}`

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
          productId,
          variantId,
          slug: product.slug,
          name: product.name,
          price: product.price,
          currency: product.currency || 'NGN',
          color: variant.color,
          size: variant.size,
          image: variant.image || product.colors?.[0]?.images?.[0] || '',
          quantity,
          stock: Number.isInteger(variant.stock)
            ? variant.stock
            : null,
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
    guestCartId,
    cartSyncStatus,
    cartSyncError,
    cartOpen,
    setCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    cartSyncDetails,
    startNewGuestCart,
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
