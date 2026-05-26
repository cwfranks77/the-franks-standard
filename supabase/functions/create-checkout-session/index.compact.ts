import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } })
const site = () => (Deno.env.get('SITE_URL') ?? 'https://thefranksstandard.com').replace(/\/+$/, '')
const stripe = () => new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
const fee = (n: number) => { const b = Number(Deno.env.get('STRIPE_PLATFORM_FEE_BPS') ?? '500'); const p = Math.round(n * b) / 10000; return { platformFee: p, sellerPayout: Math.round((n - p) * 100) / 100, platformFeeCents: Math.round(p * 100) } }

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  try {
    const auth = req.headers.get('Authorization') ?? ''
    if (!auth.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: auth } }, auth: { persistSession: false } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'unauthorized' }, 401)
    const { listing_id: listingId } = await req.json().catch(() => ({})) as { listing_id?: string }
    if (!listingId) return json({ error: 'listing_id_required' }, 400)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data: listing } = await admin.from('listings').select('id,title,price,status,seller_id').eq('id', listingId).eq('status', 'published').maybeSingle()
    if (!listing) return json({ error: 'listing_not_found' }, 404)
    if (listing.seller_id === user.id) return json({ error: 'cannot_buy_own_listing' }, 400)
    const amount = Number(listing.price)
    if (!Number.isFinite(amount) || amount <= 0) return json({ error: 'invalid_listing_price' }, 400)
    const { data: seller } = await admin.from('profiles').select('stripe_account_id,stripe_charges_enabled').eq('id', listing.seller_id).maybeSingle()
    const fees = fee(amount)
    const { data: order, error: orderErr } = await admin.from('orders').insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id, amount, platform_fee: fees.platformFee, seller_payout: fees.sellerPayout, currency: 'usd', status: 'pending', escrow_status: 'none', connect_checkout: false, buyer_email: user.email ?? null }).select('id').single()
    if (orderErr || !order) return json({ error: 'order_create_failed' }, 500)
    const s = stripe()
    const base = site()
    const useConnect = !!(seller?.stripe_account_id && seller?.stripe_charges_enabled)
    const params: Parameters<typeof s.checkout.sessions.create>[0] = {
      mode: 'payment', client_reference_id: order.id, customer_email: user.email ?? undefined,
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: Math.round(amount * 100), product_data: { name: String(listing.title).slice(0, 120) } } }],
      metadata: { order_id: order.id, listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id },
      success_url: `${base}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/listing/${listing.id}?checkout=cancelled`,
    }
    if (useConnect && seller?.stripe_account_id) {
      params.payment_intent_data = { application_fee_amount: fees.platformFeeCents, transfer_data: { destination: seller.stripe_account_id }, metadata: params.metadata }
    }
    const session = await s.checkout.sessions.create(params)
    await admin.from('orders').update({ stripe_checkout_session_id: session.id, connect_checkout: useConnect }).eq('id', order.id)
    return json({ url: session.url, order_id: order.id, session_id: session.id, connect_payout: useConnect })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'checkout_failed' }, 500)
  }
})
