/**
 * Refund payment via Stripe + audit logging.
 */

const { logPaymentEvent } = require('./log_payment_event.js')
const { postLedgerEntry } = require('../accounting/ledger.js')

async function refundPayment (admin, stripe, {
  orderId,
  amountCents = null,
  reason = 'requested_by_customer',
  initiatedBy = 'system',
  reverseConnect = true,
}) {
  const { data: order } = await admin
    .from('orders')
    .select('id, buyer_id, seller_id, status, stripe_payment_intent_id, connect_checkout, amount, total_paid')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'order_not_found' }
  if (!order.stripe_payment_intent_id) return { ok: false, error: 'no_payment_intent' }
  if (order.status === 'refunded') return { ok: false, error: 'already_refunded' }

  const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id, { expand: ['latest_charge'] })
  const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id
  if (!chargeId) return { ok: false, error: 'charge_not_found' }

  const refundCents = amountCents ?? (pi.amount_received ?? pi.amount)
  const params = {
    charge: chargeId,
    amount: refundCents,
    reason: reason === 'fraudulent' ? 'fraudulent' : 'requested_by_customer',
    metadata: { order_id: orderId, initiated_by: initiatedBy },
  }
  if (order.connect_checkout && reverseConnect) {
    params.refund_application_fee = true
    params.reverse_transfer = true
  }

  const refund = await stripe.refunds.create(params)
  const refundAmount = (refund.amount ?? refundCents) / 100
  const now = new Date().toISOString()

  await admin.from('orders').update({
    status: 'refunded',
    escrow_status: 'refunded',
    stripe_refund_id: refund.id,
    refunded_at: now,
    refund_amount: refundAmount,
    refund_reason: reason,
    refund_initiated_by: initiatedBy,
  }).eq('id', orderId)

  await admin.from('order_refund_events').insert({
    order_id: orderId,
    stripe_refund_id: refund.id,
    amount: refundAmount,
    reason,
  })

  await logPaymentEvent(admin, {
    orderId,
    userId: order.buyer_id,
    eventType: 'refund_processed',
    amount: refundAmount,
    stripePaymentIntentId: order.stripe_payment_intent_id,
    metadata: { stripe_refund_id: refund.id, reason },
  })

  await postLedgerEntry(admin, {
    userId: order.buyer_id,
    entryType: 'credit',
    amount: refundAmount,
    category: 'refund',
    referenceId: orderId,
    referenceType: 'order',
    metadata: { stripe_refund_id: refund.id },
  })

  if (order.seller_id) {
    await postLedgerEntry(admin, {
      userId: order.seller_id,
      entryType: 'debit',
      amount: refundAmount,
      category: 'refund_reversal',
      referenceId: orderId,
      referenceType: 'order',
    })
  }

  return { ok: true, refund_id: refund.id, amount: refundAmount }
}

module.exports = { refundPayment }
