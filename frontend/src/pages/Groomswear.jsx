
import { Link } from 'react-router-dom'
import './editorial-landing.css'

export default function Groomswear() {
  return (
    <main className="editorial-landing editorial-service-page">
      <section className="editorial-service-hero">
        <img
          src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1800&q=85"
          alt=""
        />
        <div className="editorial-service-overlay">
          <p className="editorial-landing-eyebrow">BESPOKE</p>
          <h1>Groomswear</h1>
          <p>
            Considered occasionwear for a day worth remembering.
          </p>
          <Link to="/enquiry" className="editorial-landing-cta">
            Make an appointment ↗
          </Link>
        </div>
      </section>
    </main>
  )
}
