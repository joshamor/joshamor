
import { Link } from 'react-router-dom'
import './editorial-landing.css'

const bespokeServices = [
  {
    title: 'Tailoring',
    description: 'Personal expression, shaped around you.',
    image:
      'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1400&q=85',
    to: '/bespoke/tailoring',
  },
  {
    title: 'Groomswear',
    description: 'A considered approach to your occasion.',
    image:
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1400&q=85',
    to: '/bespoke/groomswear',
  },
]

export default function Bespoke() {
  return (
    <main className="editorial-landing">
      <section className="editorial-landing-intro">
        <p className="editorial-landing-eyebrow">
          THE BESPOKE EXPERIENCE
        </p>
        <h1>Made for you.</h1>
        <p>
          Discover a more personal approach to dressing, where
          craftsmanship, fit, and individual expression come together.
        </p>
      </section>

      <section
        className="editorial-landing-grid editorial-landing-grid--two"
        aria-label="Bespoke services"
      >
        {bespokeServices.map((service) => (
          <Link
            key={service.title}
            to={service.to}
            className="editorial-landing-card"
          >
            <img src={service.image} alt="" loading="lazy" />
            <div className="editorial-landing-card-caption">
              <div>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>
              <span>Explore ↗</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
