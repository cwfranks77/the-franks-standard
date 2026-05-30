#!/usr/bin/env node
/** Send one test mail via SendGrid API (proves key + verified sender). */
const fs = require('fs')
const path = require('path')
const https = require('https')

const cred = path.join(process.env.USERPROFILE || '', 'OneDrive', 'Documents', 'franks-standard-credentials', 'sendgrid.env')
const to = process.argv[2]
if (!to || !to.includes('@')) {
  console.error('Usage: node scripts/test-sendgrid-send.cjs you@gmail.com')
  process.exit(1)
}

const env = {}
for (const line of fs.readFileSync(cred, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const key = env.SENDGRID_API_KEY
const from = env.SENDGRID_FROM_EMAIL || 'info@thefranksstandard.com'
const name = env.SENDGRID_FROM_NAME || 'The Franks Standard'

const body = JSON.stringify({
  personalizations: [{ to: [{ email: to }] }],
  from: { email: from, name },
  subject: 'Franks Standard — SendGrid test',
  content: [{ type: 'text/plain', value: 'If you got this, SendGrid + verified sender work. Signup hook is a separate step.' }],
})

const req = https.request({
  hostname: 'api.sendgrid.com',
  path: '/v3/mail/send',
  method: 'POST',
  headers: {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let raw = ''
  res.on('data', (c) => (raw += c))
  res.on('end', () => {
    console.log('HTTP', res.statusCode)
    if (res.statusCode === 202) {
      console.log('OK — check', to, '(and spam)')
    } else {
      console.log(raw || '(no body)')
    }
    process.exit(res.statusCode === 202 ? 0 : 1)
  })
})
req.on('error', (e) => { console.error(e); process.exit(1) })
req.write(body)
req.end()
