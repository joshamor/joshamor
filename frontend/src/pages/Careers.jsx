
import { Link } from 'react-router-dom'
import './careers.css'

const heroImage =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=85'

const editorialImage =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85'

export default function Careers() {
  return (
    <main className="careers-page">
      <section
        className="careers-hero"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <div className="careers-hero-overlay" />
      </section>

      <section className="careers-intro">
        <p>
          We are a fashion house built on creativity, considered design, and a
          distinctive point of view. We are always interested in meeting
          talented people who share our curiosity and ambition.
        </p>
      </section>

      <section className="careers-feature">
        <div className="careers-feature-copy">
          <div>
            <h2>Join our team</h2>
            <p>
              Interested in working with us? We welcome conversations with
              people across design, production, photography, and digital
              experiences.
            </p>
            <Link to="/enquiry?subject=Careers"
              className="careers-contact-link">
              Make an Enquiry
            </Link>
          </div>

          <span className="careers-wordmark">BRAND</span>
        </div>

        <div className="careers-feature-image">
          <img
            src={editorialImage}
            alt="Fashion editorial placeholder"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  )
}
