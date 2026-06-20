// scripts/activityRecorder.ts
// TFS Activity Recorder – expanded, backend only, idempotent

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const recorder = require('../backend/activity/activity_recorder.js')

export type ActivityEvent = {
  type: string
  userId?: string
  targetId?: string
  listingId?: string
  transactionId?: string
  disputeId?: string
  metadata?: Record<string, unknown>
  timestamp: string
}

export const {
  LOG_DIR,
  LOG_FILE,
  createEvent,
  recordEvent,
  recordEventAsync,
  persistEvent,
  logListingCreated,
  logListingEdited,
  logListingDeleted,
  logPaymentInitiated,
  logPaymentCompleted,
  logRefundRequested,
  logRefundProcessed,
  logDisputeOpened,
  logDisputeResolved,
  logReviewCreated,
  logAdminAction,
  logSuspiciousActivity,
  logLogin,
  logFailedLogin,
  getActivityRecorderStatus,
} = recorder

export function getTfsActivityRecorderStatus () {
  return getActivityRecorderStatus()
}
