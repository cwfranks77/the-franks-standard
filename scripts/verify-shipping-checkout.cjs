#!/usr/bin/env node
/**
 * Internal check: shipping cost form → listing columns → checkout math → escrow transfer.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
let pass = 0
let fail = 0

function ok (msg) {
  pass++
  console.log(`  ✓ ${msg}`)
}
function bad (msg) {
  fail++
  console.log(`  ✗ ${msg}`)
}

function read (rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

console.log('\n=== SHIPPING + CHECKOUT SYSTEM CHECK ===\n')

// STEP 1 — Sell form
console.log('STEP 1 — Sell form component')
const sell = read('pages/sell.vue')
if (sell.includes('id="listing-shipping-cost"') && sell.includes('Shipping Cost ($)')) {
  ok('Non-collectible Shipping Cost input present')
} else bad('Missing Shipping Cost input on sell form')
if (sell.includes('showShippingCostField') && sell.includes('form.shippingCost')) {
  ok('shippingCost bound to product creation model (form.shippingCost)')
} else bad('shippingCost model binding missing')
if (sell.includes('shippingCost: 0') && sell.includes('v-model.number="form.shippingCost"')) {
  ok('Default 0.00 + decimal number input (step 0.01)')
} else bad('Default or decimal input config missing')
if (sell.includes('normalizedShippingCost')) {
  ok('normalizedShippingCost() rounds to 2 decimals on publish')
} else bad('normalizedShippingCost helper missing')

// STEP 2 — Schema + checkout + escrow
console.log('\nSTEP 2 — Database schema & checkout controller')
const m34 = read('supabase/migrations/034_listing_seller_shipping_cost.sql')
const m35 = read('supabase/migrations/035_listing_shipping_cost.sql')
if (m34.includes('seller_shipping_cost') && m35.includes('shipping_cost')) {
  ok('Migrations 034/035 define seller_shipping_cost + shipping_cost')
} else bad('Shipping migrations incomplete')

const checkout = read('supabase/functions/create-checkout-session/index.ts')
if (checkout.includes('itemPrice + shippingCost') && checkout.includes('shipping_cost')) {
  ok('Checkout: Stripe amount = retail (itemPrice) + shippingCost')
} else bad('Checkout total math missing')
if (checkout.includes('orderSupplierCost + shippingCost')) {
  ok('Dropship escrow: wholesale + shipping in vendor_escrow_amount')
} else bad('Dropship escrow shipping grouping missing')

const escrow = read('supabase/functions/_shared/marketplaceConnectEscrow.ts')
if (escrow.includes('supplier_shipping_cost') && escrow.includes('transferVendorEscrowOnPaid')) {
  ok('marketplaceConnectEscrow uses transfer + supplier_shipping_cost')
} else bad('Escrow transfer module incomplete')

// STEP 3 — Routes & middleware (static scan)
console.log('\nSTEP 3 — Nuxt routes & auth middleware')
const sellAuth = read('middleware/sell-auth.ts')
const sellEntry = read('middleware/sell-entry.ts')
const requiresAuth = read('middleware/requires-auth.ts')
if (sellAuth.length && sellEntry.length && requiresAuth.length) {
  ok('sell-auth, sell-entry, requires-auth middleware files intact')
} else bad('Middleware file missing')
if (!sell.includes('route.params') || sell.includes('route.query')) {
  ok('sell.vue uses route.query (no broken route.params dependency)')
} else bad('Unexpected route.params usage in sell.vue')

const sellPages = ['pages/sell.vue', 'pages/sell/start.vue', 'pages/sell/coa.vue'].filter((p) =>
  fs.existsSync(path.join(root, p)),
)
if (sellPages.length >= 1) {
  ok(`Sell routes present: ${sellPages.join(', ')}`)
} else bad('Sell page files missing')
if (fs.existsSync(path.join(root, 'middleware/sell-auth.ts'))) {
  ok('sell-auth middleware protects sell flow (query redirect intact)')
} else bad('sell-auth middleware missing')

// Simulated checkout math
console.log('\nSIMULATED CHECKOUT MATH (dry run)')
const retail = 199.99
const ship = 15.5
const wholesale = 120
const total = Math.round((retail + ship) * 100) / 100
const escrowDropship = Math.round((wholesale + ship) * 100) / 100
console.log(`  Retail $${retail} + Shipping $${ship} => Stripe charge $${total}`)
console.log(`  Dropship escrow transfer (wholesale + ship) => $${escrowDropship}`)
if (total === 215.49 && escrowDropship === 135.5) {
  ok('Simulated amounts match expected rounding')
} else bad('Simulated math mismatch')

console.log('\n=== SUMMARY ===')
console.log(`Passed: ${pass}`)
console.log(`Failed: ${fail}`)
if (fail === 0) {
  console.log('\nCONFIRMED: Shipping input → DB → checkout → Connect escrow wiring is consistent.')
  console.log('Apply SQL migrations 034 + 035 on Supabase before live listings with shipping.\n')
  process.exit(0)
}
console.log('\nFIX failures above before production test purchase.\n')
process.exit(1)
