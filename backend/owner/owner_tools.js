/**
 * TFS Owner Tools — backend-only, idempotent (Supabase, not Prisma).
 */

const { logAdminAction, logSuspiciousActivity } = require('../activity/activity_recorder.js')
const { logOwnerAction } = require('./_shared.js')

const REFUNDABLE_STATUSES = new Set([
  'paid', 'shipped', 'delivered', 'confirmed', 'disputed', 'submitted_to_supplier',
])

async function auditOwnerTool (admin, actorId, action, metadata = {}) {
  await logAdminAction(actorId || 'ops', action, metadata, admin).catch(() => {})
  if (admin) {
    await logOwnerAction(admin, {
      action: `owner_tool_${action}`,
      targetType: 'owner_tool',
      targetId: metadata.userId || metadata.listingId || metadata.transactionId || metadata.disputeId || null,
      details: metadata,
      actorId: actorId || 'ops',
    }).catch(() => {})
  }
}

async function lookupUser (admin, userId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(userId || '').trim()
  if (!id) return { ok: false, error: 'user_id_required', status: 400 }

  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'User not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'lookup_user', { userId: id })
  return { ok: true, user: data }
}

async function lookupListing (admin, listingId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(listingId || '').trim()
  if (!id) return { ok: false, error: 'listing_id_required', status: 400 }

  const { data, error } = await admin
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'Listing not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'lookup_listing', { listingId: id })
  return { ok: true, listing: data }
}

async function lookupTransaction (admin, transactionId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(transactionId || '').trim()
  if (!id) return { ok: false, error: 'transaction_id_required', status: 400 }

  const { data, error } = await admin
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'Transaction not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'lookup_transaction', { transactionId: id })
  return { ok: true, transaction: data }
}

async function forceRefund (admin, transactionId, { actorId = 'ops', stripe = null, reason = 'ops_force_refund' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(transactionId || '').trim()

  const { data: order, error } = await admin.from('orders').select('*').eq('id', id).maybeSingle()
  if (error) return { ok: false, error: error.message, status: 400 }
  if (!order) return { ok: false, error: 'Transaction not found.', status: 404 }

  if (!REFUNDABLE_STATUSES.has(String(order.status))) {
    return { ok: false, error: 'Transaction not refundable.', status: 400 }
  }

  if (stripe && order.stripe_payment_intent_id) {
    const { processRefund } = require('../refunds/process_refund.js')
    const result = await processRefund(admin, stripe, {
      orderId: order.id,
      initiatedBy: 'ops',
      reason,
    })
    if (!result.ok) return { ...result, status: 400 }
    await auditOwnerTool(admin, actorId, 'force_refund', { transactionId: order.id, stripe: true })
    return { ok: true, success: true, refund: result }
  }

  const now = new Date().toISOString()
  const { error: updateError } = await admin.from('orders').update({
    status: 'refunded',
    escrow_status: 'refunded',
    refunded_at: now,
    refund_initiated_by: 'ops',
    refund_reason: reason,
  }).eq('id', order.id)

  if (updateError) return { ok: false, error: updateError.message, status: 400 }

  const { logRefundProcessed } = require('../activity/activity_recorder.js')
  await logRefundProcessed(order.buyer_id, order.id, admin).catch(() => {})
  await auditOwnerTool(admin, actorId, 'force_refund', { transactionId: order.id, stripe: false })

  return { ok: true, success: true }
}

async function resolveDispute (admin, disputeId, { actorId = 'ops', ruling = 'Resolved by owner' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(disputeId || '').trim()
  if (!id) return { ok: false, error: 'dispute_id_required', status: 400 }

  const { data: dispute } = await admin.from('dispute_cases').select('*').eq('id', id).maybeSingle()
  if (!dispute) return { ok: false, error: 'Dispute not found.', status: 404 }

  const { resolveDispute: ownerResolve } = require('./manual_dispute_review.js')
  const result = await ownerResolve(admin, id, {
    ruling,
    ruling_metadata: { resolved_by_owner: true, ruled_by: 'owner' },
  })

  if (!result.ok) return { ...result, status: 400 }
  await auditOwnerTool(admin, actorId, 'resolve_dispute', { disputeId: id })
  return { ok: true, success: true, dispute_id: id }
}

async function verifySeller (admin, userId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(userId || '').trim()
  const now = new Date().toISOString()

  const { data, error } = await admin
    .from('profiles')
    .update({
      seller_policies_accepted_at: now,
      seller_policies_version: 'owner_override',
      seller_policies_signer_name: 'Owner verification',
      active_store: true,
    })
    .eq('id', id)
    .select('id, seller_policies_accepted_at')
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'User not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'verify_seller', { userId: id })
  return { ok: true, success: true, user_id: id, is_verified_seller: true }
}

async function unverifySeller (admin, userId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(userId || '').trim()

  const { data, error } = await admin
    .from('profiles')
    .update({
      seller_policies_accepted_at: null,
      seller_policies_version: null,
      active_store: false,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'User not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'unverify_seller', { userId: id })
  return { ok: true, success: true, user_id: id, is_verified_seller: false }
}

async function verifyBuyer (admin, userId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(userId || '').trim()
  const now = new Date().toISOString()

  const { data, error } = await admin
    .from('profiles')
    .update({
      phone_verified_at: now,
      requires_phone_verification: false,
    })
    .eq('id', id)
    .select('id, phone_verified_at')
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'User not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'verify_buyer', { userId: id })
  return { ok: true, success: true, user_id: id, is_verified_buyer: true }
}

async function unverifyBuyer (admin, userId, { actorId = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable', status: 503 }
  const id = String(userId || '').trim()

  const { data, error } = await admin
    .from('profiles')
    .update({
      phone_verified_at: null,
      requires_phone_verification: true,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: error.message, status: 400 }
  if (!data) return { ok: false, error: 'User not found.', status: 404 }

  await auditOwnerTool(admin, actorId, 'unverify_buyer', { userId: id })
  return { ok: true, success: true, user_id: id, is_verified_buyer: false }
}

async function banUser (admin, userId, { actorId = 'ops', reason = 'owner_ban' } = {}) {
  const { banUser: ownerBan } = require('./actions.js')
  const result = await ownerBan(admin, { user_id: userId, reason })
  if (!result.ok) return { ...result, status: 400 }

  await logSuspiciousActivity(userId, 'owner_ban', { actor_id: actorId }, admin).catch(() => {})
  await auditOwnerTool(admin, actorId, 'ban_user', { userId })
  return { ok: true, success: true, user_id: userId }
}

async function unbanUserTool (admin, userId, { actorId = 'ops' } = {}) {
  const { unbanUser } = require('./actions.js')
  const result = await unbanUser(admin, { user_id: userId })
  if (!result.ok) return { ...result, status: 400 }
  await auditOwnerTool(admin, actorId, 'unban_user', { userId })
  return { ok: true, success: true, user_id: userId }
}

function requireOwnerContext ({ opsKeyValid = false, userId = null, roles = [] } = {}) {
  if (opsKeyValid) return { ok: true, method: 'ops_key' }
  const list = Array.isArray(roles) ? roles : []
  if (userId && list.includes('owner')) return { ok: true, method: 'owner_role' }
  return { ok: false, status: 403, error: 'Owner access required.' }
}

function getOwnerToolsStatus () {
  return {
    lookups: ['user', 'listing', 'transaction'],
    actions: [
      'force_refund',
      'resolve_dispute',
      'verify_seller',
      'unverify_seller',
      'verify_buyer',
      'unverify_buyer',
      'ban_user',
      'unban_user',
    ],
    auth: ['ops_key', 'owner_role'],
  }
}

module.exports = {
  lookupUser,
  lookupListing,
  lookupTransaction,
  forceRefund,
  resolveDispute,
  verifySeller,
  unverifySeller,
  verifyBuyer,
  unverifyBuyer,
  banUser,
  unbanUserTool,
  requireOwnerContext,
  getOwnerToolsStatus,
}
