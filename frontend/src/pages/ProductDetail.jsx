
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react'
import products from '../data/products'
import ProductCard from '../components/products/ProductCard'
import { useCart } from '../context/CartContext'
import './product-detail.css'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="product-accordion">
      <button
        type="button"
        className="product-accordion-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? <Minus size={14} /> : <Plus size={14} />}
      </button>

      {open && <div className="product-accordion-content">{children}</div>}
    </section>
  )
}


function SizeGuideModal({ onClose }) {
  const [unit, setUnit] = useState('cm')
  const [tab, setTab] = useState('measurements')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const sizes = ['XS', 'S', 'M', 'L', 'XL']

  const measurements = [
    { label: 'Chest', values: [[78, 82], [84, 88], [90, 94], [96, 100], [102, 106]] },
    { label: 'Waist', values: [[65, 69], [71, 75], [77, 81], [83, 87], [89, 94]] },
    { label: 'Hip', values: [[89, 93], [95, 99], [101, 105], [107, 111], [113, 117]] },
  ]

  const conversions = [
    { label: 'EU', values: ['34', '36–38', '38–40', '40–42', '42–44'] },
    { label: 'United Kingdom', values: ['6', '8', '10', '12', '14'] },
    { label: 'United States', values: ['2', '4', '6', '8', '10'] },
    { label: 'France', values: ['36', '38', '40', '42', '44'] },
    { label: 'Italy', values: ['40', '42', '44', '46', '48'] },
  ]

  function formatRange(range) {
    if (unit === 'cm') {
      return `${range[0]}–${range[1]}`
    }

    const convert = (cm) => (cm / 2.54).toFixed(1)
    return `${convert(range[0])}–${convert(range[1])}`
  }

  return (
    <div
      className="size-guide-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="size-guide-modal size-guide-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
      >
        <header className="size-guide-header">
          <h2 id="size-guide-title">Size guide</h2>

          <button
            type="button"
            className="size-guide-close"
            onClick={onClose}
            aria-label="Close size guide"
          >
            ×
          </button>
        </header>

        <div className="size-guide-units">
          <span className={unit === 'cm' ? 'active' : ''}>CM</span>
          <span>/</span>
          <span className={unit === 'inches' ? 'active' : ''}>INCHES</span>

          <button
            type="button"
            className={`size-guide-switch ${unit === 'inches' ? 'is-inches' : ''}`}
            role="switch"
            aria-checked={unit === 'inches'}
            aria-label="Switch between centimetres and inches"
            onClick={() => setUnit((current) => current === 'cm' ? 'inches' : 'cm')}
          >
            <span />
          </button>
        </div>

        <nav className="size-guide-tabs" aria-label="Size guide sections">
          <button
            type="button"
            className={tab === 'measurements' ? 'active' : ''}
            onClick={() => setTab('measurements')}
          >
            Measurement
          </button>

          <button
            type="button"
            className={tab === 'charts' ? 'active' : ''}
            onClick={() => setTab('charts')}
          >
            Size charts
          </button>
        </nav>

        <div className="size-guide-body">
          {tab === 'measurements' ? (
            <section>
              <h3>Body measurements</h3>

              <p className="size-guide-description">
                To find your perfect fit based on your individual body
                measurements, always check your measurements against our
                size guide.
              </p>

              <div className="size-guide-table-wrap">
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th aria-label="Measurement" />
                      {sizes.map((size) => (
                        <th key={size}>{size}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {measurements.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {row.values.map((range, index) => (
                          <td key={index}>{formatRange(range)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="size-guide-unit-note">
                All measurements are in {unit === 'cm' ? 'centimetres' : 'inches'}.
              </p>
            </section>
          ) : (
            <section>
              <h3>International size conversion</h3>

              <div className="size-guide-table-wrap">
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th aria-label="Region" />
                      {sizes.map((size) => (
                        <th key={size}>{size}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {conversions.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {row.values.map((value, index) => (
                          <td key={index}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  )
}



export default function ProductDetail() {
  const { slug } = useParams()
  const product = products.find((item) => item.slug === slug)

  const [colorIndex, setColorIndex] = useState(-1)
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const { addItem } = useCart()

  function handleAddToCart() {
    if (!canAddToCart) return

    addItem(product, {
      color: selectedColor.name,
      size: selectedSize,
      image: selectedColor.images[imageIndex],
    })

    setCartMessage(`${product.name} added to your bag.`)
  }


  useEffect(() => {
    setColorIndex(0)
    setImageIndex(0)
    setSelectedSize('')
    setCartMessage('')
  }, [slug])


  if (!product) {
    return (
      <>
        <SEO
          title="Product not found"
          description="This product could not be found."
          noindex
        />
        <main className="product-not-found">
          <h1>Product not found</h1>
          <Link to="/">Return to home</Link>
        </main>
      </>
    )
  }


  const activeColorIndex = colorIndex === -1 ? 0 : colorIndex
  const selectedColor = product.colors[activeColorIndex]
  const images = selectedColor.images

  const canAddToCart =
    colorIndex !== -1 &&
    Boolean(selectedSize) &&
    product.availableSizes.includes(selectedSize)


  function changeImage(direction) {
    setImageIndex((current) =>
      (current + direction + images.length) % images.length
    )
  }



  const matchingProducts = products.filter((item) =>
    product.matchingProducts?.includes(item.id)
  )

  const productDescription = product.description
    ?.replace(/\s+/g, ' ')
    .trim()

  const productImage = product.images?.[0]

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescription,
    image: product.images || [],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'JOSH AMOR',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency || 'NGN',
      price: product.price,
      availability: product.availableSizes?.length
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }


  return (
<>

    <SEO
      title={product.name}
      description={productDescription}
      image={productImage}
      type="product"
    />

    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>




    <main className="product-detail-page">
      <div className="product-detail-layout">
        <section className="product-gallery" aria-label="Product images">
          <div className="product-gallery-main">
            <img
              key={`${product.id}-${activeColorIndex}-${imageIndex}`}
              className="product-gallery-image"
              src={images[imageIndex]}
              alt={`${product.name} — ${selectedColor.name}, image ${imageIndex + 1}`}
              fetchPriority="high"
              decoding="async"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left"
                  onClick={() => changeImage(-1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right"
                  onClick={() => changeImage(1)}
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          <div className="product-gallery-footer">
            <span>
              {imageIndex + 1}/{images.length}
            </span>

            <div className="product-gallery-dots">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  aria-current={imageIndex === index ? 'true' : undefined}
                  className={imageIndex === index ? 'active' : ''}
                  onClick={() => setImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {images.length > 1 && (
            <div className="product-gallery-thumbnails">
              {images.map((image, index) => (
                <button
                  key={`${image}-thumb-${index}`}
                  type="button"
                  className={imageIndex === index ? 'active' : ''}
                  onClick={() => setImageIndex(index)}
                  aria-label={`Select image ${index + 1}`}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="product-detail-info">
          <div className="product-detail-heading">
            <h1>{product.name}</h1>
            <p>{formatPrice(product.price)}</p>
          </div>

          <ul className="product-feature-list">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <section className="product-color-section">
            <div className="product-color-swatches">
              {product.colors.map((color, index) => (
                <button
                  key={color.name}
                  type="button"
                  className={`product-color-swatch ${
                    colorIndex === index ? 'selected' : ''
                  }`}
                  style={{ '--swatch-color': color.hex }}
                  onClick={() => {
                    setColorIndex(index)
                    setImageIndex(0)
                    setCartMessage('')
                  }}
                  aria-label={`Choose ${color.name}`}
                  aria-pressed={colorIndex === index}
                  title={color.name}
                />
              ))}
            </div>

            <p className="product-selected-color">{selectedColor.name}</p>
          </section>

          <section className="product-size-section">
            <div className="product-size-options">
              {product.sizes.map((size) => {
                const available = product.availableSizes.includes(size)

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!available}
                    className={[
                      selectedSize === size ? 'selected' : '',
                      !available ? 'unavailable' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      setSelectedSize(size)
                      setCartMessage('')
                    }}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                )
              })}
            </div>

            {selectedSize && !canAddToCart && (
              <p className="product-stock-message">
                This size is currently unavailable.
              </p>
            )}
          </section>

          <button
            type="button"
            className="product-add-to-cart"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
          >
            Add to cart
          </button>

          {cartMessage && (
            <p className="product-cart-message" role="status">
              {cartMessage}
            </p>
          )}

          <button
            type="button"
            className="product-size-guide-link"
            onClick={() => setSizeGuideOpen(true)}
          >
            Size guide
          </button>

          <div className="product-accordions">
            <Accordion title="Description" defaultOpen>
              <p>{product.description}</p>
            </Accordion>

            <Accordion title="Details">
              <dl className="product-details-list">
                {product.details.map((detail) => (
                  <div key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion>

            <Accordion title="Delivery information">
              <h3>{product.delivery.heading}</h3>

              {product.delivery.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              <p>
                <Link to="/shipping">Read shipping and returns</Link>
              </p>

              <p>
                <Link to="/enquiry?subject=Shipping%20and%20returns">
                  Contact customer service
                </Link>
              </p>
            </Accordion>
          </div>
        </aside>
      </div>

      {matchingProducts.length > 0 && (
        <section className="matching-products">
          <h2>Matching products</h2>

          <div className="matching-products-grid">
            {matchingProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {sizeGuideOpen && (
        <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />
      )}
      </main>
</>
  )
}
