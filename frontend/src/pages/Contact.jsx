
import { Link } from 'react-router-dom'
import './footer-pages.css'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=85'

export default function Contact() {
  return (
    <main className="contact-page-reference">
      <section
        className="contact-hero"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
      >
        <div className="contact-hero-overlay" />

        <h1>Contact</h1>
      </section>

      <section className="contact-information">
        <div className="contact-service">
          <h2>Customer service:</h2>

          <p>
            Our Customer Service team is available during the following hours:
          </p>

          <p>Monday to Friday: 9AM – 5PM WAT</p>

          <Link to="/enquiry?subject=Customer%20service">
            Contact our customer team here
          </Link>
        </div>

        <div className="contact-press">
          <h2>For press inquiries:</h2>

          <a href="mailto:press@example.com">
            press@example.com
          </a>
        </div>
      </section>
    </main>
  )
}
