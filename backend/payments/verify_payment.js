/**
 * Verify payment intent succeeded and matches order totals.
 */

const { logPaymentEvent } = require('./log_payment_event.js')
const { validateOrderTax } = require('../tax/calculate_tax.js')

async function verifyPayment (admin, stripe, {
  orderId,
  paymentIntentId,
  shippingZip = null,
}) {
  if (!stripe) return { ok: false, error: 'stripe_required' }

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (pi.status !== 'succeeded') {
    return { ok: false, error: 'payment_not_succeeded', status: pi.status }
  }

  const metaOrderId = pi.metadata?.order_id
  if (orderId && metaOrderId && metaOrderId !== orderId) {
    return { ok: false, error: 'order_mismatch' }
  }

  const resolvedOrderId = orderId || metaOrderId
  const { data: order } = resolvedOrderId
    ? await admin.from('orders').select('*').eq('id', resolvedOrderId).maybeSingle()
    : { data: null }

  if (!order) return { ok: false, error: 'order_not_found' }

  const paidCents = pi.amount_received ?? pi.amount
  const expectedCents = order.total_paid != null
    ? Math.round(Number(order.total_paid) * 100)
    : Math.round(Number(order.amount) * 100)

  if (Math.abs(paidCents - expectedCents) > 1) {
    return { ok: false, error: 'amount_mismatch', paid: paidCents / 100, expected: expectedCents / 100 }
  }

  const zip = shippingZip || order.shipping_zip || pi.metadata?.shipping_zip
  if (zip) {
    const taxCheck = await validateOrderTax(admin, {
      orderId: order.id,
      shippingZip: zip,
      expectedTaxAmount: order.tax_amount,
    })
    if (!taxCheck.ok && taxCheck.error === 'tax_mismatch') {
      return taxCheck
    }
  }

  await logPaymentEvent(admin, {
    orderId: order.id,
    userId: order.buyer_id,
    eventType: 'payment_verified',
    amount: paidCents / 100,
    stripePaymentIntentId: paymentIntentId,
    metadata: { status: pi.status },
  })

  return { ok: true, order_id: order.id, payment_intent_id: paymentIntentId, amount: paidCents / 100 }
}

module.exports = { verifyPayment }
