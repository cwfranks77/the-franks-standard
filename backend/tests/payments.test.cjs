const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { calculateFees, DEFAULT_FEE_BPS, BC_AUDIO_FEE_BPS } = require('../fees/calculate_fees.js')

describe('payments / fees', () => {
  it('applies default 10% platform fee', async () => {
    const r = await calculateFees(null, { merchandiseAmount: 100 })
    assert.equal(r.feeBps, DEFAULT_FEE_BPS)
    assert.equal(r.platformFee, 10)
    assert.equal(r.sellerNet, 90)
  })

  it('uses BC audio reduced rate when profile matches', async () => {
    const r = await calculateFees(null, {
      merchandiseAmount: 200,
      sellerProfile: { store_slug: 'bc-audio' },
    })
    assert.equal(r.feeBps, BC_AUDIO_FEE_BPS)
    assert.equal(r.platformFee, 10)
  })
})
