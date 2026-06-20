/**
 * Seller or ops approves a refund request.
 */

const { logRefundEvent } = require('./request_refund.js')
const { processRefund } = require('./process_refund.js')

async function approveRefund (admin, stripe, { refundRequestId, actorId, opsApproved = false }) {
  const { data: req } = await admin
    .from('refund_requests')
    .select('*')
    .eq('id', refundRequestId)
    .maybeSingle()

  if (!req) return { ok: false, error: 'not_found' }
  if (req.status !== 'pending') return { ok: false, error: 'invalid_status' }
  if (!opsApproved && actorId !== req.seller_id) return { ok: false, error: 'forbidden' }

  await admin.from('refund_requests').update({
    status: 'approved',
    updated_at: new Date().toISOString(),
  }).eq('id', refundRequestId)

  await logRefundEvent(admin, {
    orderId: req.order_id,
    refundRequestId,
    actorId,
    action: 'approved',
    amount: req.amount,
  })

  return processRefund(admin, stripe, {
    orderId: req.order_id,
    refundRequestId,
    amount: req.amount,
    initiatedBy: opsApproved ? 'ops' : 'seller',
  })
}

module.exports = { approveRefund }
