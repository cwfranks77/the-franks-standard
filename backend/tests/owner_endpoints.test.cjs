const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { getPlatformStatus } = require('../owner/get_platform_status.js')
const { validateKey, KEY_PREFIX } = require('../owner/api_keys.js')
const { mockAdmin } = require('./_helpers.cjs')

describe('owner endpoints logic', () => {
  it('platform status returns envelope shape', async () => {
    const admin = mockAdmin()
    const r = await getPlatformStatus(admin)
    assert.ok('counts' in r)
    assert.ok('summaries' in r)
    assert.ok(Array.isArray(r.alerts))
  })

  it('rejects invalid API key format', async () => {
    const r = await validateKey(mockAdmin(), 'bad-key')
    assert.equal(r.valid, false)
  })

  it('API key prefix is defined', () => {
    assert.ok(KEY_PREFIX.startsWith('tfs_owner_'))
  })
})
