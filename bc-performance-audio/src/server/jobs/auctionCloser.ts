import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { logBcAudit } from '#bc-server-utils/audit'
import { triageBcDispute, autoRefundEnabled, orderTotalDollars } from '#bc-server-utils/bcDisputeTriage'

/** Close auctions whose end_time has passed. Run on a schedule (every minute). */
export async function closeDueBcAuctions () {
  const sb = getBcServiceSupabase()
  if (!sb) return { closed: 0, message: 'Supabase unavailable' }

  const now = new Date().toISOString()
  const { data: due } = await sb
    .from('bc_auctions')
    .select('*')
    .eq('status', 'active')
    .lte('end_time', now)
    .limit(50)

  let closed = 0
  for (const auction of due || []) {
    try {
      const { data: topBid } = await sb
        .from('bc_bids')
        .select('*')
        .eq('auction_id', auction.id)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle()

      const meetsReserve = topBid && Number(topBid.amount) >= Number(auction.reserve_price || 0)
      await sb.from('bc_auctions').update({
        status: meetsReserve ? 'closed' : 'cancelled',
      }).eq('id', auction.id)

      await logBcAudit('system', null, 'auction_auto_closed', 'auction', auction.id, { topBid })
      closed++
    } catch (err) {
      console.error('Error closing BC auction', auction.id, err)
    }
  }

  return { closed }
}
