import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozen, loadProfileFreezeState } from '../_shared/sellerAccountFreeze.ts'
import { transferDropshipSellerMargin } from '../_shared/dropshipStripeSplit.ts'
import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'unauthorized' }, 401)
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return json({ error: 'unauthorized' }, 401)
    }

    const body = await req.json().catch(() => ({})) as { order_id?: string }
    const orderId = String(body.order_id ?? '').trim()
    if (!orderId) {
      return json({ error: 'order_id_required' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, buyer_id, seller_id, status, escrow_status, seller_payout, seller_margin, listing_mode, stripe_payment_intent_id, stripe_seller_transfer_id, connect_checkout, escrow_frozen_at')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return json({ error: 'order_not_found' }, 404)
    }
    if (order.buyer_id !== user.id) {
      return json({ error: 'forbidden' }, 403)
    }
    if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
      return json({ error: 'order_not_ready_to_confirm' }, 400)
    }

    if (order.escrow_frozen_at) {
      return json({
        error: 'escrow_frozen',
        message: 'Escrow cannot be released — seller account is frozen pending repayment to the platform.',
      }, 403)
    }

    const sellerProfile = await loadProfileFreezeState(admin, order.seller_id)
    const sellerFreeze = await assertAccountNotFrozen(admin, order.seller_id)
    if (!sellerFreeze.ok || sellerProfile?.seller_banned_at) {
      return json({
        error: 'escrow_frozen_seller',
        message: 'Escrow cannot be released to this seller until platform debt is resolved.',
      }, 403)
    }

    if (!order.connect_checkout) {
      const stripe = stripeClient()
      const isDropship = String(order.listing_mode || '').toLowerCase() === 'dropship'

      if (isDropship) {
        await transferDropshipSellerMargin(admin, stripe, orderId)
      } else if (order.stripe_payment_intent_id) {
        const { data: sellerProfile } = await admin
          .from('profiles')
          .select('stripe_account_id')
          .eq('id', order.seller_id)
          .maybeSingle()

        if (sellerProfile?.stripe_account_id) {
          const payoutCents = Math.round(Number(order.seller_payout) * 100)
          if (payoutCents > 0) {
            await stripe.transfers.create({
              amount: payoutCents,
              currency: 'usd',
              destination: sellerProfile.stripe_account_id,
              metadata: { order_id: order.id },
            })
          }
        }
      }
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'confirmed',
        escrow_status: 'released',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return json({ error: 'update_failed', detail: updateError.message }, 500)
    }

    return json({ ok: true, status: 'confirmed' })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'confirm_failed'
    return json({ error: message }, 500)
  }
})
