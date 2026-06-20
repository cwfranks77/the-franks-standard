/**
 * Buyer refund request — within 48 hours of purchase.
 */

const REFUND_WINDOW_MS = 48 * 60 * 60 * 1000
const SELLER_RESPONSE_MS = 72 * 60 * 60 * 1000

async function logRefundEvent (admin, row) {
  await admin.from('refund_events').insert({
    order_id: row.orderId,
    refund_request_id: row.refundRequestId ?? null,
    actor_id: row.actorId ?? null,
    action: row.action,
    amount: row.amount ?? null,
    reason: row.reason ?? null,
    metadata: row.metadata ?? {},
  })
}

async function requestRefund (admin, { orderId, buyerId, amount, reason }) {
  const { data: order } = await admin
    .from('orders')
    .select('id, buyer_id, seller_id, status, paid_at, amount, total_paid')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'order_not_found' }
  if (order.buyer_id !== buyerId) return { ok: false, error: 'forbidden' }
  if (!['paid', 'shipped', 'delivered', 'confirmed'].includes(order.status)) {
    return { ok: false, error: 'order_not_refundable' }
  }

  const paidAt = order.paid_at ? new Date(order.paid_at).getTime() : 0
  if (!paidAt || Date.now() - paidAt > REFUND_WINDOW_MS) {
    return { ok: false, error: 'refund_window_expired', window_hours: 48 }
  }

  const refundAmount = amount != null
    ? Number(amount)
    : Number(order.total_paid ?? order.amount)

  const deadline = new Date(Date.now() + SELLER_RESPONSE_MS).toISOString()

  const { data, error } = await admin.from('refund_requests').insert({
    order_id: orderId,
    buyer_id: buyerId,
    seller_id: order.seller_id,
    amount: refundAmount,
    reason: String(reason || '').slice(0, 2000),
    status: 'pending',
    seller_response_deadline: deadline,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  await logRefundEvent(admin, {
    orderId,
    refundRequestId: data.id,
    actorId: buyerId,
    action: 'requested',
    amount: refundAmount,
    reason,
  })

  return { ok: true, refund_request_id: data.id, seller_response_deadline: deadline }
}

module.exports = { requestRefund, logRefundEvent, REFUND_WINDOW_MS, SELLER_RESPONSE_MS }
