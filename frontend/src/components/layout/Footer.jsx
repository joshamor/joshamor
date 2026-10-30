
import { useState } from "react";
import { Link } from "react-router-dom";
import MyLogo from "../../assets/logo.svg?react"
import logo from "../../assets/logo.png"



const footerGroups = [
  {
    title: 'General',
    links: [
      ['Make an Appointment', '/contact'],
      ['Our Story', '/our-story'],
      ['Bespoke', '/bespoke'],
      ['Careers', '/career'],
      ['Sustainability', '/sustainability'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['Cancel your order', '/enquiry?subject=Cancel%20an%20order'],
      ['Shipping & returns', '/shipping'],
      ['Privacy policy', '/privacy-policy'],
    ],
  },
  {
    title: 'Socials',
    links: [
      ['Instagram', 'https://instagram.com'],
      ['TikTok', 'https://tiktok.com'],
    ],
  },
]



export default function Footer() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState('idle')



  async function handleSubmit(event) {
    event.preventDefault()

    if (!consent || !email.trim()) return

    const form = event.currentTarget
    const website = form.elements.website.value

    setNewsletterStatus('sending')

    try {
      const response = await fetch('/.netlify/functions/inner-circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          consent,
          website,
          source: 'footer',
        }),
      })

      if (!response.ok) {
        throw new Error('Newsletter signup failed')
      }

      setNewsletterStatus('success')
      setEmail('')
      setConsent(false)
    } catch {
      setNewsletterStatus('error')
    }
  }




  return (
    <footer className="site-footer">
      <Link to="/" className="footer-logo">
        <img src={logo} className="h-3" />
      </Link>

      <div className="footer-content">
        <section className="footer-newsletter">
          <h2 className="footer-heading">ENTER THE WORLD OF JOSH AMOR</h2>

          <p className="footer-description">
            Be the first to discover new collections, receive exclusive invitations, and access private offerings reserved for our subscribers.
          </p>



          <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm">
            <div className="flex items-center border-b border-neutral-800">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email"
                aria-label="Your email"
                autoComplete="email"
                required
                className="h-11 min-w-0 flex-1 bg-transparent text-s outline-none placeholder:text-neutral-500"
              />

              <button
                type="submit"
                disabled={
                  !consent ||
                  !email.trim() ||
                  newsletterStatus === 'sending'
                }
                className="py-3 pl-4 text-s uppercase tracking-wider transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {newsletterStatus === 'sending' ? 'Joining…' : 'Sign up'}
              </button>
            </div>

            <label className="mt-4 flex items-start gap-2 text-xs leading-5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
                className="mt-1 accent-black"
              />

              <span className="text-sm">
                Yes, I agree to receive email updates and consent to the{' '}
                <Link
                  to="/privacy-policy"
                  className="underline underline-offset-2"
                >
                  privacy policy
                </Link>.
              </span>
            </label>

            <div
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label>
                Leave this field empty
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {newsletterStatus === 'success' && (
              <p className="mt-4 text-sm" role="status">
                Thank you for joining the Josh Amor mailing list.
                If confirmation is required, please check your inbox.
              </p>
            )}

            {newsletterStatus === 'error' && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                We couldn't process your signup. Please try again.
              </p>
            )}
          </form>




        </section>

        <div className="footer-link-groups">
          {footerGroups.map((group) => (
            <section key={group.title} className="footer-link-group">
              <h2>{group.title}</h2>

              <ul>
                {group.links.map(([label, url]) => (
                  <li key={label}>
                    {url.startsWith("http") ? (
                      <a href={url} target="_blank" rel="noreferrer">
                        {label}
                      </a>
                    ) : (
                      <Link to={url}>{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className="footer-copyright">
        © 2026 Josh Amor
      </div>
    </footer>
  );
}
