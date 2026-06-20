const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { checkRateLimit } = require('../security/rate_limit.js')
const { sanitizeString, sanitizeObject } = require('../security/security_hardening.js')
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

  it('sanitizes script tags from strings', () => {
    const out = sanitizeString('hello<script>alert(1)</script>')
    assert.ok(!out.includes('<script>'))
  })

  it('detects auth paths', () => {
    const { isAuthPath } = require('../security/security_hardening.js')
    assert.equal(isAuthPath('/api/auth/login'), true)
    assert.equal(isAuthPath('/api/search/query'), false)
  })
})
