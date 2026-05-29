import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozen } from '../_shared/sellerAccountFreeze.ts'
import { assertSellerNotOnIntegrityHold } from '../_shared/sellerIntegrityHold.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

function minNextBid (listing: {
  starting_bid: number | null
  current_bid: number | null
  bid_increment: number | null
}) {
  const start = Number(listing.starting_bid ?? 0)
  const increment = Number(listing.bid_increment ?? 1)
  const current = listing.current_bid != null ? Number(listing.current_bid) : null
  if (current == null || !Number.isFinite(current)) {
    return start
  }
  return Math.round((current + increment) * 100) / 100
}

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

    const body = await req.json().catch(() => ({})) as { listing_id?: string; amount?: number }
    const listingId = String(body.listing_id ?? '').trim()
    const amount = Number(body.amount)
    if (!listingId) {
      return json({ error: 'listing_id_required' }, 400)
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: 'invalid_bid_amount' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

    const buyerFreeze = await assertAccountNotFrozen(admin, user.id)
    if (!buyerFreeze.ok) {
      return json({ error: buyerFreeze.error, message: buyerFreeze.message }, 403)
    }

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, seller_id, sale_type, status, starting_bid, current_bid, bid_increment, auction_ends_at, bid_count')
      .eq('id', listingId)
      .eq('status', 'published')
      .maybeSingle()

    if (listingError || !listing) {
      return json({ error: 'listing_not_found' }, 404)
    }
    if (listing.sale_type !== 'auction') {
      return json({ error: 'not_an_auction' }, 400)
    }
    if (listing.seller_id === user.id) {
      return json({ error: 'cannot_bid_own_listing' }, 400)
    }

    const sellerFreeze = await assertAccountNotFrozen(admin, listing.seller_id)
    if (!sellerFreeze.ok) {
      return json({ error: 'seller_account_frozen', message: 'This seller cannot receive bids.' }, 403)
    }

    const sellerHold = await assertSellerNotOnIntegrityHold(admin, listing.seller_id)
    if (!sellerHold.ok) {
      return json({ error: sellerHold.error, message: sellerHold.message }, 403)
    }

    if (!listing.auction_ends_at || new Date(listing.auction_ends_at) <= new Date()) {
      return json({ error: 'auction_ended' }, 400)
    }

    const minimum = minNextBid(listing)
    if (amount < minimum) {
      return json({ error: 'bid_too_low', detail: `Minimum bid is $${minimum.toFixed(2)}` }, 400)
    }

    const { error: bidErr } = await admin.from('listing_bids').insert({
      listing_id: listing.id,
      bidder_id: user.id,
      amount,
    })
    if (bidErr) {
      return json({ error: 'bid_failed', detail: bidErr.message }, 500)
    }

    const { data: updated, error: updErr } = await admin
      .from('listings')
      .update({
        current_bid: amount,
        current_bidder_id: user.id,
        bid_count: (listing.bid_count ?? 0) + 1,
        price: amount,
      })
      .eq('id', listing.id)
      .select('current_bid, bid_count, current_bidder_id, auction_ends_at')
      .single()

    if (updErr || !updated) {
      return json({ error: 'bid_update_failed', detail: updErr?.message }, 500)
    }

    return json({
      ok: true,
      current_bid: updated.current_bid,
      bid_count: updated.bid_count,
      current_bidder_id: updated.current_bidder_id,
      auction_ends_at: updated.auction_ends_at,
      minimum_next_bid: minNextBid({ ...listing, current_bid: updated.current_bid }),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'bid_failed'
    return json({ error: message }, 500)
  }
})