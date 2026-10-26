
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import products from '../data/products'
import './home.css'

const editorialImages = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
]

const editorialClosingImages = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
]

const campaignStill =
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85'

function ImageRail({ images, label }) {
  const railRef = useRef(null)

  function move(direction) {
    const rail = railRef.current
    if (!rail) return

    rail.scrollBy({
      left: direction * rail.clientWidth * 0.75,
      behavior: 'smooth',
    })
  }

  return (
    <section className="home-image-rail" aria-label={label}>
      <div className="home-image-rail-track" ref={railRef}>
        {images.map((image, index) => {
          const product = products[index % Math.max(products.length, 1)]

          return (
            <Link
              key={`${label}-${index}`}
              to={product ? `/products/${product.slug}` : '/shop'}
              className="home-editorial-card"
              aria-label={`Explore ${product?.name || 'the collection'}`}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
              />
            </Link>
          )
        })}
      </div>

      <button
        className="home-rail-arrow home-rail-arrow--left"
        type="button"
        aria-label="Previous images"
        onClick={() => move(-1)}
      >
        <ChevronLeft size={17} strokeWidth={1.4} />
      </button>

      <button
        className="home-rail-arrow home-rail-arrow--right"
        type="button"
        aria-label="Next images"
        onClick={() => move(1)}
      >
        <ChevronRight size={17} strokeWidth={1.4} />
      </button>
    </section>
  )
}

function ProductRail({ items, title }) {
  const railRef = useRef(null)

  function move(direction) {
    const rail = railRef.current
    if (!rail) return

    rail.scrollBy({
      left: direction * rail.clientWidth * 0.75,
      behavior: 'smooth',
    })
  }

  if (!items.length) return null

  return (
    <section className="home-product-section">
      <div className="home-section-heading">
        <h2>{title}</h2>
        <Link to="/shop/jackets-and-coats">View all</Link>
      </div>

      <div className="home-product-rail">
        <div className="home-product-track" ref={railRef}>
          {items.map((product) => {
            const image =
              product.colors?.[0]?.images?.[0] || ''

            return (
              <Link
                to={`/products/${product.slug}`}
                className="home-product-card"
                key={product.id}
              >
                <div className="home-product-image">
                  {image && (
                    <img src={image} alt={product.name} loading="lazy" />
                  )}
                </div>

                <div className="home-product-caption">
                  <p>{product.name}</p>
                  <p>
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: product.currency || 'NGN',
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <button
          className="home-rail-arrow home-rail-arrow--left"
          type="button"
          aria-label="Previous products"
          onClick={() => move(-1)}
        >
          <ChevronLeft size={17} strokeWidth={1.4} />
        </button>

        <button
          className="home-rail-arrow home-rail-arrow--right"
          type="button"
          aria-label="Next products"
          onClick={() => move(1)}
        >
          <ChevronRight size={17} strokeWidth={1.4} />
        </button>
      </div>
    </section>
  )
}

export default function Home() {
  const featuredProducts = products.slice(0, 2)

  const jacketProducts = products.filter((product) =>
    product.category?.toLowerCase().includes('jacket')
  )

  return (
    <main className="home-page">
      {/* 1. Portrait campaign video */}
      <section className="home-hero">
        <Link
          to={
            featuredProducts[0]
              ? `/products/${featuredProducts[0].slug}`
              : '/shop'
          }
          className="home-hero-media"
          aria-label="Discover the latest collection"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"

          >
            <source
              src="/videos/home-hero.mp4"
              type="video/mp4"
            />
          </video>
        </Link>
      </section>

      {/* 2. Two editorial feature images */}
      <section className="home-feature-pair">
        {featuredProducts.map((product, index) => {
          const image = product.colors?.[0]?.images?.[0]

          return (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className="home-feature-card"
            >
              {image && <img src={image} alt={product.name} />}

              {index === 1 && (
                <span className="home-feature-wordmark">JOSH AMOR</span>
              )}
            </Link>
          )
        })}
      </section>

      {/* 3. Editorial image carousel */}
      <ImageRail
        images={editorialImages}
        label="Featured campaign imagery"
      />

      {/* 4. Campaign video and still image */}
      <section className="home-campaign-pair">
        <Link
          to="/campaigns"
          className="home-campaign-video"
          aria-label="Explore the campaign library"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={editorialImages[1]}
          >
            <source
              src="/videos/campaign-placeholder.mp4"
              type="video/mp4"
            />
          </video>
        </Link>

        <Link
          to="/lookbook"
          className="home-campaign-still"
          aria-label="Explore the lookbook"
        >
          <img src={campaignStill} alt="" loading="lazy" />
        </Link>
      </section>

      {/* 5. Product carousel, sourced from Jackets & Coats */}
      <ProductRail
        items={jacketProducts}
        title="Jackets & Coats"
      />

      {/* 6. Final editorial image carousel */}
      <ImageRail
        images={editorialClosingImages}
        label="More campaign imagery"
      />
    </main>
  )
}
