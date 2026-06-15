/**
 * Post-generate SEO for thefranksstandard.com only.
 * - Crawler-visible Franks marketplace HTML (SPA shell is empty for Google)
 * - robots.txt + sitemap.xml
 * - Canonical, Open Graph, JSON-LD — no B&C or car-audio copy
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const INDEX = path.join(ROOT, 'index.html')
const SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')
const PHONE = process.env.NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE || '(877) 837-0527'
const PHONE_TEL = '+1' + PHONE.replace(/\D+/g, '').replace(/^1/, '')
const EMAIL = 'info@thefranksstandard.com'

const TITLE = 'The Franks Standard | Authenticity-Guaranteed Collectibles Marketplace'
const DESCRIPTION =
  'The Franks Standard is a proof-first collectibles marketplace. Sports cards, watches, sneakers, instruments, coins, and estate finds — every listing backed by a COA or signed guarantee.'

const START = '<!--franks-seo-start-->'
const END = '<!--franks-seo-end-->'

const STATIC_BLOCK = `${START}
<div id="franks-app-loading" aria-live="polite">Loading The Franks Standard marketplace…</div>
<div id="franks-static-seo" lang="en">
  <header>
    <p>The Franks Standard LLC — Authenticity-Guaranteed Marketplace</p>
    <h1>If it is here, it is real.</h1>
  </header>
  <main>
    <p>${DESCRIPTION}</p>
    <p>Browse verified listings, sell with a Certificate of Authenticity, and buy with confidence. Louisiana-based marketplace facilitator operated by The Franks Standard LLC.</p>
    <p>
      <strong>Contact:</strong>
      <a href="tel:${PHONE_TEL}">${PHONE}</a> ·
      <a href="mailto:${EMAIL}">${EMAIL}</a>
    </p>
  </main>
  <footer>
    <p>© ${new Date().getFullYear()} The Franks Standard LLC · ${SITE.replace(/^https?:\/\//, '')}</p>
  </footer>
</div>
<style id="franks-static-seo-style">
html,body{margin:0;background:#050509;color:#f9fafb;font-family:system-ui,sans-serif}
#__nuxt{min-height:100vh}
#franks-static-seo{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
#franks-app-loading{display:flex;align-items:center;justify-content:center;min-height:100vh;color:#f9fafb;font-size:1rem;letter-spacing:.02em}
html.nuxt-ready #franks-app-loading{display:none!important}
</style>
${END}`

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'The Franks Standard',
  alternateName: 'The Franks Standard LLC',
  url: SITE,
  description: DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    name: 'The Franks Standard LLC',
    url: SITE,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: PHONE_TEL,
      email: EMAIL,
      contactType: 'customer service',
    },
  },
}

function upsertMeta (html, attr, key, content) {
  const re = new RegExp(`<meta ${attr}=["']${key}["'][^>]*>`, 'i')
  const tag = `<meta ${attr}="${key}" content="${content.replace(/"/g, '&quot;')}">`
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `${tag}\n</head>`)
}

function injectHead (html) {
  let out = html
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${TITLE}</title>`)
  out = upsertMeta(out, 'name', 'description', DESCRIPTION)
  out = upsertMeta(out, 'property', 'og:title', TITLE)
  out = upsertMeta(out, 'property', 'og:description', DESCRIPTION)
  out = upsertMeta(out, 'property', 'og:url', SITE + '/')
  out = upsertMeta(out, 'property', 'og:type', 'website')
  out = upsertMeta(out, 'property', 'og:site_name', 'The Franks Standard')
  out = upsertMeta(out, 'name', 'twitter:card', 'summary_large_image')
  out = upsertMeta(out, 'name', 'twitter:title', TITLE)
  out = upsertMeta(out, 'name', 'twitter:description', DESCRIPTION)
  out = upsertMeta(out, 'name', 'robots', 'index,follow')
  const canonical = `<link rel="canonical" href="${SITE}/">`
  if (/<link[^>]+rel=["']canonical["']/i.test(out)) {
    out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, canonical)
  } else {
    out = out.replace(/<\/head>/i, `${canonical}\n</head>`)
  }
  const ld = `<script type="application/ld+json">${JSON.stringify(JSON_LD)}</script>`
  if (!out.includes('application/ld+json')) {
    out = out.replace(/<\/head>/i, `${ld}\n</head>`)
  }
  return out
}

function injectBody (html) {
  if (html.includes(START)) {
    return html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), STATIC_BLOCK)
  }
  const idx = html.indexOf('<div id="__nuxt">')
  if (idx === -1) return html.replace(/<\/body>/i, `${STATIC_BLOCK}\n</body>`)
  return html.slice(0, idx) + STATIC_BLOCK + '\n' + html.slice(idx)
}

function writeRobotsAndSitemap () {
  const today = new Date().toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
</urlset>
`
  const robots = `User-agent: *
Allow: /

Disallow: /bc-audio

Sitemap: ${SITE}/sitemap.xml
`
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8')
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8')
}

if (!fs.existsSync(INDEX)) {
  console.error('inject-franks-seo: run nuxt generate first')
  process.exit(1)
}

let html = fs.readFileSync(INDEX, 'utf8')
html = injectHead(html)
html = injectBody(html)
fs.writeFileSync(INDEX, html, 'utf8')

const notFound = path.join(ROOT, '404.html')
if (fs.existsSync(notFound)) {
  let nf = fs.readFileSync(notFound, 'utf8')
  nf = injectHead(nf)
  nf = injectBody(nf)
  fs.writeFileSync(notFound, nf, 'utf8')
}

writeRobotsAndSitemap()
console.log('inject-franks-seo: Franks-only meta, static crawl block, robots.txt, sitemap.xml')
