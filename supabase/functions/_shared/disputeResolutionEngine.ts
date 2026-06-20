import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { logServerActivity } from './platformActivityLog.ts'
import { sendFollowupEmail } from './supportFollowup.ts'
import { notificationTriggers } from './notifications.ts'

export type DisputeStatus = 'open' | 'awaiting_response' | 'tfs_review' | 'resolved'

export async function openDispute (
  admin: SupabaseClient,
  params: {
    buyerId: string
    sellerId: string
    orderId: string
    description: string
    evidence?: Record<string, unknown>
  },
): Promise<{ ok: true; disputeId: string } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const { data, error } = await admin.from('dispute_cases').insert({
    buyer_id: params.buyerId,
    seller_id: params.sellerId,
    order_id: params.orderId,
    description: params.description.slice(0, 8000),
    evidence: params.evidence ?? {},
    status: 'open',
    updated_at: now,
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }

  await logServerActivity(admin, {
    userId: params.buyerId,
    eventType: 'dispute_opened',
    actionCategory: 'transaction',
    action: 'Dispute opened',
    metadata: { dispute_id: data.id, order_id: params.orderId, seller_id: params.sellerId },
  })

  return { ok: true, disputeId: data.id }
}

export async function notifyOtherParty (
  admin: SupabaseClient,
  disputeId: string,
): Promise<{ ok: true; notified_user_id: string } | { ok: false; error: string }> {
  const { data: dispute, error } = await admin
    .from('dispute_cases')
    .select('id, buyer_id, seller_id, status')
    .eq('id', disputeId)
    .maybeSingle()

  if (error || !dispute) return { ok: false, error: error?.message ?? 'not_found' }

  const notifyUserId = dispute.status === 'open' ? dispute.seller_id : dispute.buyer_id

  await admin.from('dispute_cases').update({
    status: 'awaiting_response',
    updated_at: new Date().toISOString(),
    ruling_metadata: { last_notified_user_id: notifyUserId, notified_at: new Date().toISOString() },
  }).eq('id', disputeId)

  await logServerActivity(admin, {
    userId: notifyUserId,
    eventType: 'dispute_notification',
    actionCategory: 'transaction',
    action: 'Dispute response requested',
    metadata: { dispute_id: disputeId },
  })

  const { data: authUser } = await admin.auth.admin.getUserById(notifyUserId)
  await notificationTriggers.dispute(admin, {
    userId: notifyUserId,
    disputeId,
    status: 'awaiting_response',
    toEmail: authUser?.user?.email ?? null,
  }).catch((e) => console.error('dispute notify', e))

  return { ok: true, notified_user_id: notifyUserId }
}

export async function escalateToTfs (
  admin: SupabaseClient,
  disputeId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await admin.from('dispute_cases').update({
    status: 'tfs_review',
    updated_at: new Date().toISOString(),
    ruling_metadata: { escalated_at: new Date().toISOString() },
  }).eq('id', disputeId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function resolveDispute (
  admin: SupabaseClient,
  disputeId: string,
  ruling: string,
  rulingMetadata?: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: dispute } = await admin
    .from('dispute_cases')
    .select('id, buyer_id, seller_id, status')
    .eq('id', disputeId)
    .maybeSingle()

  const { error } = await admin.from('dispute_cases').update({
    status: 'resolved',
    ruling: ruling.slice(0, 4000),
    ruling_metadata: rulingMetadata ?? {},
    updated_at: new Date().toISOString(),
  }).eq('id', disputeId)

  if (error) return { ok: false, error: error.message }

  if (dispute?.buyer_id && dispute.status !== 'resolved') {
    const { data: buyerAuth } = await admin.auth.admin.getUserById(dispute.buyer_id)
    await notificationTriggers.dispute(admin, {
      userId: dispute.buyer_id,
      disputeId,
      status: 'resolved',
      ruling,
      toEmail: buyerAuth?.user?.email ?? null,
    }).catch((e) => console.error('dispute resolve buyer', e))

    if (dispute.seller_id) {
      const { data: sellerAuth } = await admin.auth.admin.getUserById(dispute.seller_id)
      await notificationTriggers.dispute(admin, {
        userId: dispute.seller_id,
        disputeId,
        status: 'resolved',
        ruling,
        toEmail: sellerAuth?.user?.email ?? null,
      }).catch((e) => console.error('dispute resolve seller', e))
    }

    await sendFollowupEmail(admin, dispute.buyer_id, 'dispute', disputeId).catch((e) => {
      console.error('resolveDispute followup', disputeId, e instanceof Error ? e.message : e)
    })
  }

  return { ok: true }
}
