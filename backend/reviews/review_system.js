/**
 * TFS Review System — backend-only, idempotent.
 * Used by Nitro middleware and API handlers (not Express).
 */

const SUSPICIOUS_WORDS = ['scam', 'fraud', 'fake', 'stolen']
const REVIEW_PATH_PREFIXES = ['/api/reviews']

const VERIFIED_ORDER_STATUSES = new Set(['paid', 'shipped', 'delivered', 'confirmed', 'disputed'])

function normalizeReview (input = {}) {
  const rating = Number(input.rating)
  const reviewText = String(input.review_text ?? input.text ?? '').trim()
  const targetUserId = input.target_user_id ?? input.seller_id ?? input.buyer_id ?? null
  const reviewType = String(input.review_type ?? 'seller').trim() || 'seller'

  return {
    rating,
    review_text: reviewText,
    target_user_id: targetUserId ? String(targetUserId) : null,
    order_id: input.order_id ? String(input.order_id) : null,
    review_type: reviewType,
    user_id: input.user_id ? String(input.user_id) : null,
  }
}

function validateReviewInput (review) {
  const body = normalizeReview(review)

  if (!Number.isFinite(body.rating) || body.rating < 1 || body.rating > 5) {
    return { ok: false, status: 400, error: 'Rating must be between 1 and 5.' }
  }

  if (body.review_type !== 'platform' && !body.target_user_id) {
    return { ok: false, status: 400, error: 'Missing target user ID.' }
  }

  if (typeof body.review_text !== 'string' || body.review_text.length < 3) {
    return { ok: false, status: 400, error: 'Review text too short.' }
  }

  if (body.review_type !== 'platform' && !body.order_id) {
    return { ok: false, status: 400, error: 'Missing order ID for verified review.' }
  }

  return { ok: true, review: body }
}

function autoFlagReview (review) {
  const body = normalizeReview(review)
  const flags = []
  const text = body.review_text.toLowerCase()

  for (const word of SUSPICIOUS_WORDS) {
    if (text.includes(word)) {
      flags.push('suspicious_language')
      break
    }
  }

  if (body.rating === 1 && body.review_text.length < 10) {
    flags.push('low_effort_negative')
  }

  if (body.rating === 5 && body.review_text.length < 5) {
    flags.push('low_effort_positive')
  }

  return [...new Set(flags)]
}

function enforceReviewModerationContext (review) {
  const flags = autoFlagReview(review)
  if (flags.includes('suspicious_language')) {
    return {
      ok: false,
      status: 403,
      error: 'Review flagged for moderation.',
      flags,
    }
  }
  return { ok: true, flags }
}

function preventSelfReviewContext ({ userId = null, targetUserId = null } = {}) {
  if (userId && targetUserId && userId === targetUserId) {
    return { ok: false, status: 403, error: 'You cannot review yourself.' }
  }
  return { ok: true }
}

function enforceReviewPermissionsContext ({ userId = null, isBanned = false } = {}) {
  if (!userId) return { ok: false, status: 401, error: 'Unauthorized' }
  if (isBanned) return { ok: false, status: 403, error: 'Account banned.' }
  return { ok: true }
}

function calculateNewRating (currentAvg, totalReviews, newRating) {
  const avg = Number(currentAvg) || 0
  const count = Number(totalReviews) || 0
  const rating = Number(newRating)
  if (!Number.isFinite(rating)) return avg
  const total = avg * count
  return (total + rating) / (count + 1)
}

function logReviewActivity (review) {
  const body = normalizeReview(review)
  return {
    type: 'review_created',
    userId: body.user_id,
    targetUserId: body.target_user_id,
    rating: body.rating,
    review_type: body.review_type,
    timestamp: new Date().toISOString(),
  }
}

async function persistReviewActivity (admin, review) {
  const body = normalizeReview(review)
  const { logReviewCreated } = require('../activity/activity_recorder.js')
  return logReviewCreated(body.user_id, body.target_user_id, {
    rating: body.rating,
    review_type: body.review_type,
  }, admin)
}

async function assertVerifiedPurchase (admin, orderId, reviewerId, targetRole) {
  const { data: order, error } = await admin
    .from('orders')
    .select('id, buyer_id, seller_id, status')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) return { ok: false, error: 'order_not_found', status: 404 }
  if (!VERIFIED_ORDER_STATUSES.has(String(order.status))) {
    return { ok: false, error: 'order_not_verified', status: 403 }
  }

  if (targetRole === 'seller') {
    if (order.buyer_id !== reviewerId) return { ok: false, error: 'forbidden', status: 403 }
  } else if (targetRole === 'buyer') {
    if (order.seller_id !== reviewerId) return { ok: false, error: 'forbidden', status: 403 }
  }

  return { ok: true, order }
}

async function getTargetRatingStats (admin, { targetUserId, reviewType = 'seller' } = {}) {
  if (!admin || !targetUserId || reviewType === 'platform') {
    return { avg: 0, count: 0 }
  }

  const table = reviewType === 'buyer' ? 'buyer_reviews' : 'seller_reviews'
  const targetColumn = reviewType === 'buyer' ? 'buyer_id' : 'seller_id'

  const { data, error } = await admin
    .from(table)
    .select('rating')
    .eq(targetColumn, targetUserId)

  if (error || !data?.length) return { avg: 0, count: 0 }

  const count = data.length
  const sum = data.reduce((s, row) => s + Number(row.rating || 0), 0)
  return { avg: sum / count, count }
}

function isReviewWritePath (path, method) {
  const m = String(method || '').toUpperCase()
  if (m !== 'POST') return false
  const p = String(path || '').split('?')[0]
  return REVIEW_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

function evaluateReviewSubmission (review, { userId = null, isBanned = false } = {}) {
  const permissions = enforceReviewPermissionsContext({ userId, isBanned })
  if (!permissions.ok) return permissions

  const draft = normalizeReview(review)
  const self = preventSelfReviewContext({
    userId,
    targetUserId: draft.target_user_id,
  })
  if (!self.ok) return self

  const validation = validateReviewInput(review)
  if (!validation.ok) return validation

  const moderation = enforceReviewModerationContext({
    ...validation.review,
    user_id: userId,
  })
  if (!moderation.ok) {
    return { ...moderation, review: validation.review }
  }

  return {
    ok: true,
    review: { ...validation.review, user_id: userId },
    flags: moderation.flags,
  }
}

function getReviewSystemStatus () {
  return {
    suspicious_words: SUSPICIOUS_WORDS,
    review_paths: REVIEW_PATH_PREFIXES,
    verified_order_statuses: [...VERIFIED_ORDER_STATUSES],
  }
}

module.exports = {
  SUSPICIOUS_WORDS,
  normalizeReview,
  validateReviewInput,
  autoFlagReview,
  enforceReviewModerationContext,
  preventSelfReviewContext,
  enforceReviewPermissionsContext,
  calculateNewRating,
  logReviewActivity,
  persistReviewActivity,
  assertVerifiedPurchase,
  getTargetRatingStats,
  isReviewWritePath,
  evaluateReviewSubmission,
  getReviewSystemStatus,
}
