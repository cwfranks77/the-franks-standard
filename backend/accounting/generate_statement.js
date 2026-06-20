/**
 * Monthly statement generator for sellers or platform owner.
 */

async function generateStatement (admin, { userId = null, year, month }) {
  const y = Number(year)
  const m = Number(month)
  if (!y || !m || m < 1 || m > 12) return { ok: false, error: 'invalid_month' }

  const start = new Date(Date.UTC(y, m - 1, 1)).toISOString()
  const end = new Date(Date.UTC(y, m, 1)).toISOString()
  const statementMonth = `${y}-${String(m).padStart(2, '0')}-01`

  const orderQuery = admin
    .from('orders')
    .select('id, amount, total_paid, platform_fee, seller_payout, status, refund_amount, seller_id, buyer_id')
    .gte('paid_at', start)
    .lt('paid_at', end)
    .eq('status', 'paid')

  if (userId) orderQuery.eq('seller_id', userId)

  const { data: orders } = await orderQuery

  const totalSales = (orders ?? []).reduce((s, o) => s + (Number(o.total_paid ?? o.amount) || 0), 0)
  const totalFees = (orders ?? []).reduce((s, o) => s + (Number(o.platform_fee) || 0), 0)

  const payoutQuery = admin
    .from('payouts')
    .select('amount, status, seller_id')
    .gte('created_at', start)
    .lt('created_at', end)
    .in('status', ['released', 'paid', 'pending'])

  if (userId) payoutQuery.eq('seller_id', userId)
  const { data: payouts } = await payoutQuery
  const totalPayouts = (payouts ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0)

  const refundQuery = admin
    .from('order_refund_events')
    .select('amount, order_id')
    .gte('created_at', start)
    .lt('created_at', end)

  const { data: refunds } = await refundQuery
  const totalRefunds = (refunds ?? []).reduce((s, r) => s + (Number(r.amount) || 0), 0)

  let disputesSummary = { open: 0, resolved: 0 }
  const disputeQuery = admin
    .from('dispute_cases')
    .select('status, seller_id, buyer_id')
    .gte('created_at', start)
    .lt('created_at', end)

  const { data: disputes } = await disputeQuery
  for (const d of disputes ?? []) {
    if (userId && d.seller_id !== userId && d.buyer_id !== userId) continue
    if (d.status === 'resolved') disputesSummary.resolved += 1
    else disputesSummary.open += 1
  }

  let fraudHoldsSummary = { held_payouts: 0, held_amount: 0 }
  const holdQuery = admin
    .from('payouts')
    .select('amount, seller_id')
    .eq('status', 'held')
    .gte('created_at', start)
    .lt('created_at', end)

  if (userId) holdQuery.eq('seller_id', userId)
  const { data: holds } = await holdQuery
  fraudHoldsSummary = {
    held_payouts: (holds ?? []).length,
    held_amount: (holds ?? []).reduce((s, h) => s + (Number(h.amount) || 0), 0),
  }

  const row = {
    user_id: userId,
    statement_month: statementMonth,
    total_sales: Math.round(totalSales * 100) / 100,
    total_fees: Math.round(totalFees * 100) / 100,
    total_payouts: Math.round(totalPayouts * 100) / 100,
    total_refunds: Math.round(totalRefunds * 100) / 100,
    disputes_summary: disputesSummary,
    fraud_holds_summary: fraudHoldsSummary,
    metadata: { order_count: (orders ?? []).length, generated_at: new Date().toISOString() },
  }

  const { data, error } = await admin
    .from('monthly_statements')
    .upsert(row, { onConflict: 'user_id,statement_month' })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, statement_id: data.id, ...row }
}

module.exports = { generateStatement }
