#!/usr/bin/env node
/**
 * Export all Franks Standard work files into one code bundle.
 *
 *   node scripts/export-franks-work-code.cjs
 *   node scripts/export-franks-work-code.cjs --out C:\Users\ninja\Desktop\franks-all-work.js
 */
const fs = require('fs')
const path = require('path')

const repoRoot = path.join(__dirname, '..')
const credRoot = path.join(repoRoot, '..', 'franks-standard-credentials')

const outArg = process.argv.indexOf('--out')
const outFile =
  outArg >= 0 && process.argv[outArg + 1]
    ? path.resolve(process.argv[outArg + 1])
    : path.join(
        process.env.USERPROFILE || '',
        'Desktop',
        `franks-standard-all-work-${new Date().toISOString().slice(0, 10)}.txt`,
      )

/** Repo paths (relative) — shipping, escrow, vendor terms, stripe, mail scripts */
const REPO_FILES = [
  'pages/sell.vue',
  'pages/listing/[id].vue',
  'pages/vendor-terms.vue',
  'pages/order/[id].vue',
  'layouts/default.vue',
  'package.json',
  'supabase-schema.sql',
  'supabase/migrations/024_marketplace_connect_escrow.sql',
  'supabase/migrations/025_shipping_tracker_escrow.sql',
  'supabase/migrations/033_order_stripe_tracking_canonical.sql',
  'supabase/migrations/034_listing_seller_shipping_cost.sql',
  'supabase/migrations/035_listing_shipping_cost.sql',
  'supabase/functions/create-checkout-session/index.ts',
  'supabase/functions/stripe-webhook/index.ts',
  'supabase/functions/confirm-order-receipt/index.ts',
  'supabase/functions/inventory-source-webhook/index.ts',
  'supabase/functions/shipping-tracker-webhook/index.ts',
  'supabase/functions/_shared/markOrderPaid.ts',
  'supabase/functions/_shared/dropshipStripeSplit.ts',
  'supabase/functions/_shared/marketplaceConnectEscrow.ts',
  'supabase/functions/_shared/shippingTracker.ts',
  'scripts/verify-shipping-checkout.cjs',
  'scripts/test-mailbox.cjs',
  'scripts/test-bc-audio-mailbox.cjs',
  'scripts/configure-bc-audio-mail.ps1',
  'scripts/mail-inbox-check.cjs',
  'scripts/mail-send-test.cjs',
  'scripts/backup-franks-work.ps1',
  'scripts/export-franks-work-code.cjs',
  'docs/MARKETPLACE-ESCROW-CARRIER-PAYOUT.md',
  'docs/MARKETPLACE-CONNECT-ESCROW.md',
  '.github/workflows/deploy-supabase-functions.yml',
  'utils/stripeCompliance.ts',
]

const CRED_FILES = ['email.env', 'email-bc-audio.env', 'MAILBOX-PASSWORD.txt', 'EMAIL-SETUP.md']

function banner (title) {
  const line = '='.repeat(72)
  return `\n${line}\n${title}\n${line}\n`
}

function readSafe (filePath) {
  if (!fs.existsSync(filePath)) {
    return `/* FILE MISSING: ${filePath} */\n`
  }
  return fs.readFileSync(filePath, 'utf8')
}

function extLang (filePath) {
  const ext = path.extname(filePath).slice(1) || 'text'
  const map = {
    vue: 'vue',
    ts: 'typescript',
    js: 'javascript',
    cjs: 'javascript',
    sql: 'sql',
    md: 'markdown',
    json: 'json',
    ps1: 'powershell',
    yml: 'yaml',
    env: 'ini',
    txt: 'text',
  }
  return map[ext] || ext
}

const parts = [
  banner('THE FRANKS STANDARD — FULL WORK EXPORT'),
  `Generated: ${new Date().toISOString()}\n`,
  `Repo: ${repoRoot}\n`,
  `Credentials: ${credRoot}\n`,
  '\nRun again anytime: node scripts/export-franks-work-code.cjs\n',
]

parts.push(banner('REPOSITORY FILES'))

for (const rel of REPO_FILES) {
  const full = path.join(repoRoot, rel)
  const lang = extLang(full)
  parts.push(`\n// FILE: ${rel}\n`)
  parts.push('