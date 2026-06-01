#!/usr/bin/env node
/**
 * Guard against signup confirmation regressions.
 *
 * Auth email links should land directly on /auth/verify with token_hash so the
 * static Nuxt app can call supabase.auth.verifyOtp(). Sending users first to
 * /auth/v1/verify can confirm server-side without establishing the browser
 * session reliably, which led users to see "email not confirmed" at login.
 */
const fs = require('fs')
const path = require('path')

const hookPath = path.join(__dirname, '..', 'supabase', 'functions', 'auth-send-email', 'index.ts')
const verifyPath = path.join(__dirname, '..', 'pages', 'auth', 'verify.vue')
const hook = fs.readFileSync(hookPath, 'utf8')
const verify = fs.readFileSync(verifyPath, 'utf8')

function fail (message) {
  console.error('FAIL', message)
  process.exit(1)
}

if (!hook.includes('new URL(`${SITE_URL}/auth/verify`)')) {
  fail('auth-send-email must build confirmation links to SITE_URL/auth/verify')
}
if (hook.includes('/auth/v1/verify')) {
  fail('auth-send-email should not send users directly through /auth/v1/verify')
}
if (!hook.includes("url.searchParams.set('token_hash'")) {
  fail('auth-send-email must include token_hash in confirmation links')
}
if (!verify.includes('verifyTokenHashWithFallback')) {
  fail('verify page must use token_hash fallback verification')
}
if (!verify.includes("candidates.push('email')") || !verify.includes("candidates.push('signup')")) {
  fail('verify page must try both signup and email aliases for token_hash confirmation')
}

console.log('OK auth confirmation links route through /auth/verify with token_hash fallback.')
