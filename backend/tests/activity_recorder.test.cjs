const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const os = require('os')

describe('activity recorder', () => {
  let originalCwd

  before(() => {
    originalCwd = process.cwd()
    process.chdir(os.tmpdir())
  })

  after(() => {
    process.chdir(originalCwd)
    const logFile = path.join(os.tmpdir(), 'logs', 'activity.log')
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile)
  })

  it('creates events with timestamps', () => {
    const { createEvent } = require('../activity/activity_recorder.js')
    const event = createEvent('login', { userId: 'u1' })
    assert.equal(event.type, 'login')
    assert.equal(event.userId, 'u1')
    assert.ok(event.timestamp)
  })

  it('writes events to activity.log', () => {
    const { recordEvent, createEvent, LOG_FILE } = require('../activity/activity_recorder.js')
    recordEvent(createEvent('listing_created', { userId: 'u1', listingId: 'l1' }))
    assert.ok(fs.existsSync(LOG_FILE))
    const content = fs.readFileSync(LOG_FILE, 'utf8')
    assert.ok(content.includes('listing_created'))
    assert.ok(content.includes('l1'))
  })

  it('exposes listing and payment helpers', () => {
    const recorder = require('../activity/activity_recorder.js')
    assert.equal(typeof recorder.logPaymentInitiated, 'function')
    assert.equal(typeof recorder.logReviewCreated, 'function')
    assert.equal(typeof recorder.logSuspiciousActivity, 'function')
  })

  it('maps event categories for database persistence', () => {
    const { EVENT_CATEGORIES } = require('../activity/activity_recorder.js')
    assert.equal(EVENT_CATEGORIES.review_created.category, 'general')
    assert.equal(EVENT_CATEGORIES.payment_completed.category, 'transaction')
  })
})
