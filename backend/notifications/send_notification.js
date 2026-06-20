/**
 * In-platform notification delivery.
 */

const { queueEmail } = require('../email/email_queue.js')

const NOTIFICATION_TYPES = [
  'purchase',
  'dispute',
  'fraud_case',
  'account_freeze',
  'account_ban',
  'coa_upload',
  'spotlight_selected',
  'plan_expiration',
  'broadcast',
  'support_ticket',
]

async function sendNotification (admin, {
  userId,
  type,
  message,
  metadata = {},
  alsoEmail = false,
  emailTemplateKey = null,
  emailData = {},
  toEmail = null,
}) {
  if (!userId || !type || !message) {
    return { ok: false, error: 'missing_fields' }
  }

  const { data, error } = await admin.from('notifications').insert({
    user_id: userId,
    type,
    message: String(message).slice(0, 4000),
    metadata,
    read: false,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  if (alsoEmail && toEmail && emailTemplateKey) {
    await queueEmail(admin, {
      userId,
      toEmail,
      templateKey: emailTemplateKey,
      templateData: emailData,
    })
  }

  return { ok: true, notification_id: data.id }
}

/** Convenience triggers for platform events. */
const triggers = {
  purchase: (admin, { userId, orderId, total, toEmail }) => sendNotification(admin, {
    userId,
    type: 'purchase',
    message: `Your order ${orderId} was confirmed.`,
    metadata: { order_id: orderId, total },
    alsoEmail: !!toEmail,
    toEmail,
    emailTemplateKey: 'order_confirmation',
    emailData: { order_id: orderId, total },
  }),

  dispute: (admin, { userId, disputeId, status, ruling, toEmail }) => sendNotification(admin, {
    userId,
    type: 'dispute',
    message: `Dispute update: ${status}.`,
    metadata: { dispute_id: disputeId, status, ruling },
    alsoEmail: !!toEmail,
    toEmail,
    emailTemplateKey: 'dispute_update',
    emailData: { status, ruling },
  }),

  fraudCase: (admin, { userId, caseId, status }) => sendNotification(admin, {
    userId,
    type: 'fraud_case',
    message: 'A security review case on your account was updated.',
    metadata: { case_id: caseId, status },
  }),

  accountFreeze: (admin, { userId, reason }) => sendNotification(admin, {
    userId,
    type: 'account_freeze',
    message: 'Your account has been temporarily frozen.',
    metadata: { reason },
  }),

  accountBan: (admin, { userId, reason }) => sendNotification(admin, {
    userId,
    type: 'account_ban',
    message: 'Your account has been permanently banned from the marketplace.',
    metadata: { reason },
  }),

  coaUpload: (admin, { userId, coaSerial, listingId }) => sendNotification(admin, {
    userId,
    type: 'coa_upload',
    message: `COA ${coaSerial || ''} was uploaded successfully.`,
    metadata: { coa_serial: coaSerial, listing_id: listingId },
  }),

  spotlightSelected: (admin, { userId, storeName, date }) => sendNotification(admin, {
    userId,
    type: 'spotlight_selected',
    message: `Congratulations! ${storeName || 'Your store'} is today's spotlight store.`,
    metadata: { spotlight_date: date },
  }),

  planExpiration: (admin, { userId, planName, expiresAt, toEmail }) => sendNotification(admin, {
    userId,
    type: 'plan_expiration',
    message: `Your seller plan expires on ${expiresAt}.`,
    metadata: { plan_name: planName, expires_at: expiresAt },
    alsoEmail: !!toEmail,
    toEmail,
    emailTemplateKey: 'plan_expiration_warning',
    emailData: { plan_name: planName, expires_at: expiresAt },
  }),
}

module.exports = { sendNotification, triggers, NOTIFICATION_TYPES }
