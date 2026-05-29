#!/usr/bin/env node
/**
 * Verifies auth signup email plumbing (hook deployed + redirect URLs documented).
 * Does NOT send a real signup — use a test Gmail after this passes.
 */
const https = require('https')

const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'
const HOOK_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/auth-send-email`
const SITE_VERIFY = 'https://thefranksstandard.com/auth/verify'

function post (url, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    }, (res) => {
      let d = ''
      res.on('data', (c) => { d += c })
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function get (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = ''
      res.on('data', (c) => { d += c })
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    }).on('error', reject)
  })
}

;(async () => {
  let failed = 0
  const ok = (name, detail) => console.log('OK  ', name, '-', detail)
  const fail = (name, detail) => { console.log('FAIL', name, '-', detail); failed++ }

  const hook = await post(HOOK_URL, '{}')
  if (hook.status === 404) {
    fail('auth-send-email deployed', 'HTTP 404 — run Deploy Supabase Edge Functions workflow')
  } else if (hook.status === 401 || hook.status === 500) {
    ok('auth-send-email deployed', `HTTP ${hook.status} (expects hook signature from Supabase Auth)`)
    if (hook.body.includes('missing_sendgrid')) {
      fail('SendGrid on Edge', 'SENDGRID_API_KEY missing — run Push SendGrid secrets to Supabase')
    }
  } else if (hook.status === 405) {
    ok('auth-send-email deployed', 'HTTP 405')
  } else {
    fail('auth-send-email deployed', `unexpected HTTP ${hook.status}`)
  }

  const verifyPage = await get(SITE_VERIFY + '/')
  if (verifyPage.status === 200 || verifyPage.status === 301 || verifyPage.status === 308) {
    ok('Live /auth/verify', 'HTTP ' + verifyPage.status)
  } else {
    fail('Live /auth/verify', 'HTTP ' + verifyPage.status)
  }

  const register = await get('https://thefranksstandard.com/auth/register/')
  if (register.status === 200) ok('Live /auth/register', 'HTTP 200')
  else fail('Live /auth/register', 'HTTP ' + register.status)

  console.log('')
  console.log('Supabase dashboard checklist (manual):')
  console.log('  Hook URL must be exactly:')
  console.log('  ' + HOOK_URL)
  console.log('  NOT a supabase.com/dashboard/... link')
  console.log('  Redirect URLs must include: ' + SITE_VERIFY)
  console.log('')
  if (failed) {
    console.log('Auth email verify: ' + failed + ' check(s) failed')
    process.exit(1)
  }
  console.log('Auth email verify: infrastructure OK — confirm with a real test signup.')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
