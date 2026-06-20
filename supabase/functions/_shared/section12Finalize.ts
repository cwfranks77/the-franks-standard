import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function logPaymentEvent (
  admin: SupabaseClient,
  row: {
    orderId?: string | null
    userId?: string | null
    eventType: string
    amount?: number | null
    stripeEventId?: string | null
    stripePaymentIntentId?: string | null
    metadata?: Record<string, unknown>
  },
) {
  await admin.from('payment_events').insert({
    order_id: row.orderId ?? null,
    user_id: row.userId ?? null,
    event_type: row.eventType,
    amount: row.amount ?? null,
    stripe_event_id: row.stripeEventId ?? null,
    stripe_payment_intent_id: row.stripePaymentIntentId ?? null,
    metadata: row.metadata ?? {},
  })
}

export async function postPurchaseLedger (
  admin: SupabaseClient,
  p: { orderId: string; buyerId: string; sellerId: string; gross: number; platformFee: number; sellerNet: number },
) {
  const rows = [
    { user_id: p.buyerId, entry_type: 'debit', amount: p.gross, category: 'purchase', reference_id: p.orderId, reference_type: 'order' },
  ]
  if (p.platformFee > 0) {
    rows.push({ user_id: p.sellerId, entry_type: 'debit', amount: p.platformFee, category: 'platform_fee', reference_id: p.orderId, reference_type: 'order' })
  }
  if (p.sellerNet > 0) {
    rows.push({ user_id: p.sellerId, entry_type: 'credit', amount: p.sellerNet, category: 'seller_earnings', reference_id: p.orderId, reference_type: 'order' })
  }
  await admin.from('ledger_entries').insert(rows)
}

const THREE_DAY_MS = 3 * 24 * 60 * 60 * 1000

export async function schedulePayoutForOrder (
  admin: SupabaseClient,
  p: { sellerId: string; orderId: string; amount: number; fee: number },
) {
  if (!p.sellerId || p.amount <= 0) return

  const { data: profile } = await admin
    .from('profiles')
    .select('trusted_seller_payouts, seller_first_sale_at, safety_frozen_at, platform_banned_at')
    .eq('id', p.sellerId)
    .maybeSingle()

  const reasons: string[] = []
  if (profile?.safety_frozen_at || profile?.platform_banned_at) reasons.push('account_frozen')

  const { data: fraud } = await admin.from('fraud_cases').select('id').eq('user_id', p.sellerId).eq('status', 'open').limit(1).maybeSingle()
  if (fraud?.id) reasons.push('fraud_case_open')

  const { data: dispute } = await admin.from('dispute_cases').select('id').eq('order_id', p.orderId).neq('status', 'resolved').limit(1).maybeSingle()
  if (dispute?.id) reasons.push('dispute_open')

  let delay = 0
  if (!profile?.trusted_seller_payouts) {
    const first = profile?.seller_first_sale_at ? new Date(profile.seller_first_sale_at).getTime() : Date.now()
    if (Date.now() - first < THREE_DAY_MS) delay = THREE_DAY_MS
  }

  const status = reasons.length ? 'held' : (profile?.trusted_seller_payouts ? 'pending' : 'scheduled')
  const scheduledAt = reasons.length ? null : new Date(Date.now() + delay).toISOString()

  await admin.from('payouts').insert({
    seller_id: p.sellerId,
    order_id: p.orderId,
    amount: Math.round(p.amount * 100) / 100,
    fee: Math.round(p.fee * 100) / 100,
    status,
    scheduled_at: scheduledAt,
    hold_reason: reasons.length ? reasons.join(',') : null,
    updated_at: new Date().toISOString(),
  })
}

export async function clearBuyerCartItem (admin: SupabaseClient, buyerId: string, listingId: string) {
  const { data: cart } = await admin.from('buyer_carts').select('items').eq('user_id', buyerId).maybeSingle()
  if (!cart?.items || !Array.isArray(cart.items)) return
  const filtered = cart.items.filter((i: { id?: string; listing_id?: string }) =>
    String(i.id || i.listing_id) !== String(listingId))
  await admin.from('buyer_carts').upsert({ user_id: buyerId, items: filtered, updated_at: new Date().toISOString() })
}

export async function markListingSold (admin: SupabaseClient, listingId: string) {
  if (!listingId) return
  await admin.from('listings').update({ status: 'sold', updated_at: new Date().toISOString() })
    .eq('id', listingId).eq('status', 'published')
}

export async function runPostPaymentHooks (
  admin: SupabaseClient,
  p: {
    orderId: string
    buyerId: string
    sellerId: string
    listingId: string
    gross: number
    platformFee: number
    sellerNet: number
    paymentIntentId?: string | null
  },
) {
  await admin.from('orders').update({ finalized_at: new Date().toISOString() }).eq('id', p.orderId)

  await logPaymentEvent(admin, {
    orderId: p.orderId,
    userId: p.buyerId,
    eventType: 'order_finalized',
    amount: p.gross,
    stripePaymentIntentId: p.paymentIntentId,
    metadata: { platform_fee: p.platformFee, seller_net: p.sellerNet },
  })

  await postPurchaseLedger(admin, {
    orderId: p.orderId,
    buyerId: p.buyerId,
    sellerId: p.sellerId,
    gross: p.gross,
    platformFee: p.platformFee,
    sellerNet: p.sellerNet,
  })

  await markListingSold(admin, p.listingId)
  await clearBuyerCartItem(admin, p.buyerId, p.listingId)

  if (p.sellerId) {
    await admin.from('profiles').update({ seller_first_sale_at: new Date().toISOString() })
      .eq('id', p.sellerId).is('seller_first_sale_at', null)
  }

  await schedulePayoutForOrder(admin, {
    sellerId: p.sellerId,
    orderId: p.orderId,
    amount: p.sellerNet,
    fee: p.platformFee,
  })
}
