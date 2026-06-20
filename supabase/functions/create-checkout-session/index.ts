import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozen } from '../_shared/sellerAccountFreeze.ts'
import { assertSellerNotOnIntegrityHold } from '../_shared/sellerIntegrityHold.ts'
import { assertBuyerPoliciesAccepted, CURRENT_CHECKOUT_ACK_VERSION } from '../_shared/buyerPolicyAcceptance.ts'
import { assertSellerPoliciesAccepted } from '../_shared/sellerPolicyAcceptance.ts'
import { assertMarketplaceCompliance } from '../_shared/marketplaceCompliance.ts'
import { calcCharitySplit, calcDropshipSplit, corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'
import { calculateFees } from '../_shared/calculateFees.ts'
import { marketplaceListingTaxOptions, stripeTaxEnabled, TAX_CODE_TANGIBLE } from '../_shared/stripeTax.ts'
import { isBanned } from '../_shared/accountSafety.ts'
import { applyVpnPolicy } from '../_shared/vpnDetection.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'

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

    const body = await req.json().catch(() => ({})) as {
      listing_id?: string
      checkout_ack_version?: string
      checkout_ack_hash?: string
      serialized_coa_serial?: string | null
      device_fingerprint?: string | null
    }
    const listingId = String(body.listing_id ?? '').trim()
    if (!listingId) {
      return json({ error: 'listing_id_required' }, 400)
    }

    const checkoutAckVersion = String(body.checkout_ack_version ?? '').trim()
    if (checkoutAckVersion !== CURRENT_CHECKOUT_ACK_VERSION) {
      return json({
        error: 'checkout_ack_required',
        message: 'Check the checkout acknowledgment box on the listing page before paying.',
      }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const clientIp = clientIpFromRequest(req)
    const deviceFp = String(body.device_fingerprint ?? '').trim() || null

    const banCheck = await isBanned(admin, {
      userId: user.id,
      ipAddress: clientIp,
      deviceFingerprint: deviceFp,
    })
    if (banCheck.banned) {
      return json({ error: 'account_banned', message: 'This account cannot complete checkout.' }, 403)
    }

    const vpn = await applyVpnPolicy(admin, { userId: user.id, ipAddress: clientIp, req })
    if (vpn.blocked) {
      return json({ error: 'account_banned', message: 'This account cannot complete checkout.' }, 403)
    }
    if (vpn.requiresPhoneVerification) {
      const { data: prof } = await admin
        .from('profiles')
        .select('requires_phone_verification, phone_verified_at')
        .eq('id', user.id)
        .maybeSingle()
      if (prof?.requires_phone_verification && !prof?.phone_verified_at) {
        return json({
          error: 'phone_verification_required',
          message: 'Phone verification is required before checkout from this network.',
        }, 403)
      }
    }

    const buyerFreeze = await assertAccountNotFrozen(admin, user.id)
    if (!buyerFreeze.ok) {
      return json({ error: buyerFreeze.error, message: buyerFreeze.message }, 403)
    }

    const buyerPolicies = await assertBuyerPoliciesAccepted(admin, user.id)
    if (!buyerPolicies.ok) {
      return json({ error: buyerPolicies.error, message: buyerPolicies.message }, 403)
    }

    const compliance = await assertMarketplaceCompliance(admin, user.id)
    if (!compliance.ok) {
      return json({ error: compliance.error, message: compliance.message }, 403)
    }

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, title, price, status, seller_id, integrity_status, listing_mode, dropship_wholesale_cost, donate_proceeds, charity_key, charity_name, charity_percent, sale_type, starting_bid, current_bid, current_bidder_id, reserve_price, auction_ends_at, buy_now_price, bid_count, coa_type, coa_serial_number, shipping_cost')
      .eq('id', listingId)
      .eq('status', 'published')
      .maybeSingle()

    if (listingError || !listing) {
      return json({ error: 'listing_not_found' }, 404)
    }

    const integrity = String((listing as { integrity_status?: string }).integrity_status ?? 'clear')
    if (integrity === 'suspended' || integrity === 'counterfeit_confirmed' || integrity === 'review') {
      return json({ error: 'listing_not_available', message: 'This listing is under authenticity review or has been removed.' }, 403)
    }

    const { data: sellerProfile } = await admin
      .from('profiles')
      .select('stripe_account_id, stripe_charges_enabled, seller_tier, award_fee_bps, award_fee_until, seller_banned_at, account_frozen_at, seller_debt_status, seller_debt_paid_at')
      .eq('id', listing.seller_id)
      .maybeSingle()

    if (sellerProfile?.seller_banned_at) {
      return json({ error: 'seller_suspended', message: 'This seller is not permitted to sell on The Franks Standard.' }, 403)
    }

    const sellerFreeze = await assertAccountNotFrozen(admin, listing.seller_id)
    if (!sellerFreeze.ok) {
      return json({ error: 'seller_account_frozen', message: 'This seller account is frozen and cannot complete sales.' }, 403)
    }

    const sellerHold = await assertSellerNotOnIntegrityHold(admin, listing.seller_id)
    if (!sellerHold.ok) {
      return json({ error: sellerHold.error, message: sellerHold.message }, 403)
    }

    const sellerPolicies = await assertSellerPoliciesAccepted(admin, listing.seller_id)
    if (!sellerPolicies.ok) {
      return json({ error: sellerPolicies.error, message: sellerPolicies.message }, 403)
    }

    if (listing.seller_id === user.id) {
      return json({ error: 'cannot_buy_own_listing' }, 400)
    }

    const isAuction = listing.sale_type === 'auction'
    const auctionStillOpen = !!(
      isAuction &&
      listing.auction_ends_at &&
      new Date(listing.auction_ends_at) > new Date()
    )
    const buyNow = listing.buy_now_price != null ? Number(listing.buy_now_price) : null
    const hasBuyNow = buyNow != null && Number.isFinite(buyNow) && buyNow > 0
    const bidCount = listing.bid_count ?? 0
    const buyNowCheckout = auctionStillOpen && hasBuyNow && bidCount === 0

    if (isAuction && auctionStillOpen && !buyNowCheckout) {
      if (hasBuyNow && bidCount > 0) {
        return json({ error: 'buy_now_unavailable' }, 400)
      }
      return json({ error: 'auction_still_open' }, 400)
    }

    if (isAuction && !auctionStillOpen) {
      if (!listing.current_bidder_id || listing.current_bidder_id !== user.id) {
        return json({ error: 'not_auction_winner' }, 403)
      }
      const reserve = listing.reserve_price != null ? Number(listing.reserve_price) : null
      const winning = Number(listing.current_bid)
      if (reserve != null && Number.isFinite(reserve) && winning < reserve) {
        return json({ error: 'reserve_not_met' }, 400)
      }
    }

    const amount = buyNowCheckout
      ? buyNow!
      : isAuction
        ? Number(listing.current_bid)
        : Number(listing.price)
    const shippingCost = Math.max(0, Number((listing as { shipping_cost?: number }).shipping_cost) || 0)
    const merchandiseTotal = amount
    const orderAmount = merchandiseTotal + shippingCost
    if (!Number.isFinite(merchandiseTotal) || merchandiseTotal <= 0) {
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

    const charityPct = listing.donate_proceeds && listing.charity_key
      ? Math.min(100, Math.max(1, Number(listing.charity_percent ?? 100)))
      : 0
    const hasCharityDonation = charityPct > 0
    const isDropship = String(listing.listing_mode || '').toLowerCase() === 'dropship'
    const wholesaleCost = isDropship ? Number(listing.dropship_wholesale_cost) || 0 : 0

    if (isDropship && wholesaleCost <= 0) {
      return json({ error: 'dropship_wholesale_cost_required' }, 400)
    }

    let orderPlatformFee: number
    let orderSellerPayout: number
    let orderSupplierCost = 0
    let orderSellerMargin: number | null = null
    let orderCharityAmount: number | null = null
    let feeBpsStored: number | null = null

    if (hasCharityDonation) {
      const split = calcCharitySplit(orderAmount, charityPct, sellerProfile?.seller_tier)
      orderPlatformFee = split.platformFee
      orderSellerPayout = split.sellerPayout
      orderCharityAmount = split.charityAmount
    } else if (isDropship) {
      const split = calcDropshipSplit(orderAmount, wholesaleCost, sellerProfile?.seller_tier)
      if (split.sellerMargin <= 0) {
        return json({ error: 'dropship_margin_too_low', detail: 'Wholesale cost is too high for this list price.' }, 400)
      }
      orderPlatformFee = split.platformFee
      orderSupplierCost = split.supplierCost
      orderSellerMargin = split.sellerMargin
      orderSellerPayout = split.sellerMargin
    } else {
      const { platformFee, sellerPayout, feeBps } = await calculateFees(admin, {
        merchandiseAmount: orderAmount,
        sellerId: listing.seller_id,
        sellerProfile: sellerProfile,
      })
      orderPlatformFee = platformFee
      orderSellerPayout = sellerPayout
      feeBpsStored = feeBps
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount: orderAmount,
        merchandise_amount: merchandiseTotal,
        shipping_cost: shippingCost,
        platform_fee: orderPlatformFee,
        seller_payout: orderSellerPayout,
        fee_bps: feeBpsStored,
        listing_mode: isDropship ? 'dropship' : (listing.listing_mode || 'direct'),
        supplier_cost: orderSupplierCost,
        seller_margin: orderSellerMargin,
        currency: 'usd',
        status: 'pending',
        escrow_status: 'none',
        connect_checkout: false,
        buyer_email: user.email ?? null,
        donate_to_charity: hasCharityDonation,
        charity_key: hasCharityDonation ? listing.charity_key : null,
        charity_name: hasCharityDonation ? listing.charity_name : null,
        charity_amount: orderCharityAmount,
        charity_percent: hasCharityDonation ? charityPct : null,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return json({ error: 'order_create_failed', detail: orderError?.message }, 500)
    }

    const listingCoaType = String((listing as { coa_type?: string }).coa_type ?? '')
    const serializedCoaSerial = listingCoaType === 'franks_issued'
      ? String(body.serialized_coa_serial ?? (listing as { coa_serial_number?: string }).coa_serial_number ?? '').trim() || null
      : null

    const { error: ackError } = await admin.from('buyer_order_acknowledgments').insert({
      buyer_id: user.id,
      listing_id: listing.id,
      order_id: order.id,
      ack_version: checkoutAckVersion,
      serialized_coa_serial: serializedCoaSerial,
      ack_text_sha256: String(body.checkout_ack_hash ?? '').trim() || null,
    })
    if (ackError) {
      await admin.from('orders').update({ status: 'cancelled', escrow_status: 'none' }).eq('id', order.id)
      return json({ error: 'checkout_ack_record_failed', detail: ackError.message }, 500)
    }

    if (buyNowCheckout) {
      await admin
        .from('listings')
        .update({ auction_ends_at: new Date().toISOString() })
        .eq('id', listing.id)
    }

    const merchandiseCents = Math.round(merchandiseTotal * 100)
    const shippingCents = Math.round(shippingCost * 100)
    const platformFeeCents = Math.round(orderPlatformFee * 100)

    const lineItems: NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>['line_items'] = [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: merchandiseCents,
        ...(stripeTaxEnabled() ? { tax_behavior: 'exclusive' as const } : {}),
        product_data: {
          name: hasCharityDonation
            ? `${String(listing.title).slice(0, 72)} — ${charityPct}% to ${String(listing.charity_name ?? 'charity').slice(0, 24)}`
            : String(listing.title).slice(0, 120),
          ...(stripeTaxEnabled() ? { tax_code: TAX_CODE_TANGIBLE } : {}),
          metadata: {
            listing_id: listing.id,
            charity: hasCharityDonation ? String(listing.charity_key) : '',
            charity_percent: hasCharityDonation ? String(charityPct) : '',
          },
        },
      },
    }]
    if (shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: shippingCents,
          ...(stripeTaxEnabled() ? { tax_behavior: 'exclusive' as const } : {}),
          product_data: {
            name: 'Shipping',
            ...(stripeTaxEnabled() ? { tax_code: TAX_CODE_SERVICES } : {}),
            metadata: { listing_id: listing.id, line: 'shipping' },
          },
        },
      })
    }

    const base = siteUrl()
    // Dropship: full payment on platform (escrow) then split via transfers on ship + confirm.
    // Charity splits (full or partial) are settled on-platform so charity + seller shares are correct.
    const useConnect = !hasCharityDonation && !isDropship
      && !!(sellerProfile?.stripe_account_id && sellerProfile?.stripe_charges_enabled)

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'payment',
      client_reference_id: order.id,
      customer_email: user.email ?? undefined,
      line_items: lineItems,
      metadata: {
        order_id: order.id,
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        listing_mode: isDropship ? 'dropship' : 'direct',
        donate_to_charity: hasCharityDonation ? 'true' : 'false',
        charity_key: hasCharityDonation ? String(listing.charity_key) : '',
        charity_name: hasCharityDonation ? String(listing.charity_name ?? '') : '',
        charity_percent: hasCharityDonation ? String(charityPct) : '',
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
      charity_sale: hasCharityDonation,
      charity_percent: hasCharityDonation ? charityPct : null,
      charity_name: hasCharityDonation ? listing.charity_name : null,
      charity_amount: orderCharityAmount,
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
