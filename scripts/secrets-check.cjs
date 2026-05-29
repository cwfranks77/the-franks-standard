/**
 * Shows which API secrets are configured (values never printed).
 *   npm run secrets:check
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const GROUPS = [
  {
    title: 'Site live (GitHub Actions — repo Settings → Secrets → Actions)',
    vars: [
      ['NUXT_PUBLIC_SUPABASE_URL', true],
      ['NUXT_PUBLIC_SUPABASE_KEY', true],
      ['NUXT_PUBLIC_OPS_ACCESS_KEY', false],
      ['NUXT_PUBLIC_OPS_ACCESS_KEY_HASH', false],
      ['NUXT_PUBLIC_SITE_URL', false],
      ['NUXT_PUBLIC_PAY_LISTING_FEE_URL', false],
      ['NUXT_PUBLIC_PAY_PRO_SELLER_URL', false],
      ['NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL', false],
    ],
    note: 'Need Supabase URL + anon key. Ops: set OPS_ACCESS_KEY or its HASH (hash preferred).',
  },
  {
    title: 'Email campaigns (local .env only — never commit)',
    vars: [
      ['SENDGRID_API_KEY', true],
      ['SENDGRID_FROM_EMAIL', false],
      ['SENDGRID_FROM_NAME', false],
    ],
    note: 'Free tier: https://app.sendgrid.com/settings/api_keys — Mail Send permission.',
  },
  {
    title: 'Postcard mail — Lob (local .env only)',
    vars: [
      ['LOB_API_KEY', true],
      ['LOB_POSTCARD_FRONT_URL', true],
    ],
    note: 'Free test key starts with test_ — no real mail. live_ + wallet for real postcards.',
  },
  {
    title: 'Search ping (local .env, optional)',
    vars: [['INDEXNOW_KEY', false]],
    note: 'Optional. Also host https://yoursite.com/{key}.txt on the site.',
  },
  {
    title: 'Social post script (local .env or GitHub secrets)',
    vars: [
      ['FACEBOOK_PAGE_ACCESS_TOKEN', false],
      ['FACEBOOK_PAGE_ID', false],
      ['TELEGRAM_BOT_TOKEN', false],
      ['TELEGRAM_CHANNEL_ID', false],
      ['TELEGRAM_NOTIFY_CHAT_ID', false],
      ['INSTAGRAM_BUSINESS_ACCOUNT_ID', false],
      ['X_API_KEY', false],
      ['X_ACCESS_TOKEN', false],
    ],
    note: 'TELEGRAM_NOTIFY_CHAT_ID = your personal Telegram chat id for post alerts. See docs/META-FACEBOOK-SETUP.md',
  },
  {
    title: 'Paid Meta ads (optional — bots create PAUSED campaigns)',
    vars: [
      ['META_AD_ACCOUNT_ID', false],
      ['META_AD_ACCESS_TOKEN', false],
      ['META_ADS_DAILY_BUDGET_USD', false],
      ['META_ADS_STATUS', false],
    ],
    note: 'Set META_ADS_LIVE=1 only when ready. Dry-run: npm run ads:meta:dry. See docs/ADS-AUTOMATION-SETUP.md',
  },
]

function status (name) {
  const v = String(process.env[name] || '').trim()
  if (!v) return { ok: false, hint: 'missing' }
  if (name.includes('KEY') || name.includes('SECRET') || name.includes('TOKEN')) {
    return { ok: true, hint: `set (${v.length} chars, starts ${v.slice(0, 4)}…)` }
  }
  return { ok: true, hint: `set (${v.length} chars)` }
}

function main () {
  const envPath = path.join(__dirname, '..', '.env')
  console.log('Secrets check — values are NOT shown\n')
  console.log(envPath, fs.existsSync(envPath) ? '(found)' : '(missing — copy .env.example to .env)\n')

  let missingRequired = 0

  for (const g of GROUPS) {
    console.log('—', g.title)
    if (g.note) console.log(' ', g.note)
    for (const [name, required] of g.vars) {
      const s = status(name)
      const tag = s.ok ? 'OK ' : required ? '!! ' : '   '
      console.log(`  ${tag} ${name} — ${s.hint}`)
      if (required && !s.ok) missingRequired++
    }
    console.log('')
  }

  const hasOps =
    !!String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || '').trim() ||
    !!String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH || '').trim()
  if (!hasOps) {
    console.log('!! Operator unlock: set NUXT_PUBLIC_OPS_ACCESS_KEY in .env AND GitHub Actions secrets')
    missingRequired++
  }

  console.log('GitHub: https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions')
  console.log('Docs: docs/API-SECRETS-SETUP.md')
  console.log('')
  if (missingRequired) {
    console.log(`Required items missing locally: ${missingRequired}`)
    process.exit(1)
  }
  console.log('Core local checks passed.')
}

main()
