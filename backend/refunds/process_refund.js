/**
 * Process approved refund via Stripe.
 */

const { refundPayment } = require('../payments/refund_payment.js')
const { logRefundEvent } = require('./request_refund.js')
const { holdPayout } = require('../payouts/hold_payout.js')

async function processRefund (admin, stripe, {
  orderId,
  refundRequestId = null,
  amount = null,
  initiatedBy = 'system',
  reason = 'refund_approved',
}) {
  const amountCents = amount != null ? Math.round(Number(amount) * 100) : null

  const result = await refundPayment(admin, stripe, {
    orderId,
    amountCents,
    reason,
    initiatedBy,
  })

  if (!result.ok) return result

  if (refundRequestId) {
    await admin.from('refund_requests').update({
      status: 'processed',
      updated_at: new Date().toISOString(),
    }).eq('id', refundRequestId)
  }

  await logRefundEvent(admin, {
    orderId,
    refundRequestId,
    action: 'processed',
    amount: result.amount,
    metadata: { stripe_refund_id: result.refund_id },
  })

  const { data: payout } = await admin
    .from('payouts')
    .select('id')
    .eq('order_id', orderId)
    .in('status', ['pending', 'scheduled', 'held'])
    .limit(1)
    .maybeSingle()

  if (payout?.id) {
    await holdPayout(admin, { payoutId: payout.id, reason: 'refund_processed' })
  }

  return result
}

/** Auto-escalate refund requests past seller deadline. */
async function escalateOverdueRefundRequests (admin) {
  const now = new Date().toISOString()
  const { data: overdue } = await admin
    .from('refund_requests')
    .select('id, order_id, buyer_id, seller_id, amount, reason')
    .eq('status', 'pending')
    .lt('seller_response_deadline', now)

  const escalated = []
  for (const req of overdue ?? []) {
    await admin.from('refund_requests').update({ status: 'escalated', updated_at: now }).eq('id', req.id)
    await admin.from('dispute_cases').insert({
      buyer_id: req.buyer_id,
      seller_id: req.seller_id,
      order_id: req.order_id,
      description: `Seller did not respond within 72 hours. Original reason: ${req.reason || ''}`.slice(0, 8000),
      status: 'open',
      evidence: { refund_request_id: req.id, auto_escalated: true },
    }).catch(() => {})
    await logRefundEvent(admin, {
      orderId: req.order_id,
      refundRequestId: req.id,
      action: 'auto_escalated',
      amount: req.amount,
    })
    escalated.push(req.id)
  }

  return { ok: true, escalated_count: escalated.length, ids: escalated }
}

module.exports = { processRefund, escalateOverdueRefundRequests }
