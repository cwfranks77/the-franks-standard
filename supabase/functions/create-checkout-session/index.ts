import { createClient } from 'npm:@supabase/supabase-js@2'
import { calcFees, corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'
import { marketplaceListingTaxOptions, stripeTaxEnabled, TAX_CODE_TANGIBLE } from '../_shared/stripeTax.ts'

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

    const body = await req.json().catch(() => ({})) as { listing_id?: string }
    const listingId = String(body.listing_id ?? '').trim()
    if (!listingId) {
      return json({ error: 'listing_id_required' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, title, price, status, seller_id, donate_proceeds, charity_key, charity_name')
      .eq('id', listingId)
      .eq('status', 'published')
      .maybeSingle()

    if (listingError || !listing) {
      return json({ error: 'listing_not_found' }, 404)
    }

    const { data: sellerProfile } = await admin
      .from('profiles')
      .select('stripe_account_id, stripe_charges_enabled')
      .eq('id', listing.seller_id)
      .maybeSingle()

    if (listing.seller_id === user.id) {
      return json({ error: 'cannot_buy_own_listing' }, 400)
    }

    const amount = Number(listing.price)
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: 'invalid_listing_price' }, 400)
    }

    const isCharitySale = !!(listing.donate_proceeds && listing.charity_key)
    const { platformFee, sellerPayout, platformFeeCents } = calcFees(amount)
    const amountCents = Math.round(amount * 100)
    const orderPlatformFee = isCharitySale ? 0 : platformFee
    const orderSellerPayout = isCharitySale ? 0 : sellerPayout
    const orderCharityAmount = isCharitySale ? amount : null

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount,
        platform_fee: orderPlatformFee,
        seller_payout: orderSellerPayout,
        currency: 'usd',
        status: 'pending',
        escrow_status: 'none',
        connect_checkout: false,
        buyer_email: user.email ?? null,
        donate_to_charity: isCharitySale,
        charity_key: isCharitySale ? listing.charity_key : null,
        charity_name: isCharitySale ? listing.charity_name : null,
        charity_amount: orderCharityAmount,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return json({ error: 'order_create_failed', detail: orderError?.message }, 500)
    }

    const stripe = stripeClient()
    const base = siteUrl()
    const useConnect = !isCharitySale
      && !!(sellerProfile?.stripe_account_id && sellerProfile?.stripe_charges_enabled)

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'payment',
      client_reference_id: order.id,
      customer_email: user.email ?? undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          ...(stripeTaxEnabled() ? { tax_behavior: 'exclusive' as const } : {}),
          product_data: {
            name: isCharitySale
              ? `${String(listing.title).slice(0, 80)} — charity sale`
              : String(listing.title).slice(0, 120),
            ...(stripeTaxEnabled() ? { tax_code: TAX_CODE_TANGIBLE } : {}),
            metadata: {
              listing_id: listing.id,
              charity: isCharitySale ? String(listing.charity_key) : '',
            },
          },
        },
      }],
      metadata: {
        order_id: order.id,
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        donate_to_charity: isCharitySale ? 'true' : 'false',
        charity_key: isCharitySale ? String(listing.charity_key) : '',
        charity_name: isCharitySale ? String(listing.charity_name ?? '') : '',
      },
      success_url: `${base}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/listing/${listing.id}?checkout=cancelled`,
      ...marketplaceListingTaxOptions(),
    }

    let connectCheckout = useConnect
    if (useConnect && sellerProfile?.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: sellerProfile.stripe_account_id },
        metadata: sessionParams.metadata,
      }
    }

    let session
    try {
      session = await stripe.checkout.sessions.create(sessionParams)
    } catch (firstErr) {
      if (connectCheckout && stripeTaxEnabled() && sessionParams.payment_intent_data) {
        delete sessionParams.payment_intent_data
        connectCheckout = false
        session = await stripe.checkout.sessions.create(sessionParams)
      } else {
        throw firstErr
      }
    }

    await admin
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        connect_checkout: connectCheckout,
      })
      .eq('id', order.id)

    return json({
      url: session.url,
      order_id: order.id,
      session_id: session.id,
      connect_payout: connectCheckout,
      charity_sale: isCharitySale,
      charity_name: isCharitySale ? listing.charity_name : null,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'checkout_failed'
    return json({ error: message }, 500)
  }
})
