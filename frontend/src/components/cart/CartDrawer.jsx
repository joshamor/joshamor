import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, Plus, Minus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './cart-drawer.css'


const nigeriaShippingOptions = [
  {
    id: 'standard',
    name: 'Standard delivery',
    description: '3–6 business days',
    price: 0,
  },
  {
    id: 'express',
    name: 'Express delivery',
    description: '2–4 business days',
    price: 5000,
  },
  {
    id: 'priority',
    name: 'Priority delivery',
    description: '1–3 business days',
    price: 9000,
  },
]

const internationalShippingOptions = [
  {
    id: 'standard',
    name: 'International standard',
    description: '7–14 business days',
    price: 25000,
  },
  {
    id: 'express',
    name: 'International express',
    description: '3–7 business days',
    price: 45000,
  },
]


const money = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)

export default function CartDrawer() {
  const {
    items,
    subtotal,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
  } = useCart()

  const [shipping, setShipping] = useState('standard')
  const [showDiscount, setShowDiscount] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [customer, setCustomer] = useState({
    country: 'Nigeria',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    state: '',
    city: '',
    postalCode: '',
  })

  const shippingOptions =
    customer.country === 'Nigeria'
      ? nigeriaShippingOptions
      : internationalShippingOptions

  const selectedShipping =
    shippingOptions.find((option) => option.id === shipping) ||
    shippingOptions[0]

  const total = subtotal + selectedShipping.price


  function updateCustomer(event) {
    const { name, value } = event.target

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleCheckout(event) {
    event.preventDefault()

    if (!items.length) return

    if (!acceptedTerms) {
      setCheckoutMessage('Please accept the terms and conditions.')
      return
    }

    setCheckoutMessage(
      'Your details are valid. Secure payment will be available once checkout is connected.'
    )
  }

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            type="button"
            className="cart-backdrop"
            aria-label="Close checkout"
            onClick={() => setCartOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="cart-drawer-header">
              <h2 id="cart-title">Checkout</h2>
              <button
                type="button"
                aria-label="Close checkout"
                onClick={() => setCartOpen(false)}
              >
                <X size={22} strokeWidth={1.4} />
              </button>
            </header>

            <div className="cart-drawer-scroll">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <p>Your bag is currently empty.</p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <>
                  <section className="cart-items">
                    {items.map((item) => (
                      <article key={item.key} className="cart-item">
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                        >
                          <img src={item.image} alt={item.name} />
                        </Link>

                        <div className="cart-item-details">
                          <p className="cart-item-name">{item.name}</p>
                          <p>Color: {item.color}</p>
                          <p>Size: {item.size}</p>

                          <div className="cart-quantity">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                            >
                              <Minus size={13} />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="cart-item-price">
                          <p>{money(item.price * item.quantity)}</p>
                          <button
                            type="button"
                            className="cart-remove"
                            onClick={() => removeItem(item.key)}
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    ))}
                  </section>

                  <section className="cart-totals">
                    <p><span>Subtotal</span><span>{money(subtotal)}</span></p>
                    <p>
                      <span>Shipping</span>
                      <span>{money(selectedShipping.price)}</span>
                    </p>
                    <p className="cart-total">
                      <span>Total amount</span>
                      <span>{money(total)}</span>
                    </p>
                    <p><span>VAT</span><span>Calculated at checkout</span></p>
                  </section>

                  <section className="cart-discount">
                    <button
                      type="button"
                      onClick={() => setShowDiscount((open) => !open)}
                    >
                      {showDiscount ? <Minus size={14} /> : <Plus size={14} />}
                      Gift or discount code?
                    </button>

                    {showDiscount && (
                      <div className="cart-discount-form">
                        <input
                          value={discountCode}
                          onChange={(event) => setDiscountCode(event.target.value)}
                          placeholder="Enter code"
                          aria-label="Gift or discount code"
                        />
                        <p>
                          Discount codes will be validated when the
                          checkout backend is connected.
                        </p>
                      </div>
                    )}
                  </section>

                  <form className="checkout-form" onSubmit={handleCheckout}>
                    <section className="checkout-shipping">
                      <div className="checkout-section-heading">
                        <h3>Shipping</h3>
                        <Link to="/shipping" onClick={() => setCartOpen(false)}>
                          Delivery information
                        </Link>
                      </div>

                      {shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`shipping-option ${
                            shipping === option.id ? 'is-selected' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={shipping === option.id}
                            onChange={() => setShipping(option.id)}
                          />

                          <span className="shipping-option-copy">
                            <span>{option.name}</span>
                            <small>{option.description}</small>
                          </span>

                          <span className="shipping-option-price">
                            {option.price === 0 ? 'Free' : money(option.price)}
                          </span>
                        </label>
                      ))}
                    </section>

                    <section className="checkout-personal">
                      <h3>Personal information</h3>

                        <div className="checkout-fields">
                          <select
                            name="country"
                            value={customer.country}
                            onChange={(event) => {
                              setCustomer((current) => ({
                                ...current,
                                country: event.target.value,
                              }))
                              setShipping('standard')
                              setCheckoutMessage('')
                            }}
                            autoComplete="country-name"
                            aria-label="Country or region"
                            required
                          >
                            <option value="Nigeria">Nigeria</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Kenya">Kenya</option>
                            <option value="South Africa">South Africa</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                            <option value="Other">Other international destination</option>
                          </select>
                        <input
                          name="email"
                          type="email"
                          placeholder="Email"
                          autoComplete="email"
                          value={customer.email}
                          onChange={updateCustomer}
                          required
                        />

                        <input
                          name="phone"
                          type="tel"
                          placeholder="Phone number"
                          autoComplete="tel"
                          value={customer.phone}
                          onChange={updateCustomer}
                          pattern="[0-9+() .-]{7,20}"
                          title="Enter a valid phone number using 7–20 digits or phone number characters."
                          required
                        />

                        <div className="checkout-field-row">
                          <input
                            name="firstName"
                            placeholder="First name"
                            autoComplete="given-name"
                            value={customer.firstName}
                            onChange={updateCustomer}
                            required
                          />
                          <input
                            name="lastName"
                            placeholder="Last name"
                            autoComplete="family-name"
                            value={customer.lastName}
                            onChange={updateCustomer}
                            required
                          />
                        </div>

                        <input
                          name="address"
                          placeholder="Street address"
                          autoComplete="street-address"
                          value={customer.address}
                          onChange={updateCustomer}
                          required
                        />

                        <input
                          name="apartment"
                          placeholder="Apartment, suite, etc. (optional)"
                          value={customer.apartment}
                          onChange={updateCustomer}
                        />

                        <div className="checkout-field-row">
                          <input
                            name="postalCode"
                            placeholder="Postal code"
                            autoComplete="postal-code"
                            value={customer.postalCode}
                            onChange={updateCustomer}
                          />
                          <input
                            name="city"
                            placeholder="City"
                            autoComplete="address-level2"
                            value={customer.city}
                            onChange={updateCustomer}
                            required
                          />
                        </div>

                        <input
                          name="state"
                          placeholder="State"
                          autoComplete="address-level1"
                          value={customer.state}
                          onChange={updateCustomer}
                          required
                        />
                      </div>

                      <label className="checkout-checkbox">
                        <input
                          type="checkbox"
                          checked={newsletter}
                          onChange={(event) =>
                            setNewsletter(event.target.checked)
                          }
                        />
                        Subscribe to newsletter
                      </label>

                      <label className="checkout-checkbox">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(event) =>
                            setAcceptedTerms(event.target.checked)
                          }
                          required
                        />
                        <span>
                          I accept the <Link to="/privacy-policy">terms and conditions</Link>
                        </span>
                        </label>

                      {checkoutMessage && (
                        <p className="checkout-message" role="status">
                          {checkoutMessage}
                        </p>
                      )}

                      <button
                        className="checkout-submit"
                        type="submit"
                        disabled={!items.length}
                      >
                        Continue to payment
                      </button>
                      <p className="checkout-payment-note">
                        Secure payment options will be available once
                        payment integration is configured.
                      </p>
                    </section>
                  </form>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
