
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import products from '../src/data/products.js'
import {
  shopCategories,
  getShopCategoryPath,
  getProductsForCategory,
} from '../src/data/shopCategories.js'

const siteUrl = (
  "https://www.joshamor.com"
).replace(/\/+$/, '')

const publicDir = resolve('public')

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function isPublishedProduct(product) {
  return product.published === true && product.isPlaceholder !== true
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  if (!siteUrl || !/^https?:\/\/[^/]+/i.test(siteUrl)) {
    console.warn(
      'SEO sitemap skipped: set SITE_URL to your production website URL.'
    )
    return
  }

  const staticPaths = [
    '/',
    '/our-story',
    '/contact',
    '/career',
    '/sustainability',
    '/enquiry',
    '/shipping',
    '/campaigns',
    '/lookbook',
    '/appointments',
    '/updates',
    '/collections',
    '/bespoke',
    '/bespoke/tailoring',
    '/bespoke/groomswear',
    '/shop',
  ]

  const publishedProducts = products.filter(isPublishedProduct)

  const categoryPaths = shopCategories
    .filter((category) => category.slug)
    .filter((category) => {
      const categoryProducts = getProductsForCategory(
        publishedProducts,
        category
      )
      return categoryProducts.length > 0
    })
    .map(getShopCategoryPath)

  const productPaths = publishedProducts.map(
    (product) => `/products/${product.slug}`
  )

  const paths = [
    ...new Set([...staticPaths, ...categoryPaths, ...productPaths]),
  ]

  const urls = paths.map((path) => {
    const loc = `${siteUrl}${path}`

    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
  </url>`
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  await writeFile(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8')

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

  await writeFile(resolve(publicDir, 'robots.txt'), robots, 'utf8')

  console.log(
    `Generated sitemap.xml with ${paths.length} URLs for ${siteUrl}`
  )
}

main().catch((error) => {
  console.error('Failed to generate SEO sitemap:', error)
  process.exitCode = 1
})
