// scripts/activityRecorderHooks.ts
// Express-style activity logging — matches activityRecorder usage examples.

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const hooks = require('../backend/activity/request_hooks.js')

export type ActivityRequest = {
  user?: { id?: string }
  userId?: string
}

export const {
  recordListingCreatedFromRequest,
  recordPaymentInitiatedFromRequest,
  recordReviewCreatedFromRequest,
  recordAdminActionFromRequest,
  recordSuspiciousActivityFromRequest,
} = hooks

/**
 * Example usage in Express handlers:
 *
 * recordListingCreatedFromRequest(req, newListing.id, admin)
 * recordPaymentInitiatedFromRequest(req, transaction.id, { listing_id }, admin)
 * recordReviewCreatedFromRequest(req, targetUserId, { rating }, admin)
 * recordAdminActionFromRequest(req, 'force_refund', { transactionId }, admin)
 * recordSuspiciousActivityFromRequest(req, 'multiple failed logins', {}, admin)
 */

// Direct imports (same as your sketch) remain available from ./activityRecorder:
// logListingCreated(req.user.id, newListing.id)
