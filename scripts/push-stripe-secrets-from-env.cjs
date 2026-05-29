/**
 * Push Stripe secrets from a local .env file to Supabase Edge (no Dashboard login).
 *
 *   node scripts/push-stripe-secrets-from-env.cjs "C:\path\to\stripe-supabase.env"
 *
 * Requires: supabase CLI logged in (supabase login) or SUPABASE_ACCESS_TOKEN in env.
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'
const envPath = process.argv[2] || path.join(
  process.env.USERPROFILE || '',
  'OneDrive',
  'Documents',
  'franks-standard-credentials',
  'stripe-supabase.env',
)

if (!fs.existsSync(envPath)) {
  console.error('Env file not found:', envPath)
  process.exit(1)
}

const vars = {}
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i < 1) continue
  vars[t.slice(0, i).trim()] = t.slice(i + 1).trim()
}

const required = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
for (const k of required) {
  if (!vars[k]) {
    console.error('Missing', k, 'in', envPath)
    process.exit(1)
  }
}

const args = [
  'supabase@latest',
  'secrets',
  'set',
  `STRIPE_SECRET_KEY=${vars.STRIPE_SECRET_KEY}`,
  `STRIPE_WEBHOOK_SECRET=${vars.STRIPE_WEBHOOK_SECRET}`,
  `SITE_URL=${vars.SITE_URL || 'https://thefranksstandard.com'}`,
  `STRIPE_PLATFORM_FEE_BPS=${vars.STRIPE_PLATFORM_FEE_BPS || '500'}`,
  'STRIPE_TAX_ENABLED=true',
  '--project-ref',
  PROJECT_REF,
]

console.log('Pushing secrets to Supabase project', PROJECT_REF, '...')
console.log('(from', envPath, ')')

const r = spawnSync('npx', args, { stdio: 'inherit', shell: true })
if (r.status !== 0) {
  console.error('\nIf auth failed: run  supabase login')
  console.error('Or set SUPABASE_ACCESS_TOKEN and retry.')
  process.exit(r.status || 1)
}
console.log('\nDone. Run: npm run stripe:webhook:verify')
console.log('Then redeploy: npx supabase functions deploy stripe-webhook --no-verify-jwt --project-ref', PROJECT_REF)
