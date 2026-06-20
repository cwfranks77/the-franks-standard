import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const days = Math.min(365, Math.max(1, Number(query.days) || 30))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: paidOrders },
    { data: payouts },
    { data: refunds },
    { data: heldPayouts },
    { data: openDisputes },
  ] = await Promise.all([
    sb.from('orders').select('id, total_paid, amount, platform_fee, paid_at').eq('status', 'paid').gte('paid_at', since),
    sb.from('payouts').select('id, amount, status, created_at').gte('created_at', since),
    sb.from('order_refund_events').select('id, amount, created_at').gte('created_at', since),
    sb.from('payouts').select('id, amount').eq('status', 'held'),
    sb.from('dispute_cases').select('id').neq('status', 'resolved'),
  ])

  const grossSales = (paidOrders ?? []).reduce((s, o) => s + (Number(o.total_paid ?? o.amount) || 0), 0)
  const totalFees = (paidOrders ?? []).reduce((s, o) => s + (Number(o.platform_fee) || 0), 0)
  const totalPayouts = (payouts ?? []).filter((p) => ['paid', 'released', 'pending'].includes(p.status))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const totalRefunds = (refunds ?? []).reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const heldAmount = (heldPayouts ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0)

  return {
    ok: true,
    period_days: days,
    since,
    gross_sales: Math.round(grossSales * 100) / 100,
    platform_fees: Math.round(totalFees * 100) / 100,
    payouts_total: Math.round(totalPayouts * 100) / 100,
    refunds_total: Math.round(totalRefunds * 100) / 100,
    orders_paid: (paidOrders ?? []).length,
    payouts_count: (payouts ?? []).length,
    refunds_count: (refunds ?? []).length,
    held_payouts_count: (heldPayouts ?? []).length,
    held_payouts_amount: Math.round(heldAmount * 100) / 100,
    open_disputes: (openDisputes ?? []).length,
  }
})
