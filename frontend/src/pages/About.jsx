
import './about.css'

const images = {
  hero: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=85',
  sketch: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85',
  editorial: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
}

export default function About() {
  return (
    <main className="about-page">
      <section
        className="about-hero"
        style={{ backgroundImage: `url("${images.hero}")` }}
      >
        <div className="about-hero-overlay" />
        <h1>About us</h1>
      </section>

      <section className="about-story">
        <p>
          We are a ready-to-wear fashion brand driven by a vision to create
          clothing that captures attention through thoughtful design. Each
          piece is carefully considered, balancing creativity, distinctive
          silhouettes, and everyday expression.
        </p>

        <p>
          Our collections bring together ideas, materials, and details to
          create pieces with a point of view. We believe personal style should
          feel individual, confident, and entirely your own.
        </p>
      </section>

      <section className="about-visuals" aria-label="Our creative process">
        <div className="about-image-card about-sketch-card">
          <img
            src={images.sketch}
            alt="Creative inspiration and design process"
            loading="lazy"
          />
          <span className="about-image-wordmark">BRAND</span>
        </div>

        <div className="about-image-card">
          <img
            src={images.editorial}
            alt="Fashion editorial representing the collection"
            loading="lazy"
          />
        </div>
      </section>

      <section className="about-quote">
        <p>
          “It all starts with an idea.” Our creative process begins with
          curiosity, bringing references, sketches, and experiments together
          to turn an initial thought into something you can wear.
        </p>
      </section>
    </main>
  )
}
