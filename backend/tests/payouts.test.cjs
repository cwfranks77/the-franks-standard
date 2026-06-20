const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { shouldHoldPayout } = require('../payouts/payout_rules.js')
const { mockAdmin } = require('./_helpers.cjs')

describe('payouts / holds', () => {
  it('holds payout when account frozen', async () => {
    const admin = mockAdmin()
    admin.from = (table) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  safety_frozen_at: new Date().toISOString(),
                  trusted_seller_payouts: true,
                },
              }),
            }),
          }),
        }
      }
      if (table === 'fraud_cases') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({
                  maybeSingle: async () => ({ data: null }),
                }),
              }),
            }),
          }),
        }
      }
      return mockAdmin().from(table)
    }

    const r = await shouldHoldPayout(admin, { sellerId: 'seller-1' })
    assert.equal(r.hold, true)
    assert.ok(r.reasons.includes('account_frozen'))
  })
})
