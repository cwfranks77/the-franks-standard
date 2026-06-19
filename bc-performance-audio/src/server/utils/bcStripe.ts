import Stripe from 'stripe'

let stripeClient: Stripe | null | undefined

export function getBcStripe (): Stripe | null {
  if (stripeClient !== undefined) return stripeClient
  const key = String(process.env.STRIPE_SECRET_KEY || '').trim()
  if (!key) {
    stripeClient = null
    return null
  }
  stripeClient = new Stripe(key, { apiVersion: '2024-11-20.acacia' })
  return stripeClient
}

export async function refundBcOrderPayment (paymentIntentId: string, amountCents?: number) {
  const stripe = getBcStripe()
  if (!stripe) return { ok: false, error: 'STRIPE_SECRET_KEY not configured' }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amountCents ? { amount: amountCents } : {}),
    })
    return { ok: true, refund }
  } catch (err) {
    console.error('BC Stripe refund failed', err)
    return { ok: false, error: 'refund_failed' }
  }
}
