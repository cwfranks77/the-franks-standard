/**
 * Deny a refund request — may escalate to dispute.
 */

const { logRefundEvent } = require('./request_refund.js')

async function denyRefund (admin, { refundRequestId, actorId, reason, escalateToDispute = false }) {
  const { data: req } = await admin
    .from('refund_requests')
    .select('*')
    .eq('id', refundRequestId)
    .maybeSingle()

  if (!req) return { ok: false, error: 'not_found' }
  if (req.status !== 'pending') return { ok: false, error: 'invalid_status' }
  if (actorId !== req.seller_id) return { ok: false, error: 'forbidden' }

  const status = escalateToDispute ? 'escalated' : 'denied'

  await admin.from('refund_requests').update({
    status,
    updated_at: new Date().toISOString(),
  }).eq('id', refundRequestId)

  await logRefundEvent(admin, {
    orderId: req.order_id,
    refundRequestId,
    actorId,
    action: status,
    reason,
  })

  if (escalateToDispute) {
    await admin.from('dispute_cases').insert({
      buyer_id: req.buyer_id,
      seller_id: req.seller_id,
      order_id: req.order_id,
      description: `Auto-escalated from denied refund request: ${reason || ''}`.slice(0, 8000),
      status: 'open',
      evidence: { refund_request_id: refundRequestId },
    }).catch(() => {})
  }

  return { ok: true, refund_request_id: refundRequestId, status }
}

module.exports = { denyRefund }
