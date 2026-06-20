/**
 * Log payment lifecycle events to payment_events table.
 */

async function logPaymentEvent (admin, {
  orderId = null,
  userId = null,
  eventType,
  amount = null,
  currency = 'USD',
  stripeEventId = null,
  stripePaymentIntentId = null,
  stripeChargeId = null,
  metadata = {},
}) {
  if (!admin || !eventType) return { ok: false, error: 'missing_fields' }

  const { data, error } = await admin.from('payment_events').insert({
    order_id: orderId,
    user_id: userId,
    event_type: eventType,
    amount,
    currency,
    stripe_event_id: stripeEventId,
    stripe_payment_intent_id: stripePaymentIntentId,
    stripe_charge_id: stripeChargeId,
    metadata,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, event_id: data.id }
}

module.exports = { logPaymentEvent }
