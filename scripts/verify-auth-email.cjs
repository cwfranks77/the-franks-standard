#!/usr/bin/env node
/**
 * Verifies auth signup email plumbing (hook deployed + redirect URLs documented).
 * Does NOT send a real signup — use a test Gmail after this passes.
 */
const https = require('https')

const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'
const HOOK_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/auth-send-email`
const SITE_VERIFY = 'https://thefranksstandard.com/auth/verify'
const TEST_KEY = (process.env.AUTH_EMAIL_TEST_KEY || '').trim()
const TEST_TO = (process.env.AUTH_EMAIL_TEST_TO || '').trim()

function post (url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
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
  } else if (hook.status === 500 && hook.body.includes('missing_send_email_hook_secret')) {
    fail('Auth hook secret on Edge', 'SEND_EMAIL_HOOK_SECRET missing — see docs/SIGNUP-EMAIL-FIX.md')
  } else if (hook.status === 401 || hook.status === 500) {
    ok('auth-send-email deployed', `HTTP ${hook.status} (expects hook signature from Supabase Auth)`)
    if (hook.body.includes('missing_sendgrid') || hook.body.includes('sendgrid')) {
      fail('SendGrid on Edge', 'SENDGRID_API_KEY missing — run mail:sync-sendgrid + deploy workflow')
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

  if (TEST_KEY && TEST_TO) {
    const test = await post(HOOK_URL, JSON.stringify({ to: TEST_TO }), {
      'x-auth-email-test-key': TEST_KEY,
    })
    if (test.status === 200 && test.body.includes('"ok":true')) {
      ok('Auth email provider send', `HTTP 200 ${test.body}`)
    } else {
      fail('Auth email provider send', `HTTP ${test.status} ${test.body.slice(0, 240)}`)
    }
  } else {
    console.log('SKIP Auth email provider send - set AUTH_EMAIL_TEST_KEY and AUTH_EMAIL_TEST_TO to send a controlled test email')
  }

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
