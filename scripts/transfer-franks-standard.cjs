#!/usr/bin/env node
/**
 * TRANSFER SCRIPT — bundles all Franks Standard work into one portable file.
 *
 * Run (creates bundle in repo + Desktop):
 *   node scripts/transfer-franks-standard.cjs
 *
 * Custom output:
 *   node scripts/transfer-franks-standard.cjs --out "D:\USB\franks-transfer.txt"
 *
 * Copy THIS SCRIPT + the generated .bundle.txt to another PC.
 * Restore: unzip full repo from backup OR paste sections back into matching paths.
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const repoRoot = path.join(__dirname, '..')
const credRoot = path.join(repoRoot, '..', 'franks-standard-credentials')
const stamp = new Date().toISOString().slice(0, 10)

const outArg = process.argv.indexOf('--out')
const outCustom = outArg >= 0 && process.argv[outArg + 1] ? path.resolve(process.argv[outArg + 1]) : null
const outPaths = [
  outCustom,
  path.join(repoRoot, `TRANSFER-franks-standard.bundle.txt`),
  path.join(process.env.USERPROFILE || '', 'Desktop', `TRANSFER-franks-standard-${stamp}.txt`),
].filter(Boolean)
const uniqueOut = [...new Set(outPaths.map((p) => path.resolve(p)))]

const REPO_FILES = [
  'pages/sell.vue',
  'pages/listing/[id].vue',
  'pages/vendor-terms.vue',
  'pages/order/[id].vue',
  'pages/how-it-works.vue',
  'pages/prohibited-items.vue',
  'pages/auth/register.vue',
  'pages/store-builder.vue',
  'pages/store/[slug].vue',
  'layouts/default.vue',
  'package.json',
  'package-lock.json',
  'supabase-schema.sql',
  'assets/css/main.css',
  'composables/useAiSupport.ts',
  'utils/stripeCompliance.ts',
  'utils/marketplaceCategories.ts',
  'utils/authenticityScan.js',
  'supabase/migrations/024_marketplace_connect_escrow.sql',
  'supabase/migrations/025_shipping_tracker_escrow.sql',
  'supabase/migrations/033_order_stripe_tracking_canonical.sql',
  'supabase/migrations/034_listing_seller_shipping_cost.sql',
  'supabase/migrations/035_listing_shipping_cost.sql',
  'supabase/functions/create-checkout-session/index.ts',
  'supabase/functions/stripe-webhook/index.ts',
  'supabase/functions/confirm-order-receipt/index.ts',
  'supabase/functions/inventory-source-webhook/index.ts',
  'supabase/functions/inventory-source-dispatch/index.ts',
  'supabase/functions/mark-order-shipped/index.ts',
  'supabase/functions/stripe-connect-onboard/index.ts',
  'supabase/functions/stripe-connect-sync/index.ts',
  'supabase/functions/shipping-tracker-webhook/index.ts',
  'supabase/functions/_shared/markOrderPaid.ts',
  'supabase/functions/_shared/dropshipStripeSplit.ts',
  'supabase/functions/_shared/marketplaceConnectEscrow.ts',
  'supabase/functions/_shared/shippingTracker.ts',
  'supabase/functions/_shared/authenticityScan.ts',
  'scripts/verify-shipping-checkout.cjs',
  'scripts/test-mailbox.cjs',
  'scripts/test-bc-audio-mailbox.cjs',
  'scripts/configure-bc-audio-mail.ps1',
  'scripts/mail-inbox-check.cjs',
  'scripts/mail-send-test.cjs',
  'scripts/backup-franks-work.ps1',
  'scripts/export-franks-work-code.cjs',
  'scripts/transfer-franks-standard.cjs',
  'scripts/inject-spa-fallback.cjs',
  'scripts/namecheap-recover.ps1',
  'docs/MARKETPLACE-ESCROW-CARRIER-PAYOUT.md',
  'docs/MARKETPLACE-CONNECT-ESCROW.md',
  'docs/STRIPE-FULL-PAYMENTS.md',
  'docs/WHAT-BROKE-2026-05.md',
  'docs/GOOGLE-WORKSPACE-SETUP.md',
  'docs/SIGNUP-EMAIL-FIX.md',
  '.github/workflows/deploy-supabase-functions.yml',
]

const CRED_FILES = ['email.env', 'email-bc-audio.env', 'MAILBOX-PASSWORD.txt', 'EMAIL-SETUP.md']

const WORK_RECORD = `
WORK RECORD (last session)
==========================
Repo root: ${repoRoot}
Credentials: ${credRoot}
Live site: https://thefranksstandard.com

SHIPPING + CHECKOUT
- sell.vue: Shipping Cost field; shipping_cost on publish
- create-checkout-session: Stripe amount = retail + shipping; escrow includes shipping
- SQL: 034_listing_seller_shipping_cost.sql, 035_listing_shipping_cost.sql

ESCROW + CARRIER PAYOUT
- migrations 024, 025, 033; marketplaceConnectEscrow.ts; shipping-tracker-webhook
- Payout on carrier delivered (tracking webhook)

VENDOR TERMS
- pages/vendor-terms.vue; footer link in layouts/default.vue

EMAIL (Namecheap Private Email — mail.privateemail.com)
- info@ + bc-audio@ — IMAP 993 SSL, SMTP 587 STARTTLS
- Cred files in franks-standard-credentials/

DEPLOY CHECKLIST
1. Run SQL 024, 025, 033, 034, 035 on Supabase
2. Deploy edge functions (create-checkout-session, stripe-webhook, shipping-tracker-webhook)
3. Deploy static site for UI changes
4. Re-list products with shipping cost where needed
`

function banner (title) {
  const line = '='.repeat(72)
  return `\n${line}\n${title}\n${line}\n`
}

function readSafe (filePath) {
  if (!fs.existsSync(filePath)) return `/* FILE MISSING: ${filePath} */\n`
  return fs.readFileSync(filePath, 'utf8')
}

function extLang (filePath) {
  const ext = path.extname(filePath).slice(1) || 'text'
  const map = {
    vue: 'vue', ts: 'typescript', js: 'javascript', cjs: 'javascript',
    sql: 'sql', md: 'markdown', json: 'json', ps1: 'powershell', yml: 'yaml', env: 'ini', txt: 'text', css: 'css',
  }
  return map[ext] || ext
}

const parts = [
  banner('THE FRANKS STANDARD — TRANSFER BUNDLE'),
  `Generated: ${new Date().toISOString()}\n`,
  `Transfer script: ${path.join(repoRoot, 'scripts/transfer-franks-standard.cjs')}\n`,
  WORK_RECORD,
]

parts.push(banner('REPOSITORY SOURCE FILES'))
for (const rel of REPO_FILES) {
  const full = path.join(repoRoot, rel)
  parts.push(`\n@@@ FILE: ${rel} @@@\n`)
  parts.push('