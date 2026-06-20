/**
 * Stripe webhook dispatcher — logs all payment events.
 */

const { logPaymentEvent } = require('./log_payment_event.js')
const { finalizeOrder } = require('../orders/finalize_order.js')
const { refundPayment } = require('./refund_payment.js')

async function handleWebhookEvent (admin, stripe, event) {
  const type = event.type
  const obj = event.data?.object || {}

  await logPaymentEvent(admin, {
    eventType: `webhook_${type}`,
    stripeEventId: event.id,
    stripePaymentIntentId: obj.payment_intent || obj.id,
    stripeChargeId: obj.charge || (type.startsWith('charge.') ? obj.id : null),
    amount: obj.amount != null ? obj.amount / 100 : (obj.amount_received != null ? obj.amount_received / 100 : null),
    metadata: { stripe_type: type },
  })

  if (type === 'payment_intent.succeeded') {
    const orderId = obj.metadata?.order_id
    if (orderId) {
      return finalizeOrder(admin, {
        orderId,
        paymentIntentId: obj.id,
        buyerEmail: null,
      })
    }
  }

  if (type === 'checkout.session.completed') {
    const orderId = obj.metadata?.order_id || obj.client_reference_id
    if (orderId) {
      const pi = typeof obj.payment_intent === 'string' ? obj.payment_intent : obj.payment_intent?.id
      const shippingZip = obj.shipping_details?.address?.postal_code
        || obj.customer_details?.address?.postal_code
        || null
      return finalizeOrder(admin, {
        orderId,
        sessionId: obj.id,
        paymentIntentId: pi,
        totalPaid: obj.amount_total != null ? obj.amount_total / 100 : null,
        taxAmount: obj.total_details?.amount_tax != null ? obj.total_details.amount_tax / 100 : null,
        buyerEmail: obj.customer_details?.email,
        shippingZip,
      })
    }
  }

  if (type === 'charge.refunded') {
    const orderId = obj.metadata?.order_id
    if (orderId && stripe) {
      return refundPayment(admin, stripe, {
        orderId,
        reason: obj.metadata?.refund_reason || 'stripe_webhook',
        initiatedBy: 'stripe_webhook',
      })
    }
  }

  return { ok: true, handled: false, event_type: type }
}

module.exports = { handleWebhookEvent }
