import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'

/** Close an auction and record the winning bid. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const auctionId = String(body?.auctionId || '').trim()

  if (!auctionId) {
    throw createError({ statusCode: 400, statusMessage: 'auctionId is required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data: auction, error: aErr } = await sb.from('bc_auctions').select('*').eq('id', auctionId).single()
  if (aErr || !auction) {
    throw createError({ statusCode: 404, statusMessage: 'Auction not found' })
  }

  const { data: topBid } = await sb
    .from('bc_bids')
    .select('*')
    .eq('auction_id', auctionId)
    .order('amount', { ascending: false })
    .limit(1)
    .maybeSingle()

  const meetsReserve = topBid && Number(topBid.amount) >= Number(auction.reserve_price || 0)
  const nextStatus = meetsReserve ? 'closed' : 'cancelled'

  const { data, error } = await sb.from('bc_auctions').update({
    status: nextStatus,
  }).eq('id', auctionId).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logBcAudit('admin', null, 'auction_closed', 'auction', auctionId, { topBid, nextStatus })
  return { success: true, auction: data, topBid: topBid || null, winnerEmail: topBid?.bidder_email || null }
})
