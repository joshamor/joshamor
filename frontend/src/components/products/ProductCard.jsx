
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './product-card.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

export default function ProductCard({ product }) {
  const [imageIndex, setImageIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  const images =
    product.colors?.[0]?.images?.length
      ? product.colors[0].images
      : product.images || []

  const safeIndex = images.length ? imageIndex % images.length : 0
  const image = images[safeIndex]

  function changeImage(event, direction) {
    event.preventDefault()
    event.stopPropagation()

    if (images.length < 2) return

    setImageIndex(
      (current) => (current + direction + images.length) % images.length
    )
  }

  return (
    <article
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/products/${product.slug}`}
        className="product-card-link"
        aria-label={`View ${product.name}`}
      >
        <div className="product-card-media">
          {image && (
            <img
              key={image}
              className="product-card-image"
              src={image}
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
          )}

          {hovered && images.length > 1 && (
            <div className="product-card-arrows">
              <button
                type="button"
                aria-label="Previous product image"
                onClick={(event) => changeImage(event, -1)}
              >
                <ChevronLeft size={18} strokeWidth={1.3} />
              </button>

              <button
                type="button"
                aria-label="Next product image"
                onClick={(event) => changeImage(event, 1)}
              >
                <ChevronRight size={18} strokeWidth={1.3} />
              </button>
            </div>
          )}

          <div
            className={`product-card-sizes ${hovered ? 'is-visible' : ''}`}
          >
            {product.sizes
              .filter((size) => product.availableSizes.includes(size))
              .map((size) => (
                <span key={size}>{size}</span>
              ))}
          </div>
        </div>

        <div className="product-card-info">
          <h3>{product.name}</h3>
          <p>{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  )
}
