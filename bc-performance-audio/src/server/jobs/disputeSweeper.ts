import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { logBcAudit } from '#bc-server-utils/audit'
import { triageBcDispute, autoRefundEnabled, orderTotalDollars } from '#bc-server-utils/bcDisputeTriage'

/** Sweep open disputes and auto-resolve eligible non-shipment cases. */
export async function sweepBcDisputes () {
  const sb = getBcServiceSupabase()
  if (!sb) return { resolved: 0, message: 'Supabase unavailable' }

  const { data: disputes } = await sb
    .from('bc_disputes')
    .select('*')
    .eq('status', 'open')
    .limit(100)

  let resolved = 0
  const maxAmount = Number(process.env.AUTO_REFUND_MAX_AMOUNT || 200)

  for (const dispute of disputes || []) {
    try {
      if (dispute.reason !== 'non-shipment') continue

      const { data: order } = await sb
        .from('orders')
        .select('id,total_cents,tracking_number')
        .eq('id', dispute.order_id)
        .maybeSingle()

      const orderObj = order || { total: 0, tracking_number: null }
      const triage = await triageBcDispute(dispute, orderObj)
      await logBcAudit('ai', null, 'sweeper_triage', 'dispute', dispute.id, { triage })

      const total = orderTotalDollars(orderObj as Record<string, unknown>)
      if (
        autoRefundEnabled()
        && triage.decision === 'auto_refund'
        && total > 0
        && total <= maxAmount
      ) {
        await sb.from('bc_disputes').update({
          status: 'resolved',
          resolution: { by: 'ai', reasons: triage.reasons },
          resolved_at: new Date().toISOString(),
        }).eq('id', dispute.id)

        await logBcAudit('system', null, 'auto_refund_executed', 'order', dispute.order_id, { amount: total })
        resolved++
      }
    } catch (err) {
      console.error('Error sweeping BC dispute', dispute.id, err)
    }
  }

  return { resolved }
}
