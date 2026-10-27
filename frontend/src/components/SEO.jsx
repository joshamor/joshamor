
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'JOSH AMOR'
const DEFAULT_TITLE = 'JOSH AMOR | Contemporary Fashion & Bespoke Tailoring'
const DEFAULT_DESCRIPTION =
  'Discover JOSH AMOR’s contemporary fashion, bespoke tailoring, considered wardrobe essentials and latest collections.'

// Set VITE_SITE_URL in your .env file when your production domain is confirmed.
const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '')

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = '/og-image.jpg',
  noindex = false,
  type = 'website',
}) {
  const location = useLocation()

  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE

  // Ignore query parameters and URL fragments when creating canonical URLs.
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}${location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '')}`
    : null

  const imageUrl = image
    ? /^https?:\/\//i.test(image)
      ? image
      : SITE_URL
        ? `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`
        : null
    : null

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />

      {canonicalUrl && (
        <link rel="canonical" href={canonicalUrl} />
      )}

      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large'
        }
      />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && (
        <meta property="og:url" content={canonicalUrl} />
      )}
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  )
}
