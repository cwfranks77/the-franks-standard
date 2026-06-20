/**
 * Create Stripe PaymentIntent with server-side total + tax validation.
 */

const { logPaymentEvent } = require('./log_payment_event.js')
const { calculateTax, validateShippingZip } = require('../tax/calculate_tax.js')
const { calculateFees } = require('../fees/calculate_fees.js')

const STRIPE_KEY = () => process.env.STRIPE_SECRET_KEY || process.env.NUXT_STRIPE_SECRET_KEY || ''

async function createPaymentIntent (admin, stripe, {
  orderId,
  buyerId,
  sellerId,
  merchandiseAmount,
  shippingCost = 0,
  shippingZip,
  currency = 'usd',
  paymentMethodTypes = ['card'],
  walletEnabled = process.env.STRIPE_WALLET_ENABLED === 'true',
}) {
  const zipCheck = validateShippingZip(shippingZip)
  if (!zipCheck.ok) return zipCheck

  const tax = calculateTax({
    shippingZip: zipCheck.zip5,
    merchandiseAmount,
    shippingCost,
  })
  if (!tax.ok) return tax

  const fees = await calculateFees(admin, { merchandiseAmount, sellerId })
  const subtotal = Math.round((Number(merchandiseAmount) + Number(shippingCost)) * 100) / 100
  const total = Math.round((subtotal + tax.tax_amount) * 100) / 100
  const amountCents = Math.round(total * 100)

  if (!stripe && STRIPE_KEY()) {
    // eslint-disable-next-line global-require
    const Stripe = require('stripe')
    stripe = new Stripe(STRIPE_KEY(), { apiVersion: '2024-06-20' })
  }
  if (!stripe) return { ok: false, error: 'stripe_not_configured' }

  const methodTypes = [...paymentMethodTypes]
  if (walletEnabled && !methodTypes.includes('link')) {
    methodTypes.push('link')
  }

  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    payment_method_types: methodTypes,
    metadata: {
      order_id: orderId,
      buyer_id: buyerId,
      seller_id: sellerId,
      shipping_zip: zipCheck.zip5,
      platform_fee: String(fees.platformFee),
    },
  })

  if (admin && orderId) {
    await admin.from('orders').update({
      shipping_zip: zipCheck.zip5,
      tax_amount: tax.tax_amount,
      tax_breakdown: tax.tax_breakdown,
      platform_fee: fees.platformFee,
      seller_payout: fees.sellerNet,
      fee_bps: fees.feeBps,
      merchandise_amount: merchandiseAmount,
      shipping_cost: shippingCost,
      amount: total,
    }).eq('id', orderId)

    await logPaymentEvent(admin, {
      orderId,
      userId: buyerId,
      eventType: 'payment_intent_created',
      amount: total,
      stripePaymentIntentId: pi.id,
      metadata: { fee_bps: fees.feeBps, tax: tax.tax_amount },
    })
  }

  return {
    ok: true,
    payment_intent_id: pi.id,
    client_secret: pi.client_secret,
    amount_cents: amountCents,
    total,
    tax,
    fees,
  }
}

module.exports = { createPaymentIntent }
