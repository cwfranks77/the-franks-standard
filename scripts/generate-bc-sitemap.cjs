/**
 * After Nuxt build for www.bcpoweraudio.com — write robots.txt + sitemap.xml
 * so Google/Bing can crawl product and storefront URLs.
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.bcpoweraudio.com').replace(/\/$/, '')
const CATALOG_PATH = path.join(__dirname, '..', 'public', 'catalog', 'petra-products.json')
const PRODUCTS_PATH = path.join(__dirname, '..', 'content', 'products.json')
const MAX_PRODUCT_URLS = 500

async function loadProductIds () {
  try {
    const { filterBcAudioProducts } = await import('../utils/bcAudioOnlyCatalog.js')
    if (fs.existsSync(CATALOG_PATH)) {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
      const rows = Array.isArray(catalog?.products) ? catalog.products : []
      return filterBcAudioProducts(rows).map((p) => p.id).filter(Boolean).slice(0, MAX_PRODUCT_URLS)
    }
    const rows = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'))
    return Array.isArray(rows) ? rows.map((p) => p.id).filter(Boolean).slice(0, MAX_PRODUCT_URLS) : []
  } catch {
    return []
  }
}

async function main () {
  if (!fs.existsSync(ROOT)) {
    console.error('generate-bc-sitemap: run nuxt build first')
    process.exit(1)
  }

  const productIds = await loadProductIds()
  const staticPaths = [
    '/',
    '/bc-audio/catalog',
    '/bc-audio/open-door',
    '/bc-audio/sms-consent',
    ...productIds.map((id) => `/bc-audio/product/${id}`),
  ]

  const urls = staticPaths.map((p) => {
    const priority = p === '/' ? '1.0' : p.includes('/product/') ? '0.85' : '0.7'
    const changefreq = p.includes('/product/') ? 'weekly' : 'daily'
    return `  <url><loc>${SITE}${p}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
  }).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  const robots = `User-agent: *
Allow: /bc-audio
Allow: /bc-audio/
Disallow: /bc-audio/ops
Disallow: /ops

Sitemap: ${SITE}/sitemap.xml
`

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8')
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8')
  console.log(`generate-bc-sitemap: wrote ${staticPaths.length} URLs for ${SITE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
