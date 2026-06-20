/**
 * Express handlers for review routes.
 */

const { getServiceSupabaseFromEnv } = require('../marketplace/_env.js')
const { submitReview } = require('./submit_review.js')

async function createReviewHandler (req, res) {
  try {
    const admin = getServiceSupabaseFromEnv()
    const userId = req.user?.id ?? null
    const body = req.body && typeof req.body === 'object' ? req.body : {}

    const result = await submitReview(admin, {
      review: body,
      userId,
      isBanned: Boolean(req.user?.is_banned),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    })

    if (!result.ok) {
      return res.status(result.status || 400).json({
        error: result.error,
        ...(result.flags ? { flags: result.flags } : {}),
      })
    }

    return res.status(201).json(result)
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'review_submit_failed' })
  }
}

module.exports = { createReviewHandler }
