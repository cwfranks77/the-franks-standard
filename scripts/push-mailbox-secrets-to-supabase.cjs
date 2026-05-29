/**
 * Push Namecheap mailbox SMTP creds to Supabase Edge (auth-send-email).
 * Reads franks-standard-credentials/email.env — never commit that file.
 *
 *   npm run mail:push-supabase
 *
 * Requires: SUPABASE_ACCESS_TOKEN in env or `supabase login`
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'
const CRED_PATHS = [
  path.join(process.env.USERPROFILE || process.env.HOME || '', 'OneDrive', 'Documents', 'franks-standard-credentials', 'email.env'),
  path.join(__dirname, '..', '..', 'franks-standard-credentials', 'email.env'),
  path.join(__dirname, '..', 'email.env'),
]

function loadEnv () {
  for (const p of CRED_PATHS) {
    if (!fs.existsSync(p)) continue
    const out = {}
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].trim()
    }
    if (out.EMAIL_USER && out.EMAIL_PASS) return { ...out, source: p }
  }
  return null
}

const env = loadEnv()
if (!env) {
  console.error('email.env not found. Expected franks-standard-credentials/email.env with EMAIL_USER and EMAIL_PASS.')
  process.exit(1)
}

const user = env.EMAIL_USER
const pass = env.EMAIL_PASS
const from = env.EMAIL_FROM || user

const args = [
  'supabase@latest',
  'secrets',
  'set',
  `SMTP_HOST=mail.privateemail.com`,
  `SMTP_PORT=587`,
  `SMTP_USER=${user}`,
  `SMTP_PASS=${pass}`,
  `SMTP_FROM=${from}`,
  `SMTP_FROM_NAME=The Franks Standard`,
  `SITE_URL=https://thefranksstandard.com`,
  '--project-ref',
  PROJECT_REF,
]

console.log('Pushing mailbox SMTP secrets to Supabase', PROJECT_REF)
console.log('(from', env.source, ', user', user, ')')

const r = spawnSync('npx', args, { stdio: 'inherit', shell: true, env: process.env })
process.exit(r.status === 0 ? 0 : 1)
