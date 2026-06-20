const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  validateReviewInput,
  autoFlagReview,
  preventSelfReviewContext,
  enforceReviewModerationContext,
  calculateNewRating,
  evaluateReviewSubmission,
  logReviewActivity,
  isReviewWritePath,
} = require('../reviews/review_system.js')

describe('review system', () => {
  it('rejects invalid ratings', () => {
    const result = validateReviewInput({ rating: 0, review_text: 'good seller', target_user_id: 'u2', order_id: 'o1' })
    assert.equal(result.ok, false)
  })

  it('flags suspicious language', () => {
    const flags = autoFlagReview({ rating: 2, review_text: 'total scam artist' })
    assert.ok(flags.includes('suspicious_language'))
  })

  it('blocks suspicious reviews in moderation', () => {
    const result = enforceReviewModerationContext({ rating: 1, review_text: 'fraud seller' })
    assert.equal(result.ok, false)
    assert.equal(result.status, 403)
  })

  it('prevents self reviews', () => {
    const result = preventSelfReviewContext({ userId: 'u1', targetUserId: 'u1' })
    assert.equal(result.ok, false)
  })

  it('calculates rolling average rating', () => {
    const avg = calculateNewRating(4, 10, 5)
    assert.equal(Math.round(avg * 100) / 100, 4.09)
  })

  it('evaluates full submission pipeline', () => {
    const ok = evaluateReviewSubmission(
      { rating: 5, review_text: 'Great experience overall', target_user_id: 'seller-1', order_id: 'order-1' },
      { userId: 'buyer-1', isBanned: false },
    )
    assert.equal(ok.ok, true)
  })

  it('logs review activity shape', () => {
    const row = logReviewActivity({
      user_id: 'buyer-1',
      target_user_id: 'seller-1',
      rating: 5,
      review_text: 'Excellent',
    })
    assert.equal(row.type, 'review_created')
    assert.equal(row.rating, 5)
  })

  it('detects review write paths', () => {
    assert.equal(isReviewWritePath('/api/reviews/create', 'POST'), true)
    assert.equal(isReviewWritePath('/api/reviews', 'GET'), false)
  })
})
