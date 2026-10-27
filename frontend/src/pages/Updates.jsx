
import { Link } from 'react-router-dom'
import { useState } from 'react'
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


function InnerCircleSignup() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('idle')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!consent || !email.trim()) return

    const form = event.currentTarget
    const website = form.elements.website.value

    setStatus('sending')

    try {
      const response = await fetch('/.netlify/functions/inner-circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          consent,
          website,
        }),
      })

      if (!response.ok) {
        throw new Error('Newsletter signup failed')
      }

      setEmail('')
      setConsent(false)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="mailing-list"
      className="bg-[#f5f4f1] px-5 py-16 text-center md:px-8 md:py-24"
    >
      <p className="mb-4 text-[10px] uppercase tracking-[0.2em]">
        Stay connected
      </p>

      <h2 className="font-[var(--font-display)] text-3xl md:text-5xl">
        Stay in the Circle.
      </h2>

      <p className="mt-5 font-[var(--font-display)] text-lg">
        The Inner Circle
      </p>

      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600">
        Early access, exclusive releases, private invitations, and
        updates for subscribers.
      </p>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-600">
        Be the first to discover new collections, exclusive releases,
        upcoming events, and stories from the world of Josh Amor.
      </p>

      {status === 'success' ? (
        <div className="mx-auto mt-8 max-w-md text-sm leading-7" role="status">
          <p>Thank you for joining the Inner Circle.</p>
          <p className="mt-2 text-neutral-600">
            If email confirmation is required, please check your inbox.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 w-full max-w-md text-left"
        >
          <label
            htmlFor="inner-circle-email"
            className="mb-2 block text-xs"
          >
            Email address
          </label>

          <div className="flex items-center border-b border-neutral-800">
            <input
              id="inner-circle-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />

            <button
              type="submit"
              disabled={
                !consent ||
                !email.trim() ||
                status === 'sending'
              }
              className="py-3 pl-4 text-xs uppercase tracking-wider transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'sending' ? 'Joining…' : 'Join ↗'}
            </button>
          </div>

          <label className="mt-5 flex items-start gap-2 text-xs leading-5 text-neutral-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              required
              className="mt-1 accent-black"
            />

            <span>
              I agree to receive email updates from Josh Amor and
              acknowledge the{' '}
              <Link
                to="/privacy-policy"
                className="underline underline-offset-2"
              >
                Privacy Policy
              </Link>.
            </span>
          </label>

          {/* Honeypot field for basic bot filtering */}
          <div
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <label>
              Leave this field empty
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          {status === 'error' && (
            <p className="mt-4 text-sm text-red-700" role="alert">
              We couldn't process your signup. Please try again.
            </p>
          )}
        </form>
      )}
    </section>
  )
}


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

      <InnerCircleSignup />
    </main>
  )
}
