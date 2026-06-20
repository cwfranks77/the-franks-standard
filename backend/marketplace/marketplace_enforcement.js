/**
 * TFS Marketplace Enforcement — backend-only, idempotent.
 * Used by Nitro server middleware and API handlers (not Express).
 */

const VIOLATION_TYPES = {
  ILLEGAL_ITEM: 'illegal_item',
  COUNTERFEIT: 'counterfeit',
  MISLEADING: 'misleading',
  PRICE_GOUGING: 'price_gouging',
  HARASSMENT: 'harassment',
  PAYMENT_FRAUD: 'payment_fraud',
  CHARGEBACK_FRAUD: 'chargeback_fraud',
  POLICY_VIOLATION: 'policy_violation',
}

const BANNED_WORDS = ['fake', 'counterfeit', 'illegal', 'stolen']

const FREEZE_TRIGGERS = [
  VIOLATION_TYPES.ILLEGAL_ITEM,
  VIOLATION_TYPES.COUNTERFEIT,
  VIOLATION_TYPES.PAYMENT_FRAUD,
]

const LISTING_WRITE_PREFIX = '/api/listings'
const CHECKOUT_PREFIXES = ['/api/checkout', '/api/orders']
const BUYER_PREFIXES = ['/api/checkout', '/api/orders', '/api/refunds']
const SELLER_PREFIXES = ['/api/listings', '/api/seller']

const DISPUTE_ESCALATION_HOURS = 72

function autoFlagListing (listing) {
  const flags = []
  if (!listing || typeof listing !== 'object') {
    flags.push(VIOLATION_TYPES.MISLEADING)
    return flags
  }

  const title = String(listing.title ?? '')
  if (!title || title.length < 3) {
    flags.push(VIOLATION_TYPES.MISLEADING)
  }

  const price = Number(listing.price)
  if (!Number.isFinite(price) || price <= 0) {
    flags.push(VIOLATION_TYPES.PRICE_GOUGING)
  }

  const haystack = `${title} ${String(listing.description ?? '')}`.toLowerCase()
  for (const word of BANNED_WORDS) {
    if (haystack.includes(word)) {
      flags.push(VIOLATION_TYPES.COUNTERFEIT)
      break
    }
  }

  if (/\b(cocaine|heroin|meth|fentanyl|ghost gun|stolen goods)\b/i.test(haystack)) {
    flags.push(VIOLATION_TYPES.ILLEGAL_ITEM)
  }

  return [...new Set(flags)]
}

function shouldFreezeListing (flags) {
  return (flags || []).some((f) => FREEZE_TRIGGERS.includes(f))
}

function evaluateListingEnforcement (listing) {
  const flags = autoFlagListing(listing)
  const freeze = shouldFreezeListing(flags)
  return {
    flags,
    freeze,
    ok: !freeze,
    error: freeze ? 'Listing automatically frozen due to policy violations.' : null,
  }
}

function enforceBuyerRulesContext ({ userId = null, isBanned = false } = {}) {
  if (!userId) return { ok: false, status: 401, error: 'Unauthorized' }
  if (isBanned) return { ok: false, status: 403, error: 'Buyer account banned.' }
  return { ok: true }
}

function enforceSellerRulesContext ({
  userId = null,
  isBanned = false,
  isVerifiedSeller = false,
  opsKeyValid = false,
} = {}) {
  if (opsKeyValid) return { ok: true, method: 'ops_key' }
  if (!userId) return { ok: false, status: 401, error: 'Unauthorized' }
  if (isBanned) return { ok: false, status: 403, error: 'Seller account banned.' }
  if (!isVerifiedSeller) return { ok: false, status: 403, error: 'Seller not verified.' }
  return { ok: true }
}

function escalateDispute (dispute) {
  if (!dispute) return null

  const now = Date.now()
  const created = new Date(dispute.created_at).getTime()
  if (!Number.isFinite(created)) return null

  const hoursOpen = (now - created) / (1000 * 60 * 60)
  if (hoursOpen > DISPUTE_ESCALATION_HOURS && dispute.status === 'open') {
    return 'escalate_to_owner'
  }

  return null
}

function enforceRefundRules (transaction) {
  if (!transaction) return { allowed: false, reason: 'Invalid transaction' }

  if (transaction.status !== 'completed') {
    return { allowed: false, reason: 'Transaction not completed' }
  }

  if (transaction.refund_requested) {
    return { allowed: false, reason: 'Refund already requested' }
  }

  return { allowed: true }
}

function logChargeback (event) {
  return {
    type: 'chargeback_event',
    transactionId: event?.transactionId ?? null,
    userId: event?.userId ?? null,
    reason: event?.reason ?? null,
    timestamp: new Date().toISOString(),
  }
}

async function persistChargebackLog (admin, event) {
  const row = logChargeback(event)
  if (!admin) return { ok: true, logged: row, persisted: false }

  const { logPaymentEvent } = require('../payments/log_payment_event.js')
  const result = await logPaymentEvent(admin, {
    orderId: row.transactionId,
    userId: row.userId,
    eventType: 'chargeback',
    metadata: { reason: row.reason, logged_at: row.timestamp },
  })

  return { ok: result.ok, logged: row, persisted: result.ok, event_id: result.event_id ?? null }
}

async function persistListingViolationFlags (admin, { userId = null, listing = null, flags = [] } = {}) {
  if (!admin || !flags.length) return { ok: true, persisted: false }

  const inserts = flags.map((violationType) => ({
    user_id: userId,
    violation_type: violationType,
    severity: FREEZE_TRIGGERS.includes(violationType) ? 'major' : 'minor',
    evidence: {
      source_type: 'listing',
      auto_flag: true,
      listing_title: listing?.title ?? null,
      flags,
    },
  }))

  const { error } = await admin.from('violation_events').insert(inserts)
  if (error) return { ok: false, error: error.message }
  return { ok: true, persisted: true, count: inserts.length }
}

function pathMatches (path, prefixes) {
  const p = String(path || '').split('?')[0]
  return prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

function isListingCreatePath (path) {
  const p = String(path || '').split('?')[0]
  return p === `${LISTING_WRITE_PREFIX}/create`
}

function isListingWritePath (path, method) {
  const m = String(method || '').toUpperCase()
  if (!['POST', 'PUT', 'PATCH'].includes(m)) return false
  const p = String(path || '').split('?')[0]
  return p === LISTING_WRITE_PREFIX || p.startsWith(`${LISTING_WRITE_PREFIX}/`)
}

function isCheckoutPath (path) {
  return pathMatches(path, CHECKOUT_PREFIXES)
}

function isBuyerActionPath (path) {
  return pathMatches(path, BUYER_PREFIXES)
}

function isSellerActionPath (path, method) {
  const m = String(method || '').toUpperCase()
  const p = String(path || '').split('?')[0]

  if (p === LISTING_WRITE_PREFIX || p.startsWith(`${LISTING_WRITE_PREFIX}/`)) {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)
  }

  if (p === '/api/seller' || p.startsWith('/api/seller/')) {
    return !['GET', 'HEAD', 'OPTIONS'].includes(m)
  }

  return false
}

function getMarketplaceEnforcementStatus () {
  return {
    violation_types: Object.values(VIOLATION_TYPES),
    freeze_triggers: FREEZE_TRIGGERS,
    dispute_escalation_hours: DISPUTE_ESCALATION_HOURS,
    banned_words: BANNED_WORDS,
  }
}

module.exports = {
  VIOLATION_TYPES,
  BANNED_WORDS,
  FREEZE_TRIGGERS,
  DISPUTE_ESCALATION_HOURS,
  autoFlagListing,
  shouldFreezeListing,
  evaluateListingEnforcement,
  enforceBuyerRulesContext,
  enforceSellerRulesContext,
  escalateDispute,
  enforceRefundRules,
  logChargeback,
  persistChargebackLog,
  persistListingViolationFlags,
  isListingCreatePath,
  isListingWritePath,
  isCheckoutPath,
  isBuyerActionPath,
  isSellerActionPath,
  getMarketplaceEnforcementStatus,
}
