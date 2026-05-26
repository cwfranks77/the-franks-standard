import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' },
  })
}

function stripeClient() {
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) return json({ error: 'unauthorized' }, 401)

    const body = await req.json().catch(() => ({})) as { order_id?: string }
    const orderId = String(body.order_id ?? '').trim()
    if (!orderId) return json({ error: 'order_id_required' }, 400)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, buyer_id, seller_id, status, escrow_status, seller_payout, stripe_payment_intent_id, connect_checkout')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) return json({ error: 'order_not_found' }, 404)
    if (order.buyer_id !== user.id) return json({ error: 'forbidden' }, 403)
    if (!['paid', 'shipped', 'delivered'].includes(order.status)) return json({ error: 'order_not_ready_to_confirm' }, 400)

    if (!order.connect_checkout) {
      const { data: sellerProfile } = await admin.from('profiles').select('stripe_account_id').eq('id', order.seller_id).maybeSingle()
      if (order.stripe_payment_intent_id && sellerProfile?.stripe_account_id) {
        const stripe = stripeClient()
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

    const { error: updateError } = await admin
      .from('orders')
      .update({ status: 'confirmed', escrow_status: 'released', confirmed_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateError) return json({ error: 'update_failed', detail: updateError.message }, 500)
    return json({ ok: true, status: 'confirmed' })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'confirm_failed'
    return json({ error: message }, 500)
  }
})
