
import { Link } from 'react-router-dom'
import './sustainability.css'

const heroImage =
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=85'

const closingImage =
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=85'

export default function Sustainability() {
  return (
    <main className="sustainability-page">
      <section
        className="sustainability-hero"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <div className="sustainability-hero-overlay" />
        <h1>Sustainability</h1>
      </section>

      <article className="sustainability-copy">
        <p>
          Sustainability is an important part of building a thoughtful fashion
          brand. We believe the choices made throughout the design and
          production process deserve careful consideration.
        </p>

        <p>
          We aim to create clothing that can be worn and appreciated over time.
          From the materials we select to the way garments are constructed, we
          want our decisions to reflect an ongoing commitment to considered
          design and responsible production.
        </p>

        <p>
          Our collections may involve different materials, production
          techniques, and specialist partners. We continue to evaluate these
          choices as the brand develops.
        </p>

        <p>
          We aim to work with production partners who share our commitment to
          quality, responsible working practices, and continuous improvement.
        </p>

        <p>
          We are exploring ways to make more informed material choices and
          reduce unnecessary packaging throughout our operations.
        </p>

        <p>
          We also encourage customers to care for their garments thoughtfully
          and keep them in use for as long as possible.
        </p>

        <p>
          Our approach will continue to evolve as we learn more about the
          impact of our materials, manufacturing processes, and supply chain.
          We will share specific commitments and progress as they can be
          substantiated.
        </p>

        <p className="sustainability-contact">
          Have a question? Kindly{' '}
          <Link to="/contact?subject=Sustainability">contact us</Link>.
        </p>
      </article>

      <section className="sustainability-closing-image">
        <img
          src={closingImage}
          alt="Contemporary architecture surrounded by natural materials"
          loading="lazy"
        />
      </section>
    </main>
  )
}
