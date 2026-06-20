const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { checkOwnerAccess, isOwnerRoute } = require('../security/owner_only.js')

describe('auth / owner access', () => {
  it('allows owner routes with valid ops key flag', () => {
    const r = checkOwnerAccess({ path: '/api/owner/status/platform', opsKeyValid: true })
    assert.equal(r.allowed, true)
  })

  it('blocks owner routes without auth', () => {
    const r = checkOwnerAccess({ path: '/api/owner/financial/summary', opsKeyValid: false })
    assert.equal(r.allowed, false)
  })

  it('allows public routes', () => {
    const r = checkOwnerAccess({ path: '/api/search/query', opsKeyValid: false })
    assert.equal(r.allowed, true)
  })

  it('identifies owner route prefixes', () => {
    assert.equal(isOwnerRoute('/api/owner/launch/readiness'), true)
    assert.equal(isOwnerRoute('/api/reports/law-enforcement/abc'), true)
    assert.equal(isOwnerRoute('/api/ai/chat'), false)
  })
})
