/**
 * Express-style activity hooks — mirrors scripts/activityRecorder usage examples.
 */

const {
  logListingCreated,
  logPaymentInitiated,
  logReviewCreated,
  logAdminAction,
  logSuspiciousActivity,
} = require('./activity_recorder.js')

function actorId (req) {
  return req?.user?.id ?? req?.userId ?? null
}

function recordListingCreatedFromRequest (req, listingId, admin = null) {
  const userId = actorId(req)
  if (!userId || !listingId) return null
  return logListingCreated(userId, String(listingId), admin)
}

function recordPaymentInitiatedFromRequest (req, transactionId, metadata = {}, admin = null) {
  const userId = actorId(req)
  if (!userId || !transactionId) return null
  return logPaymentInitiated(userId, String(transactionId), metadata, admin)
}

function recordReviewCreatedFromRequest (req, targetUserId, metadata = {}, admin = null) {
  const userId = actorId(req)
  if (!userId || !targetUserId) return null
  return logReviewCreated(userId, String(targetUserId), metadata, admin)
}

function recordAdminActionFromRequest (req, action, metadata = {}, admin = null) {
  const ownerId = actorId(req) || 'ops'
  return logAdminAction(ownerId, String(action), metadata, admin)
}

function recordSuspiciousActivityFromRequest (req, reason, metadata = {}, admin = null) {
  const userId = actorId(req)
  if (!userId) return null
  return logSuspiciousActivity(userId, String(reason), metadata, admin)
}

module.exports = {
  recordListingCreatedFromRequest,
  recordPaymentInitiatedFromRequest,
  recordReviewCreatedFromRequest,
  recordAdminActionFromRequest,
  recordSuspiciousActivityFromRequest,
}
