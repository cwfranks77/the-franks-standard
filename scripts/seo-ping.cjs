require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const SITE = (process.env.SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')
const SITEMAP = `${SITE}/sitemap.xml`
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || ''

const KEY_URLS = ['/', '/browse', '/sell', '/sellers', '/pricing', '/store-builder', '/launch-offer', '/how-it-works', '/compare']

async function pingBing () {
  const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`
  const res = await fetch(url)
  console.log(`Bing sitemap ping: HTTP ${res.status}`)
}

async function pingIndexNow () {
  if (!INDEXNOW_KEY) {
    console.log('Skip IndexNow (set INDEXNOW_KEY in .env and host /{key}.txt on site).')
    return
  }
  const host = new URL(SITE).hostname
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: KEY_URLS.map((p) => `${SITE}${p}`),
  }
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })
  console.log(`IndexNow: HTTP ${res.status}`)
}

async function main () {
  console.log('Site:', SITE)
  console.log('Sitemap:', SITEMAP)
  console.log('Google: https://search.google.com/search-console — submit sitemap + request indexing')
  await pingBing()
  await pingIndexNow()
}

main().catch((e) => { console.error(e.message || e); process.exit(1) })