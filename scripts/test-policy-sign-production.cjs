#!/usr/bin/env node
/**
 * Production diagnostics for seller policy signing (no guessing).
 * Usage: node scripts/test-policy-sign-production.cjs
 */
require('dotenv').config()
const https = require('https')
const fs = require('fs')
const path = require('path')

const base = (process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '')
const anon = process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

function http (method, urlPath, body, bearer) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : ''
    const u = new URL(base + urlPath)
    const req = https.request(u, {
      method,
      headers: {
        apikey: bearer || anon,
        Authorization: 'Bearer ' + (bearer || anon),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let d = ''
      res.on('data', (c) => { d += c })
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

function getPage (url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'tfs-policy-test' } }, (res) => {
      let d = ''
      res.on('data', (c) => { d += c })
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    }).on('error', reject)
  })
}

async function main () {
  const fails = []

  console.log('\n--- Site pages ---')
  for (const url of ['https://thefranksstandard.com/', 'https://thefranksstandard.com/sell/']) {
    const p = await getPage(url)
    const build = (p.body.match(/buildId:"([^"]+)"/) || [])[1] || 'unknown'
    console.log(p.status, build, url)
    if (p.status >= 500) fails.push(`${url} HTTP ${p.status}`)
  }

  console.log('\n--- Live bundle uses RPC? ---')
  const sell = await getPage('https://thefranksstandard.com/sell/')
  const jsUrls = [...sell.body.matchAll(/\/_nuxt\/[A-Za-z0-9_-]+\.js/g)].map((m) => m[0])
  let hasRpc = false
  let hasEdge = false
  for (const rel of jsUrls.slice(0, 40)) {
    const j = await getPage('https://thefranksstandard.com' + rel)
    if (j.body.includes('record_seller_policy_acceptance')) hasRpc = true
    if (j.body.includes('accept-seller-policies')) hasEdge = true
  }
  console.log('record_seller_policy_acceptance in sell chunks:', hasRpc)
  console.log('accept-seller-policies in sell chunks:', hasEdge)
  if (!hasRpc) fails.push('Deployed /sell JS does NOT call record_seller_policy_acceptance RPC')

  console.log('\n--- PostgREST RPC (no auth → expect 401 or json error, NOT 500) ---')
  const rpcNoAuth = await http('POST', '/rest/v1/rpc/record_seller_policy_acceptance', {
    p_legal_name: 'Test User',
    p_policy_version: '2026-05-29',
    p_documents: { terms: true, marketplace_policy: true, seller_agreement: true, prohibited_items: true, privacy: true },
  }, anon)
  console.log(rpcNoAuth.status, rpcNoAuth.body.slice(0, 400))
  if (rpcNoAuth.status >= 500) fails.push(`RPC without auth returned HTTP ${rpcNoAuth.status}: ${rpcNoAuth.body.slice(0, 200)}`)

  console.log('\n--- RPC missing function? (404/PGRST202) ---')
  if (/PGRST202|Could not find/i.test(rpcNoAuth.body)) {
    fails.push('RPC record_seller_policy_acceptance NOT deployed to database')
  }

  if (!svc) {
    console.log('\nSKIP signed-in test: SUPABASE_SERVICE_ROLE_KEY not in .env')
    console.log('Set it locally to run full sign simulation.')
  } else {
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(base, svc, { auth: { persistSession: false } })

    const email = process.env.TEST_SELLER_EMAIL || process.env.NUXT_PUBLIC_OWNER_NOTIFY_EMAIL || 'info@thefranksstandard.com'
    console.log('\n--- Signed-in RPC test via passwordless session ---')
    console.log('Test email:', email)

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })
    if (linkErr) {
      console.log('generateLink failed:', linkErr.message)
      fails.push('Could not generate test auth link: ' + linkErr.message)
    } else {
      const tokenHash = linkData?.properties?.hashed_token
      if (!tokenHash) {
        console.log('No hashed_token in generateLink response')
      } else {
        const anonClient = createClient(base, anon)
        const { data: sess, error: sessErr } = await anonClient.auth.verifyOtp({
          type: 'magiclink',
          token_hash: tokenHash,
        })
        if (sessErr) {
          console.log('verifyOtp failed:', sessErr.message)
          fails.push('Test session failed: ' + sessErr.message)
        } else if (sess?.session?.access_token) {
          const token = sess.session.access_token
          const userId = sess.user.id
          console.log('Session OK user', userId)

          const rpcSigned = await http('POST', '/rest/v1/rpc/record_seller_policy_acceptance', {
            p_legal_name: 'Production Test Signer',
            p_policy_version: '2026-05-29',
            p_documents: {
              terms: true,
              marketplace_policy: true,
              seller_agreement: true,
              prohibited_items: true,
              privacy: true,
            },
          }, token)
          console.log('RPC signed-in:', rpcSigned.status, rpcSigned.body.slice(0, 500))
          if (rpcSigned.status >= 500) {
            fails.push(`RPC signed-in HTTP ${rpcSigned.status}: ${rpcSigned.body.slice(0, 300)}`)
          } else {
            let parsed
            try { parsed = JSON.parse(rpcSigned.body) } catch { parsed = null }
            if (parsed?.error) fails.push(`RPC returned error: ${parsed.message || parsed.error}`)
            if (!parsed?.ok) fails.push('RPC did not return ok:true — ' + rpcSigned.body.slice(0, 200))
          }

          const prof = await admin.from('profiles').select('seller_policies_version,seller_policies_accepted_at').eq('id', userId).maybeSingle()
          console.log('Profile after RPC:', prof.data, prof.error?.message || '')
        }
      }
    }
  }

  console.log('\n--- Summary ---')
  if (fails.length) {
    console.log('FAILURES:')
    fails.forEach((f) => console.log(' -', f))
    process.exit(1)
  }
  console.log('All automated checks passed.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
