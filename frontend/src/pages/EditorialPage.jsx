
import { Link } from 'react-router-dom'
import { footerPages } from './footerPages'
import './footer-pages.css'

export default function EditorialPage({ pagePath }) {
  const page = footerPages[pagePath]

  if (!page) {
    return <main className="editorial-page"><h1>Page not found</h1></main>
  }

  return (
    <main className="editorial-page">
      <section className="editorial-intro">
        <p className="page-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="editorial-lead">{page.intro}</p>
      </section>

      <div className="editorial-rule" />

      <div className="editorial-body">
        {page.sections.map((section, index) => (
          <section className="editorial-section" key={section.heading}>
            <span className="section-number">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div>
              <h2>{section.heading}</h2>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {page.updated && (
          <p className="policy-updated">{page.updated}</p>
        )}

        {page.cta && (
          <Link className="editorial-cta" to={page.cta.href}>
            {page.cta.label}
            <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </main>
  )
}
