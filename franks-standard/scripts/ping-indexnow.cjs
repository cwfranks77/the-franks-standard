/**
 * Notify Bing/Microsoft IndexNow after deploy (single homepage URL).
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')
const KEY_FILE = path.join(ROOT, 'indexnow-key.txt')

async function main () {
  if (!fs.existsSync(KEY_FILE)) {
    console.log('ping-indexnow: skip (no key file — run inject-franks-seo first)')
    return
  }
  const key = fs.readFileSync(KEY_FILE, 'utf8').trim()
  const host = SITE.replace(/^https?:\/\//, '')
  const body = {
    host,
    key,
    keyLocation: `${SITE}/${key}.txt`,
    urlList: [`${SITE}/`],
  }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    })
    console.log(`ping-indexnow: ${res.status} ${res.statusText}`)
  } catch (e) {
    console.log('ping-indexnow: failed (non-blocking)', e.message)
  }
}

main()
