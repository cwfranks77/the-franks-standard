/**
 * Push NUXT_PUBLIC_* vars from .env.local (or .env) to Vercel.
 * Usage: node scripts/push-vercel-env.cjs
 * Requires: vercel CLI logged in, project linked (.vercel/project.json)
 */
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const dotenv = require('dotenv')

const ROOT = path.join(__dirname, '..')
const ENVS = ['production', 'preview', 'development']

const DEFAULTS = {
  NUXT_PUBLIC_SITE_URL: 'https://thefranksstandard.com',
  NUXT_PUBLIC_PAY_LISTING_FEE_URL: 'https://buy.stripe.com/5kQfZa78O7EL8bAcqwbII09',
  NUXT_PUBLIC_PAY_PRO_SELLER_URL: 'https://buy.stripe.com/5kQfZaeBgaQX0J8duAbII0a',
  NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL: 'https://buy.stripe.com/cNiaEQeBg1gnezY4Y4bII0b',
  NUXT_PUBLIC_PAY_DISPUTE_FEE_URL: 'https://buy.stripe.com/bJe8wIal09MT8bAfCIbII0c',
  NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE: '(877) 837-0527',
}

const REQUIRED = [
  'NUXT_PUBLIC_SUPABASE_URL',
  'NUXT_PUBLIC_SUPABASE_KEY',
  'NUXT_PUBLIC_SITE_URL',
  // Either the hash (preferred) or the legacy plaintext key satisfies this.
  ['NUXT_PUBLIC_OPS_ACCESS_KEY_HASH', 'NUXT_PUBLIC_OPS_ACCESS_KEY'],
]

function loadEnvFile (file) {
  const p = path.join(ROOT, file)
  if (!fs.existsSync(p)) return {}
  return dotenv.parse(fs.readFileSync(p, 'utf8'))
}

function mergeVars () {
  const fromExample = loadEnvFile('.env')
  const fromLocal = loadEnvFile('.env.local')
  const merged = { ...DEFAULTS, ...fromExample, ...fromLocal }
  const out = {}
  for (const [k, v] of Object.entries(merged)) {
    if (!k.startsWith('NUXT_PUBLIC_')) continue
    const val = String(v || '').trim()
    if (val) out[k] = val
  }
  return out
}

function addToVercel (name, value) {
  for (const env of ENVS) {
    const r = spawnSync(
      'vercel',
      ['env', 'add', name, env, '--force'],
      {
        cwd: ROOT,
        input: value,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      },
    )
    if (r.status !== 0) {
      const err = (r.stderr || r.stdout || '').trim()
      console.error(`FAIL ${name} (${env}):`, err || `exit ${r.status}`)
      return false
    }
    console.log(`OK   ${name} → ${env}`)
  }
  return true
}

const vars = mergeVars()
const missing = REQUIRED.filter((k) => {
  if (Array.isArray(k)) return k.every((alt) => !vars[alt])
  return !vars[k]
}).map((k) => Array.isArray(k) ? k.join(' or ') : k)

console.log('Vercel env push — project:', fs.existsSync(path.join(ROOT, '.vercel', 'project.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, '.vercel', 'project.json'), 'utf8')).projectName
  : '(not linked)')

if (missing.length) {
  console.warn('\nMissing (signup will NOT work until these are in .env.local):')
  for (const k of missing) console.warn('  -', k)
  console.warn('\nGet Supabase URL + anon key: https://supabase.com/dashboard → Project → Settings → API')
  console.warn('Add them to .env.local, then run: npm run env:vercel\n')
}

const keys = Object.keys(vars).sort()
if (keys.length === 0) {
  console.error('No NUXT_PUBLIC_* variables found. Copy .env.example to .env.local and fill values.')
  process.exit(1)
}

let ok = 0
for (const k of keys) {
  if (addToVercel(k, vars[k])) ok += 1
}

console.log(`\nDone: ${ok}/${keys.length} variables × 3 environments.`)
if (missing.includes('NUXT_PUBLIC_SUPABASE_URL') || missing.includes('NUXT_PUBLIC_SUPABASE_KEY')) {
  process.exit(1)
}
