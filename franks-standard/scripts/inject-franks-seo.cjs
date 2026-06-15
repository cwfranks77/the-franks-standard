/**
 * Post-generate SEO for thefranksstandard.com only.
 * Meta tags, robots.txt (single URL), sitemap, IndexNow key — no visible body injection.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const INDEX = path.join(ROOT, 'index.html')
const SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')

const TITLE = 'The Franks Standard | Authenticity-Guaranteed Collectibles Marketplace'
const DESCRIPTION =
  'The Franks Standard LLC — authenticity-guaranteed collectibles marketplace. Sports cards, watches, sneakers, coins, and estate finds with COA-backed listings.'

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

function stripLegacySeoBody (html) {
  return html.replace(/<!--franks-seo-start-->[\s\S]*?<!--franks-seo-end-->\n?/g, '')
}

function stripBrokenTailwindInline (html) {
  return html.replace(/<style>@tailwind[\s\S]*?<\/style>/gi, '')
}

function write200Noindex () {
  const p200 = path.join(ROOT, '200.html')
  if (!fs.existsSync(p200)) return
  let html = fs.readFileSync(p200, 'utf8')
  html = stripBrokenTailwindInline(html)
  if (!/name=["']robots["']/i.test(html)) {
    html = html.replace(/<head>/i, '<head>\n  <meta name="robots" content="noindex,nofollow">')
  } else {
    html = html.replace(/<meta name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow">')
  }
  fs.writeFileSync(p200, html, 'utf8')
}

function writeRobotsAndSitemap () {
  const today = new Date().toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`
  const robots = `# The Franks Standard — one homepage only (no duplicate SPA paths)
User-agent: *
Allow: /$
Disallow: /bc-audio
Disallow: /browse
Disallow: /sell
Disallow: /auth
Disallow: /ops
Disallow: /owner
Disallow: /shop
Disallow: /stores

Sitemap: ${SITE}/sitemap.xml
`
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8')
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8')

  const indexNowKey = crypto.randomBytes(16).toString('hex')
  fs.writeFileSync(path.join(ROOT, `${indexNowKey}.txt`), indexNowKey, 'utf8')
  fs.writeFileSync(path.join(ROOT, 'indexnow-key.txt'), indexNowKey, 'utf8')
}

function write404Noindex () {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <meta http-equiv="refresh" content="0;url=/">
  <link rel="canonical" href="${SITE}/">
  <title>Redirecting — The Franks Standard</title>
  <script>location.replace('/')</script>
</head>
<body>
  <p><a href="/">Go to The Franks Standard homepage</a></p>
</body>
</html>
`
  fs.writeFileSync(path.join(ROOT, '404.html'), html, 'utf8')
}

if (!fs.existsSync(INDEX)) {
  console.error('inject-franks-seo: run nuxt generate first')
  process.exit(1)
}

let html = fs.readFileSync(INDEX, 'utf8')
html = stripLegacySeoBody(html)
html = stripBrokenTailwindInline(html)
html = injectHead(html)
fs.writeFileSync(INDEX, html, 'utf8')

write404Noindex()
write200Noindex()
writeRobotsAndSitemap()
console.log('inject-franks-seo: meta, single-URL sitemap, noindex 404, robots.txt')
