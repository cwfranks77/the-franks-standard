/**
 * TFS Activity Recorder — backend-only, idempotent.
 * Writes to local logs/activity.log and optionally platform_activity_events.
 */

const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'activity.log')

const EVENT_CATEGORIES = {
  listing_created: { category: 'listing', action: 'Listing created' },
  listing_edited: { category: 'listing', action: 'Listing edited' },
  listing_deleted: { category: 'listing', action: 'Listing deleted' },
  payment_initiated: { category: 'transaction', action: 'Payment initiated' },
  payment_completed: { category: 'transaction', action: 'Payment completed' },
  refund_requested: { category: 'transaction', action: 'Refund requested' },
  refund_processed: { category: 'transaction', action: 'Refund processed' },
  dispute_opened: { category: 'safety', action: 'Dispute opened' },
  dispute_resolved: { category: 'safety', action: 'Dispute resolved' },
  review_created: { category: 'general', action: 'Review submitted' },
  admin_action: { category: 'owner', action: 'Admin action' },
  suspicious_activity: { category: 'infraction', action: 'Suspicious activity' },
  login: { category: 'auth', action: 'Login' },
  failed_login: { category: 'auth', action: 'Failed login' },
}

let logDirReady = false

function ensureLogDir () {
  if (logDirReady) return
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
  logDirReady = true
}

function createEvent (type, data = {}) {
  return {
    type,
    timestamp: new Date().toISOString(),
    ...data,
  }
}

function buildMetadata (event) {
  return {
    target_id: event.targetId ?? null,
    listing_id: event.listingId ?? null,
    transaction_id: event.transactionId ?? null,
    dispute_id: event.disputeId ?? null,
    ...(event.metadata && typeof event.metadata === 'object' ? event.metadata : {}),
  }
}

function recordEvent (event) {
  ensureLogDir()
  const line = `${JSON.stringify(event)}\n`
  fs.appendFileSync(LOG_FILE, line, 'utf8')
  return event
}

async function persistEvent (admin, event) {
  if (!admin) return { ok: true, persisted: false }

  const mapping = EVENT_CATEGORIES[event.type] || { category: 'general', action: event.type }
  const userId = event.userId ?? null

  const { error } = await admin.from('platform_activity_events').insert({
    user_id: userId,
    event_type: event.type,
    action: mapping.action,
    action_category: mapping.category,
    metadata: buildMetadata(event),
    created_at: event.timestamp || new Date().toISOString(),
  })

  if (error) return { ok: false, error: error.message, persisted: false }
  return { ok: true, persisted: true }
}

async function recordEventAsync (event, admin = null) {
  recordEvent(event)
  if (!admin) return { ok: true, file: true, persisted: false }
  const db = await persistEvent(admin, event)
  return { ok: db.ok, file: true, persisted: db.persisted, error: db.error }
}

function logListingCreated (userId, listingId, admin = null) {
  const event = createEvent('listing_created', { userId, listingId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logListingEdited (userId, listingId, admin = null) {
  const event = createEvent('listing_edited', { userId, listingId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logListingDeleted (userId, listingId, admin = null) {
  const event = createEvent('listing_deleted', { userId, listingId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logPaymentInitiated (userId, transactionId, metadata, admin = null) {
  const event = createEvent('payment_initiated', { userId, transactionId, metadata })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logPaymentCompleted (userId, transactionId, metadata, admin = null) {
  const event = createEvent('payment_completed', { userId, transactionId, metadata })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logRefundRequested (userId, transactionId, admin = null) {
  const event = createEvent('refund_requested', { userId, transactionId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logRefundProcessed (userId, transactionId, admin = null) {
  const event = createEvent('refund_processed', { userId, transactionId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logDisputeOpened (userId, disputeId, admin = null) {
  const event = createEvent('dispute_opened', { userId, disputeId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logDisputeResolved (userId, disputeId, admin = null) {
  const event = createEvent('dispute_resolved', { userId, disputeId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logReviewCreated (userId, targetId, metadata, admin = null) {
  const event = createEvent('review_created', { userId, targetId, metadata })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logAdminAction (ownerId, action, metadata, admin = null) {
  const event = createEvent('admin_action', {
    userId: ownerId,
    metadata: { action, ...(metadata && typeof metadata === 'object' ? metadata : {}) },
  })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logSuspiciousActivity (userId, reason, metadata, admin = null) {
  const event = createEvent('suspicious_activity', {
    userId,
    metadata: { reason, ...(metadata && typeof metadata === 'object' ? metadata : {}) },
  })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logLogin (userId, admin = null) {
  const event = createEvent('login', { userId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function logFailedLogin (userId, admin = null) {
  const event = createEvent('failed_login', { userId })
  recordEvent(event)
  return admin ? persistEvent(admin, event) : Promise.resolve({ ok: true, file: true })
}

function getActivityRecorderStatus () {
  return {
    log_dir: LOG_DIR,
    log_file: LOG_FILE,
    event_types: Object.keys(EVENT_CATEGORIES),
    file_logging: true,
    database_table: 'platform_activity_events',
  }
}

module.exports = {
  LOG_DIR,
  LOG_FILE,
  EVENT_CATEGORIES,
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
}
