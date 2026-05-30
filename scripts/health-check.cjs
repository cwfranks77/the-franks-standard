#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const https = require('https')

const EMAIL_ENV_PATHS = [
  path.join(__dirname, '..', '..', 'franks-standard-credentials', 'email.env'),
  path.join(__dirname, '..', 'email.env'),
]

function loadEmailEnv () {
  for (const p of EMAIL_ENV_PATHS) {
    if (!fs.existsSync(p)) continue
    const out = {}
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].trim()
    }
    if (out.EMAIL_USER) return { ...out, source: p }
  }
  return null
}

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
    const r = await get(sbUrl + '/functions/v1/stripe-webhook')
    if (r.status === 200) {
      try {
        const j = JSON.parse(await r.text())
        return { ok: !!j.ok, detail: j.ok ? 'secrets OK' : 'missing: ' + JSON.stringify(j) }
      } catch {
        return { ok: true, detail: 'HTTP 200' }
      }
    }
    const r2 = await post(sbUrl + '/functions/v1/stripe-webhook', '{}')
    return { ok: r2.status === 400, detail: 'HTTP ' + r2.status + ' (deploy health GET after push)' }
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
  await check('Edge ebay-seller-preview alive', async () => {
    const r = await post(sbUrl + '/functions/v1/ebay-seller-preview', '{}')
    return { ok: r.status !== 404, detail: 'HTTP ' + r.status }
  })
  await check('Edge auth-send-email hook deployed', async () => {
    const r = await post(sbUrl + '/functions/v1/auth-send-email', '{}')
    if (r.status === 404) return { ok: false, detail: 'HTTP 404 — deploy auth-send-email' }
    if (r.body && r.body.includes('missing_send_email_hook_secret')) {
      return { ok: false, detail: 'hook secret missing on Edge — run auth:push-hook-secret or Deploy workflow' }
    }
    if (r.status === 401 || r.status === 405) {
      return { ok: true, detail: 'HTTP ' + r.status + ' (hook live)' }
    }
    if (r.status === 500) return { ok: false, detail: 'HTTP 500 — ' + (r.body || '').slice(0, 120) }
    return { ok: false, detail: 'HTTP ' + r.status }
  })
  await check('Edge stripe-connect-onboard alive', async () => {
    const r = await post(sbUrl + '/functions/v1/stripe-connect-onboard', '{}')
    if (r.status === 404) return { ok: false, detail: 'HTTP 404' }
    return { ok: r.status === 401, detail: 'HTTP ' + r.status + (r.status === 401 ? ' (needs JWT)' : '') }
  })
  await check('Edge stripe-connect-sync alive', async () => {
    const r = await post(sbUrl + '/functions/v1/stripe-connect-sync', '{}')
    if (r.status === 404) return { ok: false, detail: 'HTTP 404 — deploy stripe-connect-sync' }
    return { ok: r.status === 401, detail: 'HTTP ' + r.status + (r.status === 401 ? ' (needs JWT)' : '') }
  })
  await check('Supabase authenticity_reports table', async () => {
    const r = await get(sbUrl + '/rest/v1/authenticity_reports?select=id&limit=1', { apikey: sbKey, Authorization: 'Bearer ' + sbKey })
    return { ok: r.status === 200, detail: r.status === 200 ? 'HTTP 200' : 'HTTP ' + r.status + ' (run migrations if 404)' }
  })
  await check('Live /sell/import page', async () => {
    const r = await get('https://thefranksstandard.com/sell/import/')
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Live /seller-tools page', async () => {
    const r = await get('https://thefranksstandard.com/seller-tools/')
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Live /top-sellers page', async () => {
    const r = await get('https://thefranksstandard.com/top-sellers/')
    return { ok: r.status === 200, detail: 'HTTP ' + r.status }
  })
  await check('Mailbox credentials (info@)', async () => {
    const env = loadEmailEnv()
    if (!env) return { ok: false, detail: 'email.env missing — see franks-standard-credentials/EMAIL-SETUP.md' }
    if (!env.EMAIL_PASS) {
      return { ok: false, detail: 'EMAIL_PASS empty — reset in Namecheap, save password, npm run mail:test' }
    }
    return { ok: true, detail: env.EMAIL_USER + ' configured (' + path.basename(path.dirname(env.source)) + '/email.env)' }
  })
  const failed = checks.filter((c) => !c.ok).length
  console.log('')
  console.log(failed ? 'Health: ' + (checks.length - failed) + '/' + checks.length + ' passed' : 'Health: all ' + checks.length + ' checks passed')

  if (failed) {
    const failedNames = checks.filter((c) => !c.ok).map((c) => c.name + ': ' + c.detail).join('; ')
    try {
      await post(sbUrl + '/functions/v1/ops-error-ingest', JSON.stringify({
        source: 'health-check',
        severity: 'critical',
        message: failedNames.slice(0, 500),
        metadata: { failed_checks: checks.filter((c) => !c.ok) },
      }))
      console.log('Reported health failure to ops-error-ingest')
    } catch (e) {
      console.log('Could not report to ops-error-ingest:', e.message)
    }
  }

  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })