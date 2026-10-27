
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.svg?react"



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

  function handleSubmit(event) {
    event.preventDefault();

    if (!consent || !email.trim()) return;

    // Temporary: connect this form to the newsletter service later.
    console.log("Newsletter signup:", email);
  }

  return (
    <footer className="site-footer">
      <Link to="/" className="footer-logo">
        <Logo className="w-60" />
      </Link>

      <div className="footer-content">
        <section className="footer-newsletter">
          <h2 className="footer-heading">ENTER THE WORLD OF JOSH AMOR</h2>

          <p className="footer-description">
            Be the first to discover new collections, receive exclusive invitations, and access private offerings reserved for our subscribers.
          </p>

          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="newsletter-input-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email"
                aria-label="Your email"
                required
              />

              <button type="submit" disabled={!consent || !email.trim()}>
                Sign up
              </button>
            </div>

            <label className="newsletter-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />

              <span>
                Yes, I consent to the{" "}
                <Link to="/privacy-policy">privacy policy</Link>
              </span>
            </label>
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
