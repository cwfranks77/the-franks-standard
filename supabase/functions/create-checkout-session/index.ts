import { createClient } from 'npm:@supabase/supabase-js@2'
import { calcDropshipSplit, calcFees, corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'
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
      .select('id, title, price, status, seller_id, listing_mode, dropship_wholesale_cost, donate_proceeds, charity_key, charity_name, sale_type, starting_bid, current_bid, current_bidder_id, reserve_price, auction_ends_at')
      .eq('id', listingId)
      .eq('status', 'published')
      .maybeSingle()

    if (listingError || !listing) {
      return json({ error: 'listing_not_found' }, 404)
    }

    const { data: sellerProfile } = await admin
      .from('profiles')
      .select('stripe_account_id, stripe_charges_enabled, seller_tier')
      .eq('id', listing.seller_id)
      .maybeSingle()

    if (listing.seller_id === user.id) {
      return json({ error: 'cannot_buy_own_listing' }, 400)
    }

    const isAuction = listing.sale_type === 'auction'
    if (isAuction) {
      if (!listing.auction_ends_at || new Date(listing.auction_ends_at) > new Date()) {
        return json({ error: 'auction_still_open' }, 400)
      }
      if (!listing.current_bidder_id || listing.current_bidder_id !== user.id) {
        return json({ error: 'not_auction_winner' }, 403)
      }
      const reserve = listing.reserve_price != null ? Number(listing.reserve_price) : null
      const winning = Number(listing.current_bid)
      if (reserve != null && Number.isFinite(reserve) && winning < reserve) {
        return json({ error: 'reserve_not_met' }, 400)
      }
    }

    const amount = isAuction
      ? Number(listing.current_bid)
      : Number(listing.price)
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: 'invalid_listing_price' }, 400)
    }

    const stripe = stripeClient()

    const { data: existingPending } = await admin
      .from('orders')
      .select('id, stripe_checkout_session_id, connect_checkout')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingPending?.stripe_checkout_session_id?.startsWith('cs_')) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(existingPending.stripe_checkout_session_id)
        if (existingSession.status === 'open' && existingSession.url) {
          return json({
            url: existingSession.url,
            order_id: existingPending.id,
            session_id: existingSession.id,
            connect_payout: !!existingPending.connect_checkout,
            reused: true,
          })
        }
        if (existingSession.status === 'expired') {
          await admin.from('orders').update({ status: 'cancelled', escrow_status: 'none' }).eq('id', existingPending.id)
        }
      } catch {
        // Fall through and create a fresh checkout session.
      }
    }

    const isCharitySale = !!(listing.donate_proceeds && listing.charity_key)
    const isDropship = String(listing.listing_mode || '').toLowerCase() === 'dropship'
    const wholesaleCost = isDropship ? Number(listing.dropship_wholesale_cost) || 0 : 0

    if (isDropship && wholesaleCost <= 0) {
      return json({ error: 'dropship_wholesale_cost_required' }, 400)
    }

    let orderPlatformFee: number
    let orderSellerPayout: number
    let orderSupplierCost = 0
    let orderSellerMargin: number | null = null

    if (isCharitySale) {
      orderPlatformFee = 0
      orderSellerPayout = 0
    } else if (isDropship) {
      const split = calcDropshipSplit(amount, wholesaleCost, sellerProfile?.seller_tier)
      if (split.sellerMargin <= 0) {
        return json({ error: 'dropship_margin_too_low', detail: 'Wholesale cost is too high for this list price.' }, 400)
      }
      orderPlatformFee = split.platformFee
      orderSupplierCost = split.supplierCost
      orderSellerMargin = split.sellerMargin
      orderSellerPayout = split.sellerMargin
    } else {
      const { platformFee, sellerPayout } = calcFees(amount, sellerProfile?.seller_tier)
      orderPlatformFee = platformFee
      orderSellerPayout = sellerPayout
    }

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
        listing_mode: isDropship ? 'dropship' : (listing.listing_mode || 'direct'),
        supplier_cost: orderSupplierCost,
        seller_margin: orderSellerMargin,
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

    const amountCents = Math.round(amount * 100)
    const platformFeeCents = Math.round(orderPlatformFee * 100)

    const base = siteUrl()
    // Dropship: full payment on platform (escrow) then split via transfers on ship + confirm.
    const useConnect = !isCharitySale && !isDropship
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
        listing_mode: isDropship ? 'dropship' : 'direct',
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
      dropship_split: isDropship ? {
        platform_fee: orderPlatformFee,
        supplier_cost: orderSupplierCost,
        seller_margin: orderSellerMargin,
      } : null,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'checkout_failed'
    return json({ error: message }, 500)
  }
})
