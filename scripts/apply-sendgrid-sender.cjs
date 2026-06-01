/**
 * Create SendGrid verified sender via API (no browser form).
 * Reads franks-standard-credentials/sendgrid.env
 *
 * Optional env in sendgrid.env:
 *   SENDGRID_SENDER_ADDRESS=123 Your St
 *   SENDGRID_SENDER_CITY=Merryville
 *   SENDGRID_SENDER_STATE=LA
 *   SENDGRID_SENDER_ZIP=70653
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

const credEnv = path.join(
  process.env.USERPROFILE || '',
  'OneDrive',
  'Documents',
  'franks-standard-credentials',
  'sendgrid.env',
)

function loadEnv (p) {
  const out = {}
  if (!fs.existsSync(p)) return out
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

function request (method, apiPath, key, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request(
      {
        hostname: 'api.sendgrid.com',
        path: apiPath,
        method,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          let parsed = raw
          try {
            parsed = raw ? JSON.parse(raw) : null
          } catch {
            parsed = raw
          }
          resolve({ status: res.statusCode, body: parsed })
        })
      },
    )
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function main () {
  const env = loadEnv(credEnv)
  const key = env.SENDGRID_API_KEY || ''
  if (!key.startsWith('SG.')) {
    console.error('Missing SENDGRID_API_KEY in', credEnv)
    process.exit(1)
  }

  const fromEmail = env.SENDGRID_FROM_EMAIL || 'info@thefranksstandard.com'
  const fromName = env.SENDGRID_FROM_NAME || 'The Franks Standard'

  const list = await request('GET', '/v3/verified_senders', key)
  if (list.status === 200 && Array.isArray(list.body?.results)) {
    const existing = list.body.results.find(
      (s) => String(s.from_email || '').toLowerCase() === fromEmail.toLowerCase(),
    )
    if (existing) {
      console.log('Sender already exists:', fromEmail)
      console.log('  id:', existing.id)
      console.log('  verified:', existing.verified)
      if (!existing.verified) {
        console.log('  → Check info@ inbox for SendGrid verification email and click the link.')
      } else {
        console.log('  → Sender is verified. Signup email should work.')
      }
      process.exit(0)
    }
  }

  const payload = {
    nickname: 'Franks Standard — Auth Email',
    from_email: fromEmail,
    from_name: fromName,
    reply_to: fromEmail,
    reply_to_name: fromName,
    address: env.SENDGRID_SENDER_ADDRESS || 'PO Box 1',
    address2: '',
    city: env.SENDGRID_SENDER_CITY || 'Merryville',
    state: env.SENDGRID_SENDER_STATE || 'LA',
    zip: env.SENDGRID_SENDER_ZIP || '70653',
    country: 'United States',
  }

  const create = await request('POST', '/v3/verified_senders', key, payload)
  if (create.status === 201 || create.status === 200) {
    console.log('Created verified sender request for', fromEmail)
    console.log('  id:', create.body?.id)
    console.log('  verified:', create.body?.verified)
    console.log('  → SendGrid sent a verification email to', fromEmail)
    console.log('  → Open Namecheap webmail for info@ and click the verify link (one click).')
    process.exit(0)
  }

  if (create.status === 400 && JSON.stringify(create.body).includes('already')) {
    console.log('Sender may already exist. Check SendGrid → Sender Authentication.')
    process.exit(0)
  }

  if (create.status === 403) {
    console.error('SendGrid returned 403 — your API key only has Mail Send permission.')
    console.error('')
    console.error('On your phone (SendGrid app or browser):')
    console.error('  1. Settings → API Keys → edit "Franks Standard — Production — Auth Email"')
    console.error('  2. Under Restricted Access, set Sender Verification → Full Access')
    console.error('  3. Save, then run: npm run sendgrid:apply-sender')
    console.error('')
    console.error('OR finish "Create a Sender" in the dashboard once (paste from SENDGRID-SENDER-FORM.txt).')
    process.exit(1)
  }

  console.error('SendGrid API error', create.status)
  console.error(JSON.stringify(create.body, null, 2))
  process.exit(1)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
