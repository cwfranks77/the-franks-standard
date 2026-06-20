const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { isListingCreatePath } = require('../marketplace/marketplace_enforcement.js')

describe('marketplace routes', () => {
  it('maps listing create path', () => {
    assert.equal(isListingCreatePath('/api/listings/create'), true)
    assert.equal(isListingCreatePath('/api/listings'), false)
  })

  it('exports express handlers', () => {
    const handlers = require('../marketplace/handlers.js')
    assert.equal(typeof handlers.createListingHandler, 'function')
    assert.equal(typeof handlers.checkoutHandler, 'function')
  })
})
