const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

describe('owner tools', () => {
  it('requires owner context', () => {
    const { requireOwnerContext } = require('../owner/owner_tools.js')
    assert.equal(requireOwnerContext({ opsKeyValid: true }).ok, true)
    assert.equal(requireOwnerContext({ userId: 'u1', roles: ['owner'] }).ok, true)
    assert.equal(requireOwnerContext({ userId: 'u1', roles: ['buyer'] }).ok, false)
  })

  it('exposes lookup and action helpers', () => {
    const tools = require('../owner/owner_tools.js')
    assert.equal(typeof tools.lookupUser, 'function')
    assert.equal(typeof tools.forceRefund, 'function')
    assert.equal(typeof tools.verifySeller, 'function')
    assert.equal(typeof tools.banUser, 'function')
  })

  it('exports express handlers', () => {
    const handlers = require('../owner/owner_handlers.js')
    assert.equal(typeof handlers.ownerLookupUser, 'function')
    assert.equal(typeof handlers.ownerForceRefund, 'function')
    assert.equal(typeof handlers.ownerBanUser, 'function')
  })

  it('returns owner tools status envelope', () => {
    const { getOwnerToolsStatus } = require('../owner/owner_tools.js')
    const status = getOwnerToolsStatus()
    assert.ok(Array.isArray(status.lookups))
    assert.ok(status.actions.includes('force_refund'))
  })

  it('lookup user fails without admin', async () => {
    const { lookupUser } = require('../owner/owner_tools.js')
    const result = await lookupUser(null, 'user-1')
    assert.equal(result.ok, false)
  })
})
