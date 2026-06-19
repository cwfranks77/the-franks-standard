import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

/** Place a bid on an active auction (owner console test / manual entry). */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const auctionId = String(body?.auctionId || '').trim()
  const amount = Number(body?.amount)
  const bidderEmail = String(body?.bidderEmail || '').trim() || null

  if (!auctionId || !Number.isFinite(amount)) {
    throw createError({ statusCode: 400, statusMessage: 'auctionId and amount are required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data: auction, error: aErr } = await sb.from('bc_auctions').select('*').eq('id', auctionId).single()
  if (aErr || !auction) {
    throw createError({ statusCode: 404, statusMessage: 'Auction not found' })
  }
  if (auction.status !== 'active') {
    throw createError({ statusCode: 400, statusMessage: 'Auction is not active' })
  }

  const { data: topBid } = await sb
    .from('bc_bids')
    .select('amount')
    .eq('auction_id', auctionId)
    .order('amount', { ascending: false })
    .limit(1)
    .maybeSingle()

  const minNext = topBid
    ? Number(topBid.amount) + Number(auction.min_increment || 1)
    : Math.max(Number(auction.reserve_price || 0), Number(auction.min_increment || 1))

  if (amount < minNext) {
    throw createError({ statusCode: 400, statusMessage: `Bid must be at least ${minNext}` })
  }

  const { data: bid, error } = await sb.from('bc_bids').insert({
    auction_id: auctionId,
    bidder_email: bidderEmail,
    amount,
    is_auto: Boolean(body?.isAuto),
  }).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const extendWindowMs = 5 * 60 * 1000
  const endTime = new Date(auction.end_time)
  if (endTime.getTime() - Date.now() <= extendWindowMs) {
    const extended = new Date(endTime.getTime() + extendWindowMs)
    await sb.from('bc_auctions').update({
      end_time: extended.toISOString(),
      extended_until: extended.toISOString(),
    }).eq('id', auctionId)
  }

  return { success: true, bid }
})
