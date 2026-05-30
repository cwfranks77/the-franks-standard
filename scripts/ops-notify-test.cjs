#!/usr/bin/env node
/**
 * Fire a test ops alert through ops-incident-action (requires ops key + deployed functions).
 *
 * Usage:
 *   OPS_ACCESS_KEY="your phrase" npm run ops:notify:test
 *   OPS_ACCESS_KEY="your phrase" npm run ops:notify:test -- --resolved
 *
 * Env (Supabase Edge secrets — must be set for delivery):
 *   OPS_NOTIFY_ENABLED=true
 *   NTFY_TOPIC=your-private-topic   OR   OPS_ALERT_PHONE=+1...
 */
const https = require('https')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'
const sbUrl = (process.env.NUXT_PUBLIC_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`).replace(/\/+$/, '')
const opsKey = process.env.OPS_ACCESS_KEY || process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || ''
const kind = process.argv.includes('--resolved') ? 'resolved' : 'new'

function post (url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let d = ''
      res.on('data', (c) => { d += c })
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

;(async () => {
  if (!opsKey) {
    console.error('Set OPS_ACCESS_KEY (same phrase as ops toolkit unlock)')
    process.exit(1)
  }

  const payload = {
    action: 'test_notify',
    ops_key: opsKey,
    kind,
    severity: 'critical',
    message: kind === 'new'
      ? 'Test ALERT from npm run ops:notify:test'
      : undefined,
    fix_summary: kind === 'resolved'
      ? 'Test fix — pipeline OK'
      : undefined,
  }

  const url = `${sbUrl}/functions/v1/ops-incident-action`
  console.log('[ops:notify:test]', kind, '→', url)

  const r = await post(url, payload)
  let parsed = {}
  try { parsed = JSON.parse(r.body) } catch { /* */ }

  console.log('HTTP', r.status)
  console.log(JSON.stringify(parsed, null, 2))

  if (r.status !== 200) process.exit(1)
  const notify = parsed.notify || {}
  if ((notify.sent || []).length === 0) {
    console.log('\nNo channels delivered. Check Supabase secrets: OPS_NOTIFY_ENABLED, NTFY_TOPIC or OPS_ALERT_PHONE')
    process.exit(2)
  }
  console.log('\nCheck your phone / ntfy app.')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
