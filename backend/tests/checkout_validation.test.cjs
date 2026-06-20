const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  validateCheckoutPayloadInput,
  calculateTotals,
  checkoutFraudCheckContext,
  evaluateCheckout,
  STATE_TAX_RATES,
} = require('../checkout/checkout_validation.js')

describe('checkout validation', () => {
  it('rejects missing listing id', () => {
    const result = validateCheckoutPayloadInput({ price: 50, buyer_state: 'LA' })
    assert.equal(result.ok, false)
  })

  it('requires shipping zip or buyer state', () => {
    const result = validateCheckoutPayloadInput({ listing_id: 'l1', price: 50 })
    assert.equal(result.ok, false)
  })

  it('calculates totals with LA shipping zip tax', () => {
    const totals = calculateTotals(100, { shipping_zip: '70112', division: 'TFS' })
    assert.ok(totals.salesTax > 0)
    assert.equal(totals.marketplaceFee, 5)
    assert.equal(totals.total, 100 + totals.salesTax)
  })

  it('adds BC audio fee for BC division', () => {
    const totals = calculateTotals(100, { buyer_state: 'LA', division: 'BC_AUDIO' })
    assert.equal(totals.bcAudioFee, 3)
    assert.equal(totals.sellerPayout, 92)
  })

  it('blocks banned buyers', () => {
    const result = checkoutFraudCheckContext({ price: 10, isBanned: true })
    assert.equal(result.ok, false)
  })

  it('evaluates full checkout pipeline', () => {
    const result = evaluateCheckout({
      listingId: 'l1',
      price: 120,
      shipping_zip: '70112',
      division: 'TFS',
      processor: 'stripe',
    }, { userId: 'buyer-1', isBanned: false })

    assert.equal(result.ok, true)
    assert.ok(result.totals)
  })

  it('requires authenticated buyer', () => {
    const result = evaluateCheckout({
      listing_id: 'l1',
      price: 120,
      shipping_zip: '70112',
      division: 'TFS',
      processor: 'stripe',
    }, { userId: null, isBanned: false })

    assert.equal(result.ok, false)
    assert.equal(result.status, 401)
  })

  it('exposes state tax table', () => {
    assert.equal(STATE_TAX_RATES.LA, 0.0445)
  })
})
