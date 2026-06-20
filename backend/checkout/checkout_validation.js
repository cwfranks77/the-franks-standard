/**
 * TFS Checkout + Tax Logic Validation — backend-only, idempotent.
 * Tax uses shipping ZIP when provided (Louisiana marketplace facilitator law).
 */

const { calculateTax, validateShippingZip } = require('../tax/calculate_tax.js')
const { logPaymentInitiated, logPaymentCompleted, logSuspiciousActivity } = require('../activity/activity_recorder.js')

const STATE_TAX_RATES = {
  LA: 0.0445,
  TX: 0.0625,
  FL: 0.06,
  CA: 0.0725,
  NY: 0.04,
}

const MARKETPLACE_FEE_RATE = 0.05
const BC_AUDIO_FEE_RATE = 0.03
const OWNER_INCOME_TAX_RESERVE_RATE = 0.25
const HIGH_VALUE_CHECKOUT_THRESHOLD = 5000
const VALID_DIVISIONS = new Set(['TFS', 'BC_AUDIO'])
const VALID_PROCESSORS = new Set(['stripe', 'paypal'])

function normalizeCheckoutBody (body = {}) {
  const shippingZip = body.shipping_zip ?? body.shippingZip ?? body.shipping_zip_code ?? null
  const buyerState = body.buyer_state ?? body.buyerState ?? null

  return {
    listing_id: String(body.listing_id ?? body.listingId ?? '').trim() || null,
    price: Number(body.price),
    shipping_zip: shippingZip ? String(shippingZip).trim() : null,
    buyer_state: buyerState ? String(buyerState).trim().toUpperCase() : null,
    division: String(body.division ?? 'TFS').trim().toUpperCase(),
    processor: String(body.processor ?? 'stripe').trim().toLowerCase(),
    shipping_cost: Number(body.shipping_cost ?? body.shippingCost ?? 0) || 0,
    user_id: body.user_id ?? body.userId ?? null,
  }
}

function validateCheckoutPayloadInput (body) {
  const normalized = normalizeCheckoutBody(body)

  if (!normalized.listing_id) {
    return { ok: false, status: 400, error: 'Missing listing ID.' }
  }

  if (!Number.isFinite(normalized.price) || normalized.price <= 0) {
    return { ok: false, status: 400, error: 'Invalid price.' }
  }

  if (!normalized.shipping_zip && !normalized.buyer_state) {
    return { ok: false, status: 400, error: 'Missing shipping ZIP or buyer state.' }
  }

  if (normalized.shipping_zip) {
    const zipCheck = validateShippingZip(normalized.shipping_zip)
    if (!zipCheck.ok) {
      return { ok: false, status: 400, error: 'Invalid shipping ZIP.' }
    }
    normalized.shipping_zip = zipCheck.zip5
  }

  if (!VALID_DIVISIONS.has(normalized.division)) {
    return { ok: false, status: 400, error: 'Invalid division.' }
  }

  return { ok: true, checkout: normalized }
}

function calculateTotals (price, { shipping_zip = null, buyer_state = null, division = 'TFS', shipping_cost = 0 } = {}) {
  const itemPrice = Number(price) || 0
  let salesTax = 0
  let taxSource = 'none'
  let taxBreakdown = null

  if (shipping_zip) {
    const tax = calculateTax({
      shippingZip: shipping_zip,
      merchandiseAmount: itemPrice,
      shippingCost: shipping_cost,
    })
    if (tax.ok) {
      salesTax = tax.tax_amount
      taxSource = 'shipping_zip'
      taxBreakdown = tax.tax_breakdown
    }
  } else if (buyer_state) {
    const stateTaxRate = STATE_TAX_RATES[buyer_state] || 0
    salesTax = Math.round(itemPrice * stateTaxRate * 100) / 100
    taxSource = 'buyer_state_estimate'
    taxBreakdown = { buyer_state, state_tax_rate: stateTaxRate }
  }

  const marketplaceFee = Math.round(itemPrice * MARKETPLACE_FEE_RATE * 100) / 100
  const bcAudioFee = division === 'BC_AUDIO'
    ? Math.round(itemPrice * BC_AUDIO_FEE_RATE * 100) / 100
    : 0

  const sellerPayout = Math.round((itemPrice - marketplaceFee - bcAudioFee) * 100) / 100
  const ownerTaxReserve = Math.round(sellerPayout * OWNER_INCOME_TAX_RESERVE_RATE * 100) / 100
  const total = Math.round((itemPrice + salesTax) * 100) / 100

  return {
    salesTax,
    marketplaceFee,
    bcAudioFee,
    total,
    sellerPayout,
    ownerTaxReserve,
    taxSource,
    taxBreakdown,
    marketplaceFeeRate: MARKETPLACE_FEE_RATE,
    bcAudioFeeRate: division === 'BC_AUDIO' ? BC_AUDIO_FEE_RATE : 0,
  }
}

function checkoutFraudCheckContext ({ price, userId = null, isBanned = false } = {}) {
  if (isBanned) {
    return { ok: false, status: 403, error: 'Account banned.' }
  }

  const flags = []
  if (Number(price) > HIGH_VALUE_CHECKOUT_THRESHOLD) {
    flags.push('high_value_checkout')
  }

  return { ok: true, flags, userId }
}

function validatePaymentProcessorInput (processor) {
  const p = String(processor || '').trim().toLowerCase()
  if (!p || !VALID_PROCESSORS.has(p)) {
    return { ok: false, status: 400, error: 'Invalid payment processor.' }
  }
  return { ok: true, processor: p }
}

function requireCheckoutAuthContext ({ userId = null } = {}) {
  if (!userId) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }
  return { ok: true, userId }
}

function evaluateCheckout (body, { userId = null, isBanned = false, admin = null, requireAuth = true } = {}) {
  if (requireAuth) {
    const auth = requireCheckoutAuthContext({ userId })
    if (!auth.ok) return auth
  }

  const validation = validateCheckoutPayloadInput(body)
  if (!validation.ok) return validation

  const checkout = validation.checkout
  const fraud = checkoutFraudCheckContext({
    price: checkout.price,
    userId: userId || checkout.user_id,
    isBanned,
  })
  if (!fraud.ok) return fraud

  const processor = validatePaymentProcessorInput(checkout.processor)
  if (!processor.ok) return processor

  const totals = calculateTotals(checkout.price, {
    shipping_zip: checkout.shipping_zip,
    buyer_state: checkout.buyer_state,
    division: checkout.division,
    shipping_cost: checkout.shipping_cost,
  })

  if (fraud.flags.includes('high_value_checkout') && (userId || checkout.user_id)) {
    logSuspiciousActivity(userId || checkout.user_id, 'high_value_checkout', {
      price: checkout.price,
      listing_id: checkout.listing_id,
    }, admin).catch(() => {})
  }

  return {
    ok: true,
    checkout,
    totals,
    processor: processor.processor,
    flags: fraud.flags,
  }
}

async function logCheckoutStart (userId, checkout, totals, admin = null) {
  if (!userId) return { ok: true, logged: false }
  return logPaymentInitiated(userId, 'pending', {
    listingId: checkout.listing_id,
    listing_id: checkout.listing_id,
    price: checkout.price,
    totals,
  }, admin)
}

async function logCheckoutComplete (userId, transactionId, checkout, totals, admin = null) {
  if (!userId) return { ok: true, logged: false }
  return logPaymentCompleted(userId, String(transactionId || 'completed'), {
    listingId: checkout.listing_id,
    listing_id: checkout.listing_id,
    totals,
  }, admin)
}

function isCheckoutPath (path) {
  const p = String(path || '').split('?')[0]
  return p === '/api/checkout' || p.startsWith('/api/checkout/')
}

function getCheckoutValidationStatus () {
  return {
    state_tax_rates: STATE_TAX_RATES,
    marketplace_fee_rate: MARKETPLACE_FEE_RATE,
    bc_audio_fee_rate: BC_AUDIO_FEE_RATE,
    owner_income_tax_reserve_rate: OWNER_INCOME_TAX_RESERVE_RATE,
    high_value_threshold: HIGH_VALUE_CHECKOUT_THRESHOLD,
    tax_basis: 'shipping_zip',
  }
}

module.exports = {
  STATE_TAX_RATES,
  MARKETPLACE_FEE_RATE,
  BC_AUDIO_FEE_RATE,
  OWNER_INCOME_TAX_RESERVE_RATE,
  HIGH_VALUE_CHECKOUT_THRESHOLD,
  normalizeCheckoutBody,
  validateCheckoutPayloadInput,
  calculateTotals,
  checkoutFraudCheckContext,
  validatePaymentProcessorInput,
  evaluateCheckout,
  logCheckoutStart,
  logCheckoutComplete,
  requireCheckoutAuthContext,
  isCheckoutPath,
  getCheckoutValidationStatus,
}
