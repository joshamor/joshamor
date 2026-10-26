
import './about.css'
import MyLogo from "../assets/logo.svg?react"

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
        <h1>Our Story</h1>
      </section>

      <section className="about-story">
        <h2>The Quiet Power of Regal Masculinity.</h2>

        <p>
          Founded in 2015 by Nigerian designer Majekodunmi Ayobamidele
          Joshua, Josh Amor is a contemporary menswear brand built on a
          singular philosophy: <strong>TAILORED FOR POWER.</strong>
        </p>

        <p>
          We believe clothing is more than appearance; it is an expression
          of identity, purpose, and presence. Through distinctive tailoring,
          thoughtful craftsmanship, and unconventional design, we create
          menswear that challenges norms and redefines masculine expression.
        </p>
      </section>

      <section
        className="about-visuals"
        aria-label="The Josh Amor creative vision"
      >
        <div className="about-image-card about-sketch-card">
          <img
            src={images.sketch}
            alt="Creative inspiration and design process"
            loading="lazy"
          />
          <span className="about-image-wordmark"><MyLogo className="w-50" /></span>
        </div>

        <div className="about-image-card">
          <img
            src={images.editorial}
            alt="Fashion editorial representing the Josh Amor aesthetic"
            loading="lazy"
          />
        </div>
      </section>

      <section className="about-story about-beyond">
        <h2>Beyond the Ordinary</h2>

        <p>
          Rooted in Nigerian creativity and shaped by a global perspective,
          Josh Amor celebrates individuality and challenges the limitations
          imposed by convention. Our designs balance structure with
          expression, refinement with boldness, and heritage with innovation.
        </p>
      </section>

      <section className="about-quote">
        <h2>Our Philosophy</h2>

        <p>
          Josh Amor exists for the man who knows who he is, embraces where
          he comes from, and refuses to be defined by limitations. A man who
          dresses with intention, carries himself with conviction, and
          understands that true power begins within.
        </p>
      </section>
    </main>
  )
}
