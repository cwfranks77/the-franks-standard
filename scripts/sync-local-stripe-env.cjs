/**
 * Merge Stripe + Supabase local vars into .env.local (never commit .env.local).
 *   node scripts/sync-local-stripe-env.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const LOCAL = path.join(ROOT, '.env.local')
const STRIPE_ENV = path.join(
  process.env.USERPROFILE || '',
  'OneDrive',
  'Documents',
  'franks-standard-credentials',
  'stripe-supabase.env',
)

const SUPABASE_URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co'
const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'

function parseEnv (text) {
  const out = {}
  for (const line of String(text || '').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

function upsertLines (raw, pairs) {
  const lines = raw.split(/\r?\n/)
  const keys = new Set()
  const merged = lines.map((line) => {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) return line
    const key = t.slice(0, t.indexOf('=')).trim()
    if (Object.prototype.hasOwnProperty.call(pairs, key)) {
      keys.add(key)
      return `${key}=${pairs[key]}`
    }
    return line
  })
  for (const [key, val] of Object.entries(pairs)) {
    if (!keys.has(key)) merged.push(`${key}=${val}`)
  }
  return merged.join('\n').replace(/\n*$/, '\n')
}

function fetchAnonKey () {
  const r = spawnSync(
    'npx',
    ['supabase@latest', 'projects', 'api-keys', '--project-ref', PROJECT_REF],
    { encoding: 'utf8', shell: true },
  )
  if (r.status !== 0) return ''
  const m = r.stdout.match(/anon\s*\|\s*(eyJ[^\s|]+)/)
  return m ? m[1].trim() : ''
}

function main () {
  if (!fs.existsSync(STRIPE_ENV)) {
    console.error('Missing', STRIPE_ENV)
    process.exit(1)
  }

  const stripeVars = parseEnv(fs.readFileSync(STRIPE_ENV, 'utf8'))
  const anon = fetchAnonKey()
  const localRaw = fs.existsSync(LOCAL) ? fs.readFileSync(LOCAL, 'utf8') : '# Local only — never commit.\n'

  const inject = {
    NUXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    STRIPE_SECRET_KEY: stripeVars.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: stripeVars.STRIPE_WEBHOOK_SECRET || '',
    NUXT_PUBLIC_STRIPE_CHECKOUT_ENABLED: 'true',
    NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL: 'https://www.bcpoweraudio.com',
    NUXT_PUBLIC_SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.bcpoweraudio.com',
  }
  if (anon) inject.NUXT_PUBLIC_SUPABASE_KEY = anon
  if (stripeVars.STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID) {
    inject.STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID = stripeVars.STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID
  }

  const next = upsertLines(localRaw, inject)
  fs.writeFileSync(LOCAL, next, 'utf8')
  console.log('Updated .env.local with Stripe + Supabase checkout vars (secrets not printed).')
  if (!anon) console.warn('Could not fetch anon key — run: supabase login')
}

main()
