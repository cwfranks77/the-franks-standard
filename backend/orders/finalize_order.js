/**
 * Order finalization after payment confirmation.
 */

const { logPaymentEvent } = require('../payments/log_payment_event.js')
const { postPurchaseLedger } = require('../accounting/ledger.js')
const { schedulePayout } = require('../payouts/schedule_payout.js')
const { triggers } = require('../notifications/send_notification.js')
const { queueEmail } = require('../email/email_queue.js')

async function deductInventory (admin, { listingId, orderId }) {
  if (!listingId) return { ok: true, skipped: true }

  const { data: listing } = await admin
    .from('listings')
    .select('id, status, sale_type')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing) return { ok: false, error: 'listing_not_found' }

  const { error } = await admin.from('listings').update({
    status: 'sold',
    updated_at: new Date().toISOString(),
  }).eq('id', listingId).eq('status', 'published')

  if (error) return { ok: false, error: error.message }

  return { ok: true, listing_id: listingId }
}

async function clearBuyerCart (admin, buyerId, listingId) {
  if (!buyerId) return

  const { data: cart } = await admin
    .from('buyer_carts')
    .select('items')
    .eq('user_id', buyerId)
    .maybeSingle()

  if (!cart?.items) return

  const items = Array.isArray(cart.items) ? cart.items : []
  const filtered = listingId
    ? items.filter((i) => String(i.id || i.listing_id) !== String(listingId))
    : []

  await admin.from('buyer_carts').upsert({
    user_id: buyerId,
    items: filtered,
    updated_at: new Date().toISOString(),
  })
}

async function finalizeOrder (admin, {
  orderId,
  paymentIntentId = null,
  sessionId = null,
  totalPaid = null,
  taxAmount = null,
  buyerEmail = null,
  shippingZip = null,
  buyerName = null,
  shippingAddress = null,
}) {
  const { data: order, error: loadErr } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle()

  if (loadErr || !order) return { ok: false, error: loadErr?.message || 'order_not_found' }
  if (order.status === 'paid' && order.finalized_at) {
    return { ok: true, already_finalized: true, order_id: orderId }
  }

  const now = new Date().toISOString()
  const patch = {
    status: 'paid',
    escrow_status: order.connect_checkout ? 'released' : 'held',
    paid_at: now,
    finalized_at: now,
    stripe_payment_intent_id: paymentIntentId ?? order.stripe_payment_intent_id,
    stripe_checkout_session_id: sessionId ?? order.stripe_checkout_session_id,
  }
  if (totalPaid != null) patch.total_paid = totalPaid
  if (taxAmount != null) patch.tax_amount = taxAmount
  if (shippingZip) patch.shipping_zip = String(shippingZip).slice(0, 10)

  const { error: updErr } = await admin
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .in('status', ['pending', 'paid'])

  if (updErr) return { ok: false, error: updErr.message }

  await deductInventory(admin, { listingId: order.listing_id, orderId })

  const gross = Number(order.total_paid ?? totalPaid ?? order.amount) || 0
  const platformFee = Number(order.platform_fee) || 0
  const sellerNet = Number(order.seller_payout) || Math.max(0, gross - platformFee)

  await postPurchaseLedger(admin, {
    orderId,
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    grossAmount: gross,
    platformFee,
    sellerNet,
  })

  await logPaymentEvent(admin, {
    orderId,
    userId: order.buyer_id,
    eventType: 'order_finalized',
    amount: gross,
    stripePaymentIntentId: paymentIntentId,
    metadata: { platform_fee: platformFee, seller_net: sellerNet },
  })

  await admin.from('platform_activity_events').insert({
    user_id: order.buyer_id,
    action: 'Purchase completed',
    action_category: 'transaction',
    event_type: 'purchase',
    metadata: {
      order_id: orderId,
      listing_id: order.listing_id,
      amount: order.amount,
      total_paid: gross,
    },
  }).catch(() => {})

  if (order.seller_id) {
    await admin.from('profiles').update({ seller_first_sale_at: now }).eq('id', order.seller_id).is('seller_first_sale_at', null)
  }

  await schedulePayout(admin, {
    sellerId: order.seller_id,
    orderId,
    amount: sellerNet,
    fee: platformFee,
  }).catch((e) => console.error('schedulePayout', e))

  const email = buyerEmail
  await triggers.purchase(admin, {
    userId: order.buyer_id,
    orderId,
    total: gross ? `$${Number(gross).toFixed(2)}` : undefined,
    toEmail: email,
  }).catch(() => {})

  if (email) {
    await queueEmail(admin, {
      userId: order.buyer_id,
      toEmail: email,
      templateKey: 'order_confirmation',
      templateData: { order_id: orderId, total: gross ? `$${Number(gross).toFixed(2)}` : '' },
    }).catch(() => {})
  }

  await clearBuyerCart(admin, order.buyer_id, order.listing_id)

  return { ok: true, order_id: orderId, finalized_at: now }
}

module.exports = { finalizeOrder, deductInventory, clearBuyerCart }
