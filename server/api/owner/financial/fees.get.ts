import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const days = Math.min(365, Math.max(1, Number(query.days) || 30))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders, error } = await sb
    .from('orders')
    .select('id, seller_id, platform_fee, fee_bps, amount, total_paid, paid_at')
    .eq('status', 'paid')
    .gte('paid_at', since)
    .order('paid_at', { ascending: false })
    .limit(500)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const totalFees = (orders ?? []).reduce((s, o) => s + (Number(o.platform_fee) || 0), 0)

  return {
    ok: true,
    since,
    total_fees: Math.round(totalFees * 100) / 100,
    order_count: (orders ?? []).length,
    fees: (orders ?? []).map((o) => ({
      order_id: o.id,
      seller_id: o.seller_id,
      platform_fee: o.platform_fee,
      fee_bps: o.fee_bps,
      order_total: o.total_paid ?? o.amount,
      paid_at: o.paid_at,
    })),
  }
})
