const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { checkRateLimit } = require('../security/rate_limit.js')
const { finalLockdownCheck } = require('../owner/final_lockdown_check.js')

describe('security', () => {
  it('rate limit module exposes checkRateLimit', () => {
    assert.equal(typeof checkRateLimit, 'function')
  })

  it('lockdown check returns secure flag structure', async () => {
    const r = await finalLockdownCheck(null)
    assert.equal(typeof r.secure, 'boolean')
    assert.ok(Array.isArray(r.issues))
  })
})
