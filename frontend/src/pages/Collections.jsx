
import { Link } from 'react-router-dom'
import './editorial-landing.css'
import SEO from '../components/SEO'

const collections = [
  {
    title: 'New Arrivals',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
    to: '/shop/new-arrivals',
  },
  {
    title: 'Casual Wear',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
    to: '/shop/casual-wear',
  },
  {
    title: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    to: '/shop/accessories',
  },
]

export default function Collections() {
  return (
  <>
    <SEO
      title="Collections"
      description="Discover contemporary wardrobe essentials, considered collections and bespoke tailoring from JOSH AMOR."
    />
    <main className="editorial-landing">
      <section className="editorial-landing-intro">
        <p className="editorial-landing-eyebrow">JOSH AMOR</p>
        <h1>Collections</h1>
        <p>
          Discover considered essentials, distinctive pieces,
          and contemporary expressions of personal style.
        </p>
      </section>

      <section
        className="editorial-landing-grid editorial-landing-grid--three"
        aria-label="Explore collections"
      >
        {collections.map((collection, index) => (
          <Link
            key={collection.title}
            to={collection.to}
            className="editorial-landing-card"
          >
            <img
              src={collection.image}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="editorial-landing-card-caption">
              <h2>{collection.title}</h2>
              <span>Discover ↗</span>
            </div>
          </Link>
        ))}
      </section>
      </main>
  </>
  )
}
