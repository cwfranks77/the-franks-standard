import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  executeStripeForceRefund,
  ForceRefundReason,
  loadOrderForRefund,
  markOrderRefunded,
  REFUNDABLE_ORDER_STATUSES,
} from '../_shared/forceRefund.ts'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import {
  banSellerAfterDebt,
  freezeSellerForPlatformDebt,
  isSellerAtFaultRefundReason,
  recordSellerDebtPayment,
} from '../_shared/sellerAccountFreeze.ts'
import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const REFUND_REASONS: ForceRefundReason[] = [
  'counterfeit',
  'not_as_described',
  'dispute_upheld',
  'seller_failed_refund',
  'ops_other',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const opsKey = String(body.ops_key ?? '')
  if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? 'force_refund')

  if (action === 'list_refundable') {
    const limit = Math.min(50, Math.max(1, Number(body.limit) || 25))
    const { data, error } = await admin
      .from('orders')
      .select(`
        id, status, escrow_status, amount, total_paid, paid_at,
        listing_id, buyer_id, seller_id, buyer_email,
        stripe_payment_intent_id, connect_checkout, refund_reason
      `)
      .in('status', [...REFUNDABLE_ORDER_STATUSES])
      .is('stripe_refund_id', null)
      .order('paid_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) return json({ error: 'fetch_failed', detail: error.message }, 500)
    return json({ ok: true, orders: data ?? [] })
  }

  if (action === 'list_frozen_sellers') {
    const { data, error } = await admin
      .from('profiles')
      .select(`
        id, account_frozen_at, account_freeze_reason,
        seller_debt_balance, seller_debt_order_id, seller_debt_status,
        seller_debt_recorded_at, seller_banned_at
      `)
      .eq('seller_debt_status', 'pending')
      .not('account_frozen_at', 'is', null)
      .order('account_frozen_at', { ascending: false })
      .limit(50)

    if (error) return json({ error: 'fetch_failed', detail: error.message }, 500)
    return json({ ok: true, sellers: data ?? [] })
  }

  if (action === 'record_debt_payment') {
    const sellerId = String(body.seller_id ?? '').trim()
    if (!sellerId) return json({ error: 'seller_id_required' }, 400)
    const banAfter = body.ban_after_payment === true
    const result = await recordSellerDebtPayment(admin, {
      sellerId,
      amount: body.amount != null ? Number(body.amount) : undefined,
      notes: String(body.notes ?? '').trim() || null,
      banAfterPayment: banAfter,
      banReason: String(body.ban_reason ?? '').trim() || null,
    })
    if (!result.ok) return json({ error: result.error }, 400)
    return json({ ok: true, seller_id: sellerId, banned: result.banned })
  }

  if (action === 'ban_frozen_seller') {
    const sellerId = String(body.seller_id ?? '').trim()
    if (!sellerId) return json({ error: 'seller_id_required' }, 400)
    await banSellerAfterDebt(admin, sellerId, String(body.ban_reason ?? '').trim() || undefined)
    return json({ ok: true, seller_id: sellerId, banned: true })
  }

  if (action === 'get_order') {
    const orderId = String(body.order_id ?? '').trim()
    if (!orderId) return json({ error: 'order_id_required' }, 400)
    const order = await loadOrderForRefund(admin, orderId)
    if (!order) return json({ error: 'order_not_found' }, 404)
    const { data: events } = await admin
      .from('order_refund_events')
      .select('id, amount, reason, ops_note, stripe_refund_id, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
    return json({ ok: true, order, events: events ?? [] })
  }

  if (action === 'force_refund') {
    const orderId = String(body.order_id ?? '').trim()
    const reason = String(body.reason ?? 'seller_failed_refund') as ForceRefundReason
    const opsNote = String(body.ops_note ?? '').trim() || null
    const reportId = String(body.authenticity_report_id ?? '').trim() || null
    const dryRun = body.dry_run === true
    const freezeSeller = body.freeze_seller !== false

    if (!orderId) return json({ error: 'order_id_required' }, 400)
    if (!REFUND_REASONS.includes(reason)) {
      return json({ error: 'invalid_reason', allowed: REFUND_REASONS }, 400)
    }

    const order = await loadOrderForRefund(admin, orderId)
    if (!order) return json({ error: 'order_not_found' }, 404)

    if (dryRun) {
      return json({
        ok: true,
        dry_run: true,
        order_id: order.id,
        status: order.status,
        refundable: REFUNDABLE_ORDER_STATUSES.includes(
          order.status as typeof REFUNDABLE_ORDER_STATUSES[number],
        ),
        has_payment_intent: !!order.stripe_payment_intent_id,
        connect_checkout: order.connect_checkout,
      })
    }

    const stripe = stripeClient()
    const result = await executeStripeForceRefund(stripe, order, { reason, opsNote: opsNote ?? undefined })

    if (!result.ok) {
      return json({ error: result.error, code: result.code }, 400)
    }

    const marked = await markOrderRefunded(admin, {
      orderId: order.id,
      stripeRefundId: result.refundId,
      refundAmount: result.amount,
      reason,
      initiatedBy: 'ops',
      opsNote,
      authenticityReportId: reportId,
    })

    if (!marked.ok) {
      return json({
        error: 'stripe_refunded_db_update_failed',
        detail: marked.error,
        stripe_refund_id: result.refundId,
        warning: 'Refund succeeded in Stripe; reconcile order row manually.',
      }, 500)
    }

    if (reportId) {
      await admin
        .from('authenticity_reports')
        .update({ status: 'resolved_refunded' })
        .eq('id', reportId)
    }

    let sellerFrozen = false
    if (
      freezeSeller &&
      isSellerAtFaultRefundReason(reason) &&
      order.seller_id
    ) {
      const frozen = await freezeSellerForPlatformDebt(admin, {
        sellerId: order.seller_id,
        orderId: order.id,
        debtAmount: result.amount,
        refundReason: reason,
        opsNote: opsNote,
      })
      sellerFrozen = frozen.ok
    }

    return json({
      ok: true,
      order_id: order.id,
      stripe_refund_id: result.refundId,
      refund_amount: result.amount,
      status: 'refunded',
      seller_frozen: sellerFrozen,
      seller_id: order.seller_id,
    })
  }

  return json({
    error: 'unknown_action',
    allowed: [
      'force_refund',
      'list_refundable',
      'get_order',
      'list_frozen_sellers',
      'record_debt_payment',
      'ban_frozen_seller',
    ],
  }, 400)
})
