
import { Link } from 'react-router-dom'
import './updates.css'

const images = {
  collections:
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
  campaigns:
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
  runway:
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
  collaborations:
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
}

const updates = [
  {
    title: 'Collections & Releases',
    description:
      'Discover new collections, exclusive pieces, and the ideas behind their creation.',
    image: images.collections,
    alt: 'Fashion collection editorial',
    link: '/collections',
  },
  {
    title: 'Campaigns & Stories',
    description:
      'Explore the visual narratives, inspirations, and conversations that shape our world.',
    image: images.campaigns,
    alt: 'Fashion campaign photography',
    link: '/campaigns',
  },
  {
    title: 'Runway & Events',
    description:
      'Follow our appearances at fashion weeks, showcases, and other defining moments.',
    image: images.runway,
    alt: 'Fashion runway and event inspiration',
    link: '/campaigns',
  },
  {
    title: 'Collaborations & Announcements',
    description:
      'Stay connected to our creative partnerships, brand developments, and future projects.',
    image: images.collaborations,
    alt: 'Fashion design and creative collaboration inspiration',
    link: '/contact',
  },
]

export default function Updates() {
  return (
    <main className="updates-page editorial-landing">
      <section className="updates-intro">
        <p className="updates-eyebrow">The Journal</p>

        <h1>THE LATEST FROM JOSH AMOR</h1>

        <p className="updates-lead">
          Editorial stories, design inspiration, and the thinking behind
          our collections.
        </p>

        <div className="updates-intro-copy">
          <p>
            A closer look at what we’re creating, where we’re going, and
            the ideas shaping the future of Josh Amor.
          </p>

          <p>
            From new collections and campaign releases to runway moments,
            collaborations, and stories from our world, discover what’s
            happening at Josh Amor.
          </p>

          <p>
            Explore our latest stories, announcements, and creative
            expressions.
          </p>
        </div>

        <div className="updates-news-note">
          <span className="updates-news-label">The News</span>
          <p>
            Collection launches, fashion shows, collaborations, and
            official announcements.
          </p>
        </div>
      </section>

      <section className="updates-whats-new">
        <div className="updates-section-heading">
          <p className="updates-eyebrow">The Journal</p>
          <h2>WHAT’S NEW</h2>
        </div>

        <div className="updates-grid">
          {updates.map((item, index) => (
            <article className="updates-card" key={item.title}>
              <Link
                to={item.link}
                className="updates-card-link"
                aria-label={`Explore ${item.title}`}
              >
                <div className="updates-card-image">
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                  />
                  <span className="updates-card-number">
                    0{index + 1}
                  </span>

                </div>

                <div className="updates-card-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="updates-card-cta">
                    Discover more
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="updates-inner-circle" id="mailing-list">
        <p className="updates-eyebrow">Stay connected</p>

        <h2>Stay in the Circle.</h2>

        <p className="updates-circle-label">The Inner Circle</p>

        <p className="updates-circle-copy">
          Early access, exclusive releases, private invitations, and
          updates for subscribers.
        </p>

        <p className="updates-circle-copy">
          Be the first to discover new collections, exclusive releases,
          upcoming events, and stories from the world of Josh Amor.
        </p>

        <Link to="/contact" className="updates-mailing-link">
          JOIN OUR MAILING LIST
        </Link>
      </section>
    </main>
  )
}
