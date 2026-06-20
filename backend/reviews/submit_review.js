/**
 * Submit marketplace review — shared by Express and Nitro handlers.
 */

const {
  evaluateReviewSubmission,
  assertVerifiedPurchase,
  getTargetRatingStats,
  calculateNewRating,
  persistReviewActivity,
  autoFlagReview,
} = require('./review_system.js')

async function persistReviewFlags (admin, { userId, review, flags }) {
  if (!admin || !flags?.length) return { ok: true, persisted: false }

  const { error } = await admin.from('violation_events').insert({
    user_id: userId,
    violation_type: 'review_moderation',
    severity: flags.includes('suspicious_language') ? 'major' : 'minor',
    evidence: {
      source_type: 'review',
      flags,
      review_text: review.review_text,
      target_user_id: review.target_user_id,
    },
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, persisted: true }
}

async function submitReview (admin, { review, userId, isBanned = false, ipAddress = null }) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }

  const evaluated = evaluateReviewSubmission(review, { userId, isBanned })
  if (!evaluated.ok) {
    if (evaluated.flags?.includes('suspicious_language')) {
      await persistReviewFlags(admin, {
        userId,
        review: evaluated.review || review,
        flags: evaluated.flags,
      }).catch(() => {})
    }
    return evaluated
  }

  const body = evaluated.review
  const flags = evaluated.flags || autoFlagReview(body)

  if (body.review_type === 'platform') {
    const { data, error } = await admin.from('platform_reviews').insert({
      reviewer_id: userId,
      rating: body.rating,
      text: body.review_text.slice(0, 4000),
      evidence: { flags, ip_address: ipAddress },
    }).select('id').single()

    if (error) return { ok: false, error: error.message, status: 400 }

    await persistReviewActivity(admin, body).catch(() => {})
    return { ok: true, review_id: data.id, review_type: 'platform', flags }
  }

  const targetRole = body.review_type === 'buyer' ? 'buyer' : 'seller'
  const verified = await assertVerifiedPurchase(admin, body.order_id, userId, targetRole)
  if (!verified.ok) return verified

  const targetId = body.target_user_id
  if (targetRole === 'seller' && verified.order.seller_id !== targetId) {
    return { ok: false, error: 'seller_mismatch', status: 400 }
  }
  if (targetRole === 'buyer' && verified.order.buyer_id !== targetId) {
    return { ok: false, error: 'buyer_mismatch', status: 400 }
  }

  const table = targetRole === 'buyer' ? 'buyer_reviews' : 'seller_reviews'
  const targetColumn = targetRole === 'buyer' ? 'buyer_id' : 'seller_id'

  const stats = await getTargetRatingStats(admin, {
    targetUserId: targetId,
    reviewType: targetRole,
  })

  const projectedAvg = calculateNewRating(stats.avg, stats.count, body.rating)

  const insertPayload = {
    reviewer_id: userId,
    [targetColumn]: targetId,
    order_id: body.order_id,
    rating: body.rating,
    text: body.review_text.slice(0, 4000),
    evidence: { flags, ip_address: ipAddress },
  }

  const { data, error } = await admin.from(table).insert(insertPayload).select('id').single()
  if (error) return { ok: false, error: error.message, status: 400 }

  await persistReviewActivity(admin, body).catch(() => {})

  return {
    ok: true,
    review_id: data.id,
    review_type: targetRole,
    flags,
    rating_stats: {
      previous_avg: Math.round(stats.avg * 100) / 100,
      previous_count: stats.count,
      projected_avg: Math.round(projectedAvg * 100) / 100,
      projected_count: stats.count + 1,
    },
  }
}

module.exports = { submitReview, persistReviewFlags }
