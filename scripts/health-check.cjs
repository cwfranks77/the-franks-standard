#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const https = require('https')

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    req.end()
  })
}

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers } }, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const sbUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rochesyrxiyrxhzmkuwk.supabase.co'
const sbKey = process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_KEY || ''
const checks = []

async function check(name, fn) {
  try {
    const r = await fn()
    checks.push({ name, ok: r.ok, detail: r.detail })
    console.log(r.ok ? 'OK  ' : 'FAIL', name, '-', r.detail)
  } catch (e) {
    checks.push({ name, ok: false, detail: e.message })
    console.log('FAIL', name, '-', e.message)
  }
}

;(async () => {
  await check('Live site loads', async () => {
    const r = await get('https://thefranksstandard.com/')
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Live site uses real Supabase', async () => {
    const r = await get('https://thefranksstandard.com/')
    const ok = r.body.includes('rochesyrxiyrxhzmkuwk') && !r.body.includes('placeholder.supabase')
    return { ok, detail: ok ? 'rochesyrxiyrxhzmkuwk' : 'missing or placeholder' }
  })
  await check('Supabase listings table', async () => {
    const r = await get(sbUrl + '/rest/v1/listings?select=id&limit=1', { apikey: sbKey, Authorization: 'Bearer ' + sbKey })
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Supabase orders table', async () => {
    const r = await get(sbUrl + '/rest/v1/orders?select=id&limit=1', { apikey: sbKey, Authorization: 'Bearer ' + sbKey })
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Supabase promo_codes', async () => {
    const r = await get(sbUrl + '/rest/v1/promo_codes?select=code&limit=1', { apikey: sbKey, Authorization: 'Bearer ' + sbKey })
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Edge stripe-webhook alive', async () => {
    const r = await post(sbUrl + '/functions/v1/stripe-webhook', '{}')
    return { ok: r.status !== 404, detail: 'HTTP ' + r.status }
  })
  await check('Supabase dropship_orders', async () => {
    const r = await get(sbUrl + '/rest/v1/dropship_orders?select=id&limit=1', { apikey: sbKey, Authorization: 'Bearer ' + sbKey })
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Supabase seller_dropship_settings', async () => {
    const r = await get(sbUrl + '/rest/v1/seller_dropship_settings?select=seller_id&limit=1', { apikey: sbKey, Authorization: 'Bearer ' + sbKey })
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Edge create-checkout-session alive', async () => {
    const r = await post(sbUrl + '/functions/v1/create-checkout-session', '{}')
    return { ok: r.status !== 404, detail: 'HTTP ' + r.status }
  })
  const failed = checks.filter((c) => !c.ok).length
  console.log('')
  console.log(failed ? 'Health: ' + (checks.length - failed) + '/' + checks.length + ' passed' : 'Health: all ' + checks.length + ' checks passed')
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })