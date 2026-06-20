const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  VIOLATION_TYPES,
  autoFlagListing,
  shouldFreezeListing,
  evaluateListingEnforcement,
  enforceBuyerRulesContext,
  enforceSellerRulesContext,
  escalateDispute,
  enforceRefundRules,
  logChargeback,
  isListingWritePath,
} = require('../marketplace/marketplace_enforcement.js')

describe('marketplace enforcement', () => {
  it('flags misleading short titles', () => {
    const flags = autoFlagListing({ title: 'ab', price: 10 })
    assert.ok(flags.includes(VIOLATION_TYPES.MISLEADING))
  })

  it('flags counterfeit banned words', () => {
    const flags = autoFlagListing({ title: 'fake watch', price: 50 })
    assert.ok(flags.includes(VIOLATION_TYPES.COUNTERFEIT))
  })

  it('freezes on counterfeit flags', () => {
    assert.equal(shouldFreezeListing([VIOLATION_TYPES.COUNTERFEIT]), true)
    assert.equal(shouldFreezeListing([VIOLATION_TYPES.MISLEADING]), false)
  })

  it('blocks frozen listings in evaluation', () => {
    const result = evaluateListingEnforcement({ title: 'fake rolex', price: 100 })
    assert.equal(result.freeze, true)
    assert.equal(result.ok, false)
  })

  it('enforces buyer ban state', () => {
    const ok = enforceBuyerRulesContext({ userId: 'u1', isBanned: false })
    const banned = enforceBuyerRulesContext({ userId: 'u1', isBanned: true })
    assert.equal(ok.ok, true)
    assert.equal(banned.ok, false)
    assert.equal(banned.status, 403)
  })

  it('requires verified seller', () => {
    const unverified = enforceSellerRulesContext({ userId: 's1', isVerifiedSeller: false })
    const verified = enforceSellerRulesContext({ userId: 's1', isVerifiedSeller: true })
    assert.equal(unverified.ok, false)
    assert.equal(verified.ok, true)
  })

  it('escalates open disputes after 72 hours', () => {
    const old = new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString()
    assert.equal(escalateDispute({ created_at: old, status: 'open' }), 'escalate_to_owner')
    assert.equal(escalateDispute({ created_at: new Date().toISOString(), status: 'open' }), null)
  })

  it('enforces refund rules', () => {
    assert.equal(enforceRefundRules(null).allowed, false)
    assert.equal(enforceRefundRules({ status: 'pending' }).allowed, false)
    assert.equal(enforceRefundRules({ status: 'completed', refund_requested: true }).allowed, false)
    assert.equal(enforceRefundRules({ status: 'completed', refund_requested: false }).allowed, true)
  })

  it('formats chargeback logs', () => {
    const row = logChargeback({ transactionId: 'o1', userId: 'u1', reason: 'fraud' })
    assert.equal(row.type, 'chargeback_event')
    assert.equal(row.transactionId, 'o1')
    assert.ok(row.timestamp)
  })

  it('detects listing write paths', () => {
    assert.equal(isListingWritePath('/api/listings', 'POST'), true)
    assert.equal(isListingWritePath('/api/listings/abc', 'PUT'), true)
    assert.equal(isListingWritePath('/api/listings', 'GET'), false)
  })
})
