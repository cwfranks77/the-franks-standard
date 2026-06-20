import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { queueTransactionalEmail } from './emailQueue.ts'

export async function sendNotification (
  admin: SupabaseClient,
  params: {
    userId: string
    type: string
    message: string
    metadata?: Record<string, unknown>
    alsoEmail?: boolean
    emailTemplateKey?: string
    emailData?: Record<string, unknown>
    toEmail?: string | null
  },
): Promise<{ ok: true; notification_id: string } | { ok: false; error: string }> {
  const { userId, type, message, metadata = {}, alsoEmail, emailTemplateKey, emailData, toEmail } = params
  if (!userId || !type || !message) return { ok: false, error: 'missing_fields' }

  const { data, error } = await admin.from('notifications').insert({
    user_id: userId,
    type,
    message: String(message).slice(0, 4000),
    metadata,
    read: false,
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }

  if (alsoEmail && toEmail && emailTemplateKey) {
    await queueTransactionalEmail(admin, {
      userId,
      toEmail,
      templateKey: emailTemplateKey,
      templateData: emailData ?? {},
    }).catch((e) => console.error('notification email', e))
  }

  return { ok: true, notification_id: data.id }
}

export const notificationTriggers = {
  purchase: async (
    admin: SupabaseClient,
    p: { userId: string; orderId: string; total?: string; toEmail?: string | null },
  ) => sendNotification(admin, {
    userId: p.userId,
    type: 'purchase',
    message: `Your order ${p.orderId} was confirmed.`,
    metadata: { order_id: p.orderId, total: p.total },
    alsoEmail: !!p.toEmail,
    toEmail: p.toEmail,
    emailTemplateKey: 'order_confirmation',
    emailData: { order_id: p.orderId, total: p.total },
  }),

  dispute: async (
    admin: SupabaseClient,
    p: { userId: string; disputeId: string; status: string; ruling?: string; toEmail?: string | null },
  ) => sendNotification(admin, {
    userId: p.userId,
    type: 'dispute',
    message: `Dispute update: ${p.status}.`,
    metadata: { dispute_id: p.disputeId, status: p.status, ruling: p.ruling },
    alsoEmail: !!p.toEmail,
    toEmail: p.toEmail,
    emailTemplateKey: 'dispute_update',
    emailData: { status: p.status, ruling: p.ruling },
  }),

  fraudCase: async (
    admin: SupabaseClient,
    p: { userId: string; caseId: string; status: string },
  ) => sendNotification(admin, {
    userId: p.userId,
    type: 'fraud_case',
    message: 'A security review case on your account was updated.',
    metadata: { case_id: p.caseId, status: p.status },
  }),

  accountFreeze: async (admin: SupabaseClient, p: { userId: string; reason: string }) =>
    sendNotification(admin, {
      userId: p.userId,
      type: 'account_freeze',
      message: 'Your account has been temporarily frozen.',
      metadata: { reason: p.reason },
    }),

  accountBan: async (admin: SupabaseClient, p: { userId: string; reason: string }) =>
    sendNotification(admin, {
      userId: p.userId,
      type: 'account_ban',
      message: 'Your account has been permanently banned from the marketplace.',
      metadata: { reason: p.reason },
    }),

  coaUpload: async (
    admin: SupabaseClient,
    p: { userId: string; coaSerial?: string; listingId: string },
  ) => sendNotification(admin, {
    userId: p.userId,
    type: 'coa_upload',
    message: `COA ${p.coaSerial || ''} was issued successfully.`,
    metadata: { coa_serial: p.coaSerial, listing_id: p.listingId },
  }),

  spotlightSelected: async (
    admin: SupabaseClient,
    p: { userId: string; storeName?: string; date: string },
  ) => sendNotification(admin, {
    userId: p.userId,
    type: 'spotlight_selected',
    message: `Congratulations! ${p.storeName || 'Your store'} is today's spotlight store.`,
    metadata: { spotlight_date: p.date },
  }),

  planExpiration: async (
    admin: SupabaseClient,
    p: { userId: string; planName: string; expiresAt: string; toEmail?: string | null },
  ) => sendNotification(admin, {
    userId: p.userId,
    type: 'plan_expiration',
    message: `Your seller plan expires on ${p.expiresAt}.`,
    metadata: { plan_name: p.planName, expires_at: p.expiresAt },
    alsoEmail: !!p.toEmail,
    toEmail: p.toEmail,
    emailTemplateKey: 'plan_expiration_warning',
    emailData: { plan_name: p.planName, expires_at: p.expiresAt },
  }),
}
