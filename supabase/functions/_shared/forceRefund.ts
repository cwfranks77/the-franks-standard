import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'
import { chargeIdForPaymentIntent } from './dropshipStripeSplit.ts'

export const REFUNDABLE_ORDER_STATUSES = [
  'paid',
  'shipped',
  'delivered',
  'disputed',
  'confirmed',
  'submitted_to_supplier',
] as const

export type ForceRefundReason =
  | 'counterfeit'
  | 'not_as_described'
  | 'dispute_upheld'
  | 'seller_failed_refund'
  | 'ops_other'

export type OrderRefundRow = {
  id: string
  status: string
  escrow_status: string
  amount: number
  total_paid: number | null
  tax_amount: number | null
  connect_checkout: boolean
  stripe_payment_intent_id: string | null
  stripe_refund_id: string | null
  listing_id: string
  buyer_id: string
  seller_id: string
  buyer_email: string | null
}

export async function loadOrderForRefund (
  admin: SupabaseClient,
  orderId: string,
): Promise<OrderRefundRow | null> {
  const { data, error } = await admin
    .from('orders')
    .select(`
      id, status, escrow_status, amount, total_paid, tax_amount,
      connect_checkout, stripe_payment_intent_id, stripe_refund_id,
      listing_id, buyer_id, seller_id, buyer_email
    `)
    .eq('id', orderId)
    .maybeSingle()

  if (error) {
    console.error('loadOrderForRefund', orderId, error.message)
    return null
  }
  return data as OrderRefundRow | null
}

export async function markOrderRefunded (
  admin: SupabaseClient,
  params: {
    orderId: string
    stripeRefundId: string
    refundAmount: number
    reason: string
    initiatedBy: string
    opsNote?: string | null
    authenticityReportId?: string | null
  },
) {
  const {
    orderId,
    stripeRefundId,
    refundAmount,
    reason,
    initiatedBy,
    opsNote,
    authenticityReportId,
  } = params
  const now = new Date().toISOString()

  const { error: orderErr } = await admin
    .from('orders')
    .update({
      status: 'refunded',
      escrow_status: 'refunded',
      stripe_refund_id: stripeRefundId,
      refunded_at: now,
      refund_reason: reason,
      refund_amount: refundAmount,
      refund_initiated_by: initiatedBy,
    })
    .eq('id', orderId)

  if (orderErr) {
    return { ok: false as const, error: orderErr.message }
  }

  const { error: eventErr } = await admin.from('order_refund_events').insert({
    order_id: orderId,
    stripe_refund_id: stripeRefundId,
    amount: refundAmount,
    currency: 'usd',
    reason,
    ops_note: opsNote ?? null,
    authenticity_report_id: authenticityReportId ?? null,
  })

  if (eventErr) {
    console.error('order_refund_events insert', orderId, eventErr.message)
  }

  return { ok: true as const }
}

/**
 * Issue a Stripe refund to the buyer. Handles Connect destination charges
 * (reverse_transfer + refund_application_fee) and platform-held escrow charges.
 */
export async function executeStripeForceRefund (
  stripe: Stripe,
  order: OrderRefundRow,
  opts: {
    reason: ForceRefundReason
    opsNote?: string
    /** Partial refund in cents; omit for full refund of amount received on PI */
    amountCents?: number
  },
): Promise<{ ok: true; refundId: string; amount: number } | { ok: false; error: string; code?: string }> {
  if (order.status === 'refunded' || order.stripe_refund_id) {
    return { ok: false, error: 'already_refunded', code: 'already_refunded' }
  }
  if (!REFUNDABLE_ORDER_STATUSES.includes(order.status as typeof REFUNDABLE_ORDER_STATUSES[number])) {
    return { ok: false, error: 'order_not_refundable', code: 'invalid_status' }
  }
  if (!order.stripe_payment_intent_id) {
    return { ok: false, error: 'no_stripe_payment_intent', code: 'no_payment' }
  }

  const chargeId = await chargeIdForPaymentIntent(stripe, order.stripe_payment_intent_id)
  if (!chargeId) {
    return { ok: false, error: 'charge_not_found', code: 'no_charge' }
  }

  let amountCents = opts.amountCents
  if (amountCents == null) {
    try {
      const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)
      amountCents = pi.amount_received ?? pi.amount
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'payment_intent_fetch_failed'
      return { ok: false, error: msg, code: 'pi_fetch_failed' }
    }
  }

  if (!amountCents || amountCents < 1) {
    return { ok: false, error: 'invalid_refund_amount', code: 'invalid_amount' }
  }

  const stripeReason =
    opts.reason === 'counterfeit' ? 'fraudulent' : 'requested_by_customer'

  const refundParams: Stripe.RefundCreateParams = {
    charge: chargeId,
    amount: amountCents,
    reason: stripeReason,
    metadata: {
      order_id: order.id,
      force_refund: 'true',
      refund_reason: opts.reason,
    },
  }

  if (order.connect_checkout) {
    refundParams.refund_application_fee = true
    refundParams.reverse_transfer = true
  }

  try {
    const refund = await stripe.refunds.create(refundParams)
    return {
      ok: true,
      refundId: refund.id,
      amount: (refund.amount ?? amountCents) / 100,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'stripe_refund_failed'
    return { ok: false, error: msg, code: 'stripe_error' }
  }
}
