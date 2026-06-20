const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

describe('activity request hooks', () => {
  it('records listing created from req.user', async () => {
    const hooks = require('../activity/request_hooks.js')
    const result = await hooks.recordListingCreatedFromRequest(
      { user: { id: 'user-1' } },
      'listing-1',
    )
    assert.ok(result)
  })

  it('records payment initiated with metadata', async () => {
    const hooks = require('../activity/request_hooks.js')
    const result = await hooks.recordPaymentInitiatedFromRequest(
      { user: { id: 'buyer-1' } },
      'txn-1',
      { listing_id: 'listing-1' },
    )
    assert.ok(result)
  })

  it('records review created with rating metadata', async () => {
    const hooks = require('../activity/request_hooks.js')
    const result = await hooks.recordReviewCreatedFromRequest(
      { user: { id: 'buyer-1' } },
      'seller-1',
      { rating: 5 },
    )
    assert.ok(result)
  })

  it('records admin actions like force_refund', async () => {
    const hooks = require('../activity/request_hooks.js')
    const result = await hooks.recordAdminActionFromRequest(
      { user: { id: 'ops-owner' } },
      'force_refund',
      { transactionId: 'order-1' },
    )
    assert.ok(result)
  })

  it('records suspicious activity reasons', async () => {
    const hooks = require('../activity/request_hooks.js')
    const result = await hooks.recordSuspiciousActivityFromRequest(
      { user: { id: 'user-1' } },
      'multiple failed logins',
    )
    assert.ok(result)
  })
})
