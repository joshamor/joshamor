
import { Link } from 'react-router-dom'
import './editorial-landing.css'
import SEO from '../components/SEO'

export default function Tailoring() {
  return (
  <>
    <SEO
      title="Bespoke Tailoring"
      description="Discover contemporary wardrobe essentials, considered collections and bespoke tailoring from JOSH AMOR."
    />
    <main className="editorial-landing editorial-service-page">
      <section className="editorial-service-hero">
        <img
          src="https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1800&q=85"
          alt=""
        />
        <div className="editorial-service-overlay">
          <p className="editorial-landing-eyebrow">BESPOKE</p>
          <h1>Tailoring</h1>
          <p>
            A personal approach to fit, form, and individual style.
          </p>
          <Link to="/enquiry" className="editorial-landing-cta">
            Make an appointment ↗
          </Link>
        </div>
      </section>
      </main>
      </>
  )
}
