const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { ruleInFavorOfBuyer, viewDispute } = require('../owner/manual_dispute_review.js')
const { mockAdmin } = require('./_helpers.cjs')

describe('disputes', () => {
  it('viewDispute returns not found for missing case', async () => {
    const admin = mockAdmin()
    const r = await viewDispute(admin, 'missing-id')
    assert.equal(r.ok, false)
  })

  it('ruleInFavorOfBuyer resolves dispute', async () => {
    const base = mockAdmin()
    const admin = {
      ...base,
      from: (table) => {
        if (table === 'audit_logs') return base.from(table)
        return {
          update: () => ({
            eq: async () => ({ error: null }),
          }),
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: 'd1', buyer_id: 'b1', seller_id: 's1' } }),
            }),
          }),
        }
      },
    }

    const r = await ruleInFavorOfBuyer(admin, 'd1', { ruling: 'Buyer favored — test' })
    assert.equal(r.ok, true)
    assert.equal(r.status, 'resolved')
  })
})
