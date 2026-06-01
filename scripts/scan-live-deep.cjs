#!/usr/bin/env node
const https = require('https')
const needles = ['record_seller_policy_acceptance', 'accept-seller-policies', 'recordAcceptanceOnProfile']

function get (url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'scan' } }, (res) => {
      let b = ''
      res.on('data', (c) => { b += c })
      res.on('end', () => resolve({ status: res.statusCode, b }))
    }).on('error', reject)
  })
}

function extractImports (body) {
  const out = new Set()
  for (const m of body.matchAll(/\/_nuxt\/[A-Za-z0-9_.-]+\.js/g)) out.add(m[0])
  return [...out]
}

;(async () => {
  const sell = await get('https://thefranksstandard.com/sell/')
  const entry = (sell.b.match(/src="(\/_nuxt\/[^"]+\.js)"/) || [])[1]
  console.log('entry', entry)
  const seen = new Set()
  const queue = entry ? [entry] : []
  const hits = {}
  for (const n of needles) hits[n] = []

  while (queue.length) {
    const rel = queue.shift()
    if (seen.has(rel)) continue
    seen.add(rel)
    const j = await get('https://thefranksstandard.com' + rel)
    if (j.status !== 200) continue
    for (const n of needles) {
      if (j.b.includes(n)) hits[n].push(rel)
    }
    for (const imp of extractImports(j.b)) {
      if (!seen.has(imp)) queue.push(imp)
    }
    if (seen.size > 120) break
  }
  console.log('scanned chunks', seen.size)
  for (const n of needles) console.log(n, hits[n].length ? hits[n] : 'MISSING')
})()
