#!/usr/bin/env node
/**
 * Download category showcase JPEGs into public/img/showcase/ (same-origin, no CDN 404s).
 * Run: node scripts/fetch-showcase-photos.cjs
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

const PHOTOS = {
  cards: '1715279239396-51e741734462',
  coins: '1639762681485-074b7f938ba0',
  watches: '1523275335684-37898b6baf30',
  sneakers: '1542291026-7eec264c27ff',
  guitars: '1493225457124-a3eb161ffa5f',
  art: '1541961017774-22349e4a1262',
  camera: '1516035069371-29a1b244cc32',
  vintage: '1550745165-9bc0b252726f',
  estate: '1582719478250-c89cae4dc85b',
  comics: '1749909902676-911cf0c30fc0',
}

const OUT_DIR = path.join(__dirname, '..', 'public', 'img', 'showcase')

function download (photoId) {
  const url = `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=580&q=85`
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TFS-showcase-fetch/1.0' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${photoId}`))
        res.resume()
        return
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const [name, id] of Object.entries(PHOTOS)) {
    const dest = path.join(OUT_DIR, `${name}.jpg`)
    process.stdout.write(`fetch ${name}… `)
    await sleep(600)
    const buf = await download(id)
    fs.writeFileSync(dest, buf)
    console.log(`${(buf.length / 1024).toFixed(0)} KB → ${path.relative(process.cwd(), dest)}`)
  }
  console.log('done')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
