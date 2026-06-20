/**
 * Owner manual dispute review.
 */

const { logOwnerAction } = require('./_shared.js')

async function viewDispute (admin, disputeId) {
  const { data, error } = await admin
    .from('dispute_cases')
    .select('*, orders(id, amount, status, listing_id)')
    .eq('id', disputeId)
    .maybeSingle()
  if (error || !data) return { ok: false, error: error?.message ?? 'dispute_not_found' }
  return { ok: true, dispute: data }
}

async function requestMoreInfo (admin, disputeId, { message = '' } = {}) {
  const { data: dispute } = await admin.from('dispute_cases').select('buyer_id, seller_id, status').eq('id', disputeId).maybeSingle()
  if (!dispute) return { ok: false, error: 'dispute_not_found' }

  const notifyUserId = dispute.status === 'open' ? dispute.seller_id : dispute.buyer_id
  const { error } = await admin.from('dispute_cases').update({
    status: 'awaiting_response',
    updated_at: new Date().toISOString(),
    ruling_metadata: {
      owner_requested_info_at: new Date().toISOString(),
      owner_message: String(message).slice(0, 2000),
      notified_user_id: notifyUserId,
    },
  }).eq('id', disputeId)

  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'dispute_request_info', targetType: 'dispute_case', targetId: disputeId, details: { message } })
  return { ok: true, dispute_id: disputeId, notified_user_id: notifyUserId }
}

async function ruleInFavorOfBuyer (admin, disputeId, { ruling = 'Ruled in favor of buyer' } = {}) {
  return resolveDispute(admin, disputeId, {
    ruling,
    ruling_metadata: { outcome: 'buyer', ruled_by: 'owner' },
  })
}

async function ruleInFavorOfSeller (admin, disputeId, { ruling = 'Ruled in favor of seller' } = {}) {
  return resolveDispute(admin, disputeId, {
    ruling,
    ruling_metadata: { outcome: 'seller', ruled_by: 'owner' },
  })
}

async function escalateToFraud (admin, disputeId) {
  const { data: dispute } = await admin.from('dispute_cases').select('*').eq('id', disputeId).maybeSingle()
  if (!dispute) return { ok: false, error: 'dispute_not_found' }

  const { data: fraudCase, error } = await admin.from('fraud_cases').insert({
    user_id: dispute.seller_id,
    severity: 'high',
    status: 'open',
    evidence: {
      source: 'dispute_escalation',
      dispute_id: disputeId,
      order_id: dispute.order_id,
      description: dispute.description,
      is_test: false,
    },
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  await admin.from('dispute_cases').update({
    status: 'tfs_review',
    updated_at: new Date().toISOString(),
    ruling_metadata: { escalated_to_fraud_case_id: fraudCase.id },
  }).eq('id', disputeId)

  await logOwnerAction(admin, {
    action: 'dispute_escalate_fraud',
    targetType: 'dispute_case',
    targetId: disputeId,
    details: { fraud_case_id: fraudCase.id },
  })

  return { ok: true, dispute_id: disputeId, fraud_case_id: fraudCase.id }
}

async function closeDispute (admin, disputeId, { ruling = 'Closed by owner' } = {}) {
  return resolveDispute(admin, disputeId, {
    ruling,
    ruling_metadata: { outcome: 'closed', ruled_by: 'owner' },
  })
}

async function resolveDispute (admin, disputeId, { ruling, ruling_metadata }) {
  const { error } = await admin.from('dispute_cases').update({
    status: 'resolved',
    ruling: String(ruling).slice(0, 4000),
    ruling_metadata: ruling_metadata ?? {},
    updated_at: new Date().toISOString(),
  }).eq('id', disputeId)

  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'dispute_resolve', targetType: 'dispute_case', targetId: disputeId, details: { ruling } })
  return { ok: true, dispute_id: disputeId, status: 'resolved', ruling }
}

module.exports = {
  viewDispute,
  requestMoreInfo,
  ruleInFavorOfBuyer,
  ruleInFavorOfSeller,
  escalateToFraud,
  closeDispute,
}
