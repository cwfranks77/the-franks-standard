const { statusEnvelope } = require('./_shared.js')
const { loadPlatformConfig } = require('./load_config.js')

async function getFinancialStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const config = loadPlatformConfig()

  const [
    { count: paidOrders },
    { data: paidRows },
    { count: pendingPayouts },
    { data: pendingRows },
    { count: heldPayouts },
    { count: failedPayouts },
    { count: openRefunds },
    { data: ledgerRecent },
  ] = await Promise.all([
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid').gte('paid_at', since30d),
    admin.from('orders').select('total_paid, amount, platform_fee').eq('status', 'paid').gte('paid_at', since30d).limit(5000),
    admin.from('payouts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('payouts').select('amount').eq('status', 'pending'),
    admin.from('payouts').select('id', { count: 'exact', head: true }).eq('status', 'held'),
    admin.from('payouts').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since30d),
    admin.from('refund_requests').select('id', { count: 'exact', head: true }).in('status', ['pending', 'seller_review']),
    admin.from('ledger_entries').select('entry_type, amount').gte('created_at', since30d).limit(1000),
  ])

  const gross = (paidRows ?? []).reduce((s, o) => s + (Number(o.total_paid ?? o.amount) || 0), 0)
  const fees = (paidRows ?? []).reduce((s, o) => s + (Number(o.platform_fee) || 0), 0)
  const pendingAmount = (pendingRows ?? []).reduce((s, p) => s + (Number(p.amount) || 0), 0)

  if ((failedPayouts ?? 0) > 0) alerts.push(`payout_failures_30d:${failedPayouts}`)
  if ((heldPayouts ?? 0) > 10) warnings.push(`held_payouts:${heldPayouts}`)
  if ((openRefunds ?? 0) > 20) warnings.push(`open_refunds:${openRefunds}`)

  return statusEnvelope({
    counts: {
      paid_orders_30d: paidOrders ?? 0,
      pending_payouts: pendingPayouts ?? 0,
      held_payouts: heldPayouts ?? 0,
      failed_payouts_30d: failedPayouts ?? 0,
      open_refunds: openRefunds ?? 0,
      ledger_entries_30d: (ledgerRecent ?? []).length,
    },
    summaries: {
      gross_sales_30d: Math.round(gross * 100) / 100,
      platform_fees_30d: Math.round(fees * 100) / 100,
      pending_payout_amount: Math.round(pendingAmount * 100) / 100,
      fee_rates: config.fee_rates,
      payout_delay_days: config.payout_delay_days,
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getFinancialStatus }
