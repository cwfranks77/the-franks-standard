import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'
import { chargeIdForPaymentIntent } from './dropshipStripeSplit.ts'

export type MarketplaceOrderRow = {
  id: string
  seller_id: string
  listing_mode: string | null
  amount: number
  platform_fee: number | null
  supplier_cost: number | null
  supplier_shipping_cost: number | null
  vendor_escrow_amount: number | null
  seller_payout: number | null
  seller_margin: number | null
  stripe_payment_intent_id: string | null
  stripe_supplier_transfer_id: string | null
  stripe_vendor_payout_id: string | null
  separate_charges: boolean | null
  status: string
  connect_checkout: boolean | null
}

function isDropship (order: MarketplaceOrderRow): boolean {
  return String(order.listing_mode || '').toLowerCase() === 'dropship'
}

export function calcVendorEscrowUsd (order: MarketplaceOrderRow): number {
  if (order.vendor_escrow_amount != null && Number(order.vendor_escrow_amount) > 0) {
    return Math.round(Number(order.vendor_escrow_amount) * 100) / 100
  }
  if (isDropship(order)) {
    const item = Number(order.supplier_cost) || 0
    const ship = Number(order.supplier_shipping_cost) || 0
    return Math.round((item + ship) * 100) / 100
  }
  return Math.round((Number(order.seller_payout) || 0) * 100) / 100
}

async function loadMarketplaceOrder (
  admin: SupabaseClient,
  orderId: string,
): Promise<MarketplaceOrderRow | null> {
  const { data } = await admin
    .from('orders')
    .select(`
      id, seller_id, listing_mode, amount, platform_fee, supplier_cost,
      supplier_shipping_cost, vendor_escrow_amount, seller_payout, seller_margin,
      stripe_payment_intent_id, stripe_supplier_transfer_id, stripe_vendor_payout_id,
      separate_charges, status, connect_checkout
    `)
    .eq('id', orderId)
    .maybeSingle()
  return data as MarketplaceOrderRow | null
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

/** Hold vendor Connect balance in Stripe until we create a manual payout. */
export async function ensureManualConnectPayouts (
  stripe: Stripe,
  admin: SupabaseClient,
  accountId: string,
  profileId: string,
): Promise<void> {
  try {
    await stripe.accounts.update(accountId, {
      settings: {
        payouts: {
          schedule: { interval: 'manual' },
        },
      },
    })
    await admin
      .from('profiles')
      .update({ stripe_manual_payouts: true })
      .eq('id', profileId)
  } catch (e) {
    console.error('ensureManualConnectPayouts', accountId, e instanceof Error ? e.message : e)
  }
}

/**
 * Separate charge + transfer: move vendor item cost (+ shipping) to seller Connect immediately after payment.
 * Funds stay in Connect (manual payout schedule) until carrier scan webhook or buyer confirmation fallback.
 */
export async function transferVendorEscrowOnPaid (
  admin: SupabaseClient,
  stripe: Stripe,
  orderId: string,
): Promise<{ ok: boolean; skipped?: boolean; transfer_id?: string; error?: string }> {
  const order = await loadMarketplaceOrder(admin, orderId)
  if (!order) return { ok: false, error: 'order_not_found' }
  if (!order.separate_charges || order.connect_checkout) {
    return { ok: true, skipped: true }
  }
  if (order.stripe_supplier_transfer_id) {
    return { ok: true, skipped: true, transfer_id: order.stripe_supplier_transfer_id }
  }

  const escrowUsd = calcVendorEscrowUsd(order)
  if (escrowUsd <= 0) return { ok: true, skipped: true }

  const destination = await sellerConnectId(admin, order.seller_id)
  if (!destination) {
    return { ok: true, skipped: true, error: 'seller_connect_not_ready' }
  }

  await ensureManualConnectPayouts(stripe, admin, destination, order.seller_id)

  const escrowCents = Math.round(escrowUsd * 100)
  const transferParams: Stripe.TransferCreateParams = {
    amount: escrowCents,
    currency: 'usd',
    destination,
    metadata: {
      order_id: order.id,
      split_type: 'vendor_escrow',
    },
  }

  if (order.stripe_payment_intent_id) {
    const chargeId = await chargeIdForPaymentIntent(stripe, order.stripe_payment_intent_id)
    if (chargeId) transferParams.source_transaction = chargeId
  }

  try {
    const transfer = await stripe.transfers.create(transferParams)
    const patch: Record<string, unknown> = {
      stripe_supplier_transfer_id: transfer.id,
      supplier_transfer_at: new Date().toISOString(),
    }
    if (order.vendor_escrow_amount == null) {
      patch.vendor_escrow_amount = escrowUsd
    }
    await admin.from('orders').update(patch).eq('id', orderId)
    return { ok: true, transfer_id: transfer.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'vendor_escrow_transfer_failed'
    console.error('transferVendorEscrowOnPaid', orderId, msg)
    return { ok: false, error: msg }
  }
}

export type VendorPayoutReleaseReason =
  | 'carrier_delivery'
  | 'buyer_confirm'
  | 'supplier_delivered_fallback'

/**
 * Release vendor escrow from Connect ledger to their bank (manual payout schedule).
 * Primary path: carrier delivered scan (Shippo/EasyPost). Fallback: supplier delivered webhook.
 */
export async function releaseVendorEscrowPayout (
  admin: SupabaseClient,
  stripe: Stripe,
  orderId: string,
  opts?: { reason?: VendorPayoutReleaseReason; instant?: boolean },
): Promise<{ ok: boolean; skipped?: boolean; payout_id?: string; error?: string }> {
  const order = await loadMarketplaceOrder(admin, orderId)
  if (!order) return { ok: false, error: 'order_not_found' }
  if (!order.separate_charges || order.connect_checkout) {
    return { ok: true, skipped: true }
  }
  if (order.stripe_vendor_payout_id) {
    return { ok: true, skipped: true, payout_id: order.stripe_vendor_payout_id }
  }
  if (!order.stripe_supplier_transfer_id) {
    const xfer = await transferVendorEscrowOnPaid(admin, stripe, orderId)
    if (!xfer.ok || (!xfer.transfer_id && !xfer.skipped)) {
      return { ok: false, error: xfer.error ?? 'escrow_transfer_missing' }
    }
  }

  const destination = await sellerConnectId(admin, order.seller_id)
  if (!destination) {
    return { ok: true, skipped: true, error: 'seller_connect_not_ready' }
  }

  const escrowUsd = calcVendorEscrowUsd(order)
  const payoutCents = Math.round(escrowUsd * 100)
  if (payoutCents <= 0) return { ok: true, skipped: true }

  const reason = opts?.reason ?? 'buyer_confirm'
  const payoutParams: Stripe.PayoutCreateParams = {
    amount: payoutCents,
    currency: 'usd',
    metadata: {
      order_id: order.id,
      payout_type: 'vendor_escrow_release',
      release_reason: reason,
    },
  }
  if (opts?.instant) {
    payoutParams.method = 'instant'
  }

  try {
    const payout = await stripe.payouts.create(payoutParams, { stripeAccount: destination })

    await admin
      .from('orders')
      .update({
        stripe_vendor_payout_id: payout.id,
        vendor_payout_released_at: new Date().toISOString(),
        vendor_payout_release_reason: reason,
      })
      .eq('id', orderId)

    return { ok: true, payout_id: payout.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'vendor_escrow_payout_failed'
    console.error('releaseVendorEscrowPayout', orderId, msg)
    return { ok: false, error: msg }
  }
}

/** Run Connect escrow transfer right after platform payment succeeds. */
export async function processMarketplacePaidOrder (
  admin: SupabaseClient,
  stripe: Stripe,
  orderId: string,
): Promise<void> {
  await transferVendorEscrowOnPaid(admin, stripe, orderId).catch((e) => {
    console.error('processMarketplacePaidOrder', orderId, e instanceof Error ? e.message : e)
  })
}

/** Retry escrow transfers for paid orders when seller finishes Connect onboarding. */
export async function retryPendingVendorEscrowTransfers (
  admin: SupabaseClient,
  stripe: Stripe,
  stripeAccountId: string,
): Promise<void> {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_account_id', stripeAccountId)
    .maybeSingle()
  if (!profile?.id) return

  const { data: orders } = await admin
    .from('orders')
    .select('id')
    .eq('seller_id', profile.id)
    .eq('separate_charges', true)
    .eq('status', 'paid')
    .is('stripe_supplier_transfer_id', null)
    .limit(25)

  for (const row of orders ?? []) {
    await processMarketplacePaidOrder(admin, stripe, row.id)
  }
}
