import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'
import { calcDropshipSplit } from './stripe.ts'

export { calcDropshipSplit }

type OrderRow = {
  id: string
  seller_id: string
  listing_mode: string | null
  amount: number
  platform_fee: number | null
  supplier_cost: number | null
  seller_margin: number | null
  seller_payout: number | null
  stripe_payment_intent_id: string | null
  stripe_supplier_transfer_id: string | null
  stripe_seller_transfer_id: string | null
  status: string
}

async function loadOrder (admin: SupabaseClient, orderId: string): Promise<OrderRow | null> {
  const { data } = await admin
    .from('orders')
    .select(`
      id, seller_id, listing_mode, amount, platform_fee, supplier_cost,
      seller_margin, seller_payout, stripe_payment_intent_id,
      stripe_supplier_transfer_id, stripe_seller_transfer_id, status
    `)
    .eq('id', orderId)
    .maybeSingle()
  return data as OrderRow | null
}

async function sellerConnectId (admin: SupabaseClient, sellerId: string): Promise<string | null> {
  const { data } = await admin
    .from('profiles')
    .select('stripe_account_id, stripe_charges_enabled')
    .eq('id', sellerId)
    .maybeSingle()
  if (!data?.stripe_account_id || !data?.stripe_charges_enabled) return null
  return data.stripe_account_id
}

async function chargeIdForPaymentIntent (stripe: Stripe, paymentIntentId: string): Promise<string | null> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    const latest = pi.latest_charge
    if (typeof latest === 'string') return latest
    if (latest && typeof latest === 'object' && 'id' in latest) return String(latest.id)
  } catch (e) {
    console.error('chargeIdForPaymentIntent', paymentIntentId, e instanceof Error ? e.message : e)
  }
  return null
}

function isDropshipOrder (order: OrderRow): boolean {
  return String(order.listing_mode || '').toLowerCase() === 'dropship'
}

/** Transfer wholesale/supplier portion to seller (to pay their supplier). Idempotent. */
export async function transferDropshipSupplierPortion (
  admin: SupabaseClient,
  stripe: Stripe,
  orderId: string,
): Promise<{ ok: boolean; skipped?: boolean; transfer_id?: string; error?: string }> {
  const order = await loadOrder(admin, orderId)
  if (!order || !isDropshipOrder(order)) return { ok: true, skipped: true }
  if (order.stripe_supplier_transfer_id) return { ok: true, skipped: true, transfer_id: order.stripe_supplier_transfer_id }

  const supplierCost = Number(order.supplier_cost) || 0
  if (supplierCost <= 0) return { ok: true, skipped: true }

  const destination = await sellerConnectId(admin, order.seller_id)
  if (!destination) {
    return { ok: true, skipped: true, error: 'seller_connect_not_ready' }
  }

  const supplierCents = Math.round(supplierCost * 100)
  if (supplierCents <= 0) return { ok: true, skipped: true }

  const transferParams: Stripe.TransferCreateParams = {
    amount: supplierCents,
    currency: 'usd',
    destination,
    metadata: { order_id: order.id, split_type: 'dropship_supplier' },
  }

  if (order.stripe_payment_intent_id) {
    const chargeId = await chargeIdForPaymentIntent(stripe, order.stripe_payment_intent_id)
    if (chargeId) transferParams.source_transaction = chargeId
  }

  try {
    const transfer = await stripe.transfers.create(transferParams)
    await admin
      .from('orders')
      .update({
        stripe_supplier_transfer_id: transfer.id,
        supplier_transfer_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return { ok: true, transfer_id: transfer.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'supplier_transfer_failed'
    console.error('transferDropshipSupplierPortion', orderId, msg)
    return { ok: false, error: msg }
  }
}

/** Transfer seller margin/profit after buyer confirms. Idempotent. */
export async function transferDropshipSellerMargin (
  admin: SupabaseClient,
  stripe: Stripe,
  orderId: string,
): Promise<{ ok: boolean; skipped?: boolean; transfer_id?: string; error?: string }> {
  const order = await loadOrder(admin, orderId)
  if (!order) return { ok: false, error: 'order_not_found' }

  if (isDropshipOrder(order)) {
    if (order.stripe_seller_transfer_id) return { ok: true, skipped: true, transfer_id: order.stripe_seller_transfer_id }

    const margin = Number(order.seller_margin ?? order.seller_payout) || 0
    if (margin <= 0) return { ok: true, skipped: true }

    const destination = await sellerConnectId(admin, order.seller_id)
    if (!destination) {
      return { ok: true, skipped: true, error: 'seller_connect_not_ready' }
    }

    const marginCents = Math.round(margin * 100)
    if (marginCents <= 0) return { ok: true, skipped: true }

    const transferParams: Stripe.TransferCreateParams = {
      amount: marginCents,
      currency: 'usd',
      destination,
      metadata: { order_id: order.id, split_type: 'dropship_seller_margin' },
    }

    if (order.stripe_payment_intent_id) {
      const chargeId = await chargeIdForPaymentIntent(stripe, order.stripe_payment_intent_id)
      if (chargeId) transferParams.source_transaction = chargeId
    }

    try {
      const transfer = await stripe.transfers.create(transferParams)
      await admin
        .from('orders')
        .update({
          stripe_seller_transfer_id: transfer.id,
          seller_transfer_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      return { ok: true, transfer_id: transfer.id }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'seller_margin_transfer_failed'
      console.error('transferDropshipSellerMargin', orderId, msg)
      return { ok: false, error: msg }
    }
  }

  return { ok: true, skipped: true }
}
