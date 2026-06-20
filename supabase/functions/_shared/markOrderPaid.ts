import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { queueDropshipOrder } from './queueDropshipOrder.ts'
import { notificationTriggers } from './notifications.ts'
import { runPostPaymentHooks } from './section12Finalize.ts'

export function adminClient (): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function markOrderPaid (admin: SupabaseClient, params: {
  orderId: string
  sessionId?: string
  paymentIntentId?: string
  taxAmount?: number | null
  totalPaid?: number | null
  buyerEmail?: string | null
  buyerName?: string | null
  shippingAddress?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
}) {
  const { orderId, sessionId, paymentIntentId, taxAmount, totalPaid, buyerEmail, buyerName, shippingAddress } = params
  const patch: Record<string, unknown> = {
    status: 'paid',
    escrow_status: 'held',
    paid_at: new Date().toISOString(),
    stripe_checkout_session_id: sessionId ?? undefined,
    stripe_payment_intent_id: paymentIntentId ?? undefined,
  }
  if (taxAmount != null && Number.isFinite(taxAmount)) {
    patch.tax_amount = taxAmount
  }
  if (totalPaid != null && Number.isFinite(totalPaid)) {
    patch.total_paid = totalPaid
  }
  if (shippingAddress?.postal_code) {
    patch.shipping_zip = String(shippingAddress.postal_code).slice(0, 10)
  }

  const { error } = await admin
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .in('status', ['pending'])

  if (error) {
    console.error('markOrderPaid', orderId, error.message)
    return { ok: false, error: error.message }
  }

  await queueDropshipOrder(admin, {
    orderId,
    buyerEmail,
    buyerName,
    shippingAddress,
  }).catch((e) => {
    console.error('queueDropshipOrder', orderId, e instanceof Error ? e.message : e)
  })

  const { data: orderRow } = await admin
    .from('orders')
    .select('buyer_id, seller_id, listing_id, amount, total_paid, platform_fee, seller_payout')
    .eq('id', orderId)
    .maybeSingle()

  if (orderRow?.buyer_id) {
    await admin.from('platform_activity_events').insert({
      user_id: orderRow.buyer_id,
      action: 'Purchase completed',
      action_category: 'transaction',
      event_type: 'purchase',
      ip_address: 'stripe-webhook',
      user_agent: 'stripe-webhook',
      metadata: {
        order_id: orderId,
        listing_id: orderRow.listing_id,
        amount: orderRow.amount,
        total_paid: orderRow.total_paid,
        shipping_zip: shippingAddress?.postal_code ?? null,
      },
    }).catch((e) => {
      console.error('activity purchase log', orderId, e instanceof Error ? e.message : e)
    })

    const totalDisplay = orderRow.total_paid != null
      ? `$${Number(orderRow.total_paid).toFixed(2)}`
      : undefined
    await notificationTriggers.purchase(admin, {
      userId: orderRow.buyer_id,
      orderId,
      total: totalDisplay,
      toEmail: buyerEmail ?? null,
    }).catch((e) => console.error('purchase notification', orderId, e))

    if (orderRow.seller_id) {
      const gross = Number(orderRow.total_paid ?? orderRow.amount) || 0
      const platformFee = Number(orderRow.platform_fee) || 0
      const sellerNet = Number(orderRow.seller_payout) || Math.max(0, gross - platformFee)
      await runPostPaymentHooks(admin, {
        orderId,
        buyerId: orderRow.buyer_id,
        sellerId: orderRow.seller_id,
        listingId: orderRow.listing_id,
        gross,
        platformFee,
        sellerNet,
        paymentIntentId: paymentIntentId ?? null,
      }).catch((e) => console.error('section12 hooks', orderId, e))
    }
  }

  return { ok: true }
}

export async function markOrderCancelled (admin: SupabaseClient, orderId: string) {
  const { error } = await admin
    .from('orders')
    .update({ status: 'cancelled', escrow_status: 'none' })
    .eq('id', orderId)
    .eq('status', 'pending')

  if (error) {
    console.error('markOrderCancelled', orderId, error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export function paidTotalsFromSession (session: {
  payment_intent?: string | { id: string } | null
  amount_total?: number | null
  total_details?: { amount_tax?: number | null } | null
}) {
  const pi = session.payment_intent
  const paymentIntentId = typeof pi === 'string' ? pi : pi?.id
  const taxCents = session.total_details?.amount_tax ?? 0
  const totalCents = session.amount_total ?? 0
  return {
    paymentIntentId,
    taxAmount: taxCents > 0 ? Math.round(taxCents) / 100 : 0,
    totalPaid: totalCents > 0 ? Math.round(totalCents) / 100 : null,
  }
}
