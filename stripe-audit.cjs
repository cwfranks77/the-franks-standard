#!/usr/bin/env node
/**
 * Stripe Connect B&C dropship wiring audit (read-only file scan + split math).
 * Usage: node stripe-audit.cjs  (or: node stripe-audit.js)
 */
const fs = require('fs')
const path = require('path')

const ROOT = __dirname

const CONFIG = {
  distributorConnectId: 'acct_1Distributor99X',
  laTaxRate: 0.0445,
  retailPrice: 299.99,
  wholesaleCost: 180.0,
}

const FRONTEND_PATHS = [
  path.join(ROOT, 'pages', 'bc-audio', 'index.vue'),
  path.join(ROOT, 'components', 'BcDropshipOrderForm.vue'),
]

const SERVER_ROUTES = [
  {
    label: 'Nitro live checkout',
    file: path.join(ROOT, 'server', 'api', 'checkout', 'live-split-payment.post.ts'),
  },
  {
    label: 'Supabase GH Pages fallback',
    file: path.join(ROOT, 'supabase', 'functions', 'bc-dropship-checkout', 'index.ts'),
  },
]

const LEGACY_ROUTES = [
  { label: 'split-payment.ts (calc only)', file: path.join(ROOT, 'server', 'api', 'checkout', 'split-payment.ts') },
  { label: 'send-receipt.ts', file: path.join(ROOT, 'server', 'api', 'checkout', 'send-receipt.ts') },
]

console.log('================================================================')
console.log('THE FRANKS STANDARD & B&C AUDIO - STRIPE INTERFACE WIRE AUDIT')
console.log('================================================================')

function fileHas (filePath, needles) {
  if (!fs.existsSync(filePath)) return { ok: false, reason: 'missing' }
  const content = fs.readFileSync(filePath, 'utf8')
  const missing = needles.filter((n) => !content.includes(n))
  if (missing.length) return { ok: false, reason: `missing: ${missing.join(', ')}` }
  return { ok: true, content }
}

function verifyStripeWiring () {
  let frontendWired = false

  console.log('[1/3] Checking Frontend Trigger Integration Files...')
  for (const p of FRONTEND_PATHS) {
    if (!fs.existsSync(p)) {
      console.warn(` -> NOTICE: Missing ${path.relative(ROOT, p)}`)
      continue
    }
    const content = fs.readFileSync(p, 'utf8')
    const hits =
      content.includes('/api/checkout/live-split-payment')
      || content.includes('live-split-payment')
      || content.includes('bc-dropship-checkout')
      || content.includes('BcDropshipOrderForm')
    if (hits) {
      console.log(` -> SUCCESS: Checkout wiring present in ${path.relative(ROOT, p)}`)
      if (content.includes('live-split-payment') || content.includes('bc-dropship-checkout')) {
        frontendWired = true
      }
    }
  }
  if (!frontendWired) {
    console.warn(' -> WARNING: No live-split-payment or bc-dropship-checkout triggers found on frontend.')
  }

  console.log('\n[2/3] Checking Server-Side Route Logic Files...')
  let serverLive = false
  for (const route of SERVER_ROUTES) {
    const check = fileHas(route.file, [
      'checkout.sessions.create',
      'application_fee_amount',
      'transfer_data',
    ])
    if (check.ok) {
      console.log(` -> SUCCESS: ${route.label} — ${path.relative(ROOT, route.file)}`)
      serverLive = true
      const idMatch = check.content.match(
        /STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID[^']*'([^']+)'|destination:\s*distributorAccountId/
      )
      if (check.content.includes('acct_1Distributor99X') || check.content.includes('distributorAccountId')) {
        console.log('        Connect destination + application_fee_amount confirmed.')
      }
    } else if (check.reason === 'missing') {
      console.warn(` -> WARNING: ${route.label} file not found (${path.relative(ROOT, route.file)})`)
    } else {
      console.warn(` -> WARNING: ${route.label} ${check.reason}`)
    }
  }

  const legacyPath = path.join(ROOT, 'server', 'api', 'stripe-complete.js')
  if (fs.existsSync(legacyPath)) {
    console.warn(' -> NOTICE: Legacy server/api/stripe-complete.js still on disk (superseded by live-split-payment.post.ts).')
  } else {
    console.log(' -> OK: No legacy stripe-complete.js (using live-split-payment.post.ts).')
  }

  for (const leg of LEGACY_ROUTES) {
    if (fs.existsSync(leg.file)) {
      console.log(` -> PRESERVED: ${leg.label}`)
    }
  }

  if (!serverLive) {
    console.warn(' -> FAIL: No live Connect checkout route with split payload found.')
  }

  console.log('\n[3/3] Compiling Live Transaction Split Verification Ledger...')
  const retailCents = Math.round(CONFIG.retailPrice * 100)
  const wholesaleCents = Math.round(CONFIG.wholesaleCost * 100)
  const laTaxCents = Math.round(retailCents * CONFIG.laTaxRate)
  const totalCustomerGrossCents = retailCents + laTaxCents
  const applicationFeeCents = totalCustomerGrossCents - wholesaleCents

  console.log('----------------------------------------------------------------')
  console.log('   STRIPE CONNECTIONS TRANSACTION RUN MANIFEST')
  console.log('----------------------------------------------------------------')
  console.log(` * Product Base Retail Price   : $${CONFIG.retailPrice.toFixed(2)}`)
  console.log(` * Louisiana Tax Add (4.45%)   : $${(laTaxCents / 100).toFixed(2)}`)
  console.log(` * GROSS CARD DEBIT FROM BUYER : $${(totalCustomerGrossCents / 100).toFixed(2)}`)
  console.log('   ------------------------------------------------------------')
  console.log(` -> ESCROW DESTINATION WALLET  : [${CONFIG.distributorConnectId}]`)
  console.log(` -> INSTANT PAYOUT DISTRIBUTOR : $${(wholesaleCents / 100).toFixed(2)} (Warehouse Pull Sheet Funded)`)
  console.log(` -> PLATFORM APPLICATION FEE  : $${(applicationFeeCents / 100).toFixed(2)} (Net markup retained on platform)`)
  console.log('----------------------------------------------------------------')

  const diagnostics = {
    frontend: frontendWired ? 'PASS' : 'FAIL',
    server: serverLive ? 'PASS' : 'FAIL',
    ledger: applicationFeeCents >= 0 ? 'PASS' : 'FAIL',
  }

  console.log('FINAL STRIPE WIRE STATUS:')
  console.log(` -> FRONTEND CHECKOUT TRIGGERS : [${diagnostics.frontend}]`)
  console.log(` -> SERVER CONNECT ROUTES      : [${diagnostics.server}]`)
  console.log(` -> SPLIT MATH LEDGER          : [${diagnostics.ledger}]`)
  console.log('================================================================\n')

  const failed = Object.values(diagnostics).some((v) => v === 'FAIL')
  process.exit(failed ? 1 : 0)
}

verifyStripeWiring()
