import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'
import { triageBcDispute, autoRefundEnabled, orderTotalDollars } from '#bc-server-utils/bcDisputeTriage'
import { sendBcOwnerEmail } from '#bc-server-utils/emailSender'
import { refundBcOrderPayment } from '#bc-server-utils/bcStripe'

/** Run AI / rule-based triage on a dispute. May auto-refund small orders when enabled. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const disputeId = String(body?.disputeId || '').trim()
  const paymentIntentId = String(body?.paymentIntentId || '').trim()

  if (!disputeId) {
    throw createError({ statusCode: 400, statusMessage: 'disputeId is required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data: dispute, error } = await sb.from('bc_disputes').select('*').eq('id', disputeId).single()
  if (error || !dispute) {
    throw createError({ statusCode: 404, statusMessage: 'Dispute not found' })
  }

  const { data: orderRow } = await sb
    .from('orders')
    .select('id,total_cents,tracking_number,buyer_email,payment_intent_id')
    .eq('id', dispute.order_id)
    .maybeSingle()

  const order = orderRow || { total: body?.orderTotal || 0, tracking_number: body?.trackingNumber }
  const result = await triageBcDispute(dispute, order)
  await logBcAudit('ai', null, 'triage_decision', 'dispute', disputeId, { result })

  const maxAmount = Number(process.env.AUTO_REFUND_MAX_AMOUNT || 200)
  const total = orderTotalDollars(order as Record<string, unknown>)

  if (
    autoRefundEnabled()
    && result.decision === 'auto_refund'
    && total > 0
    && total <= maxAmount
  ) {
    const pi = paymentIntentId || String((order as { payment_intent_id?: string }).payment_intent_id || '')
    const refundResult = pi ? await refundBcOrderPayment(pi) : { ok: false, error: 'no_payment_intent' }

    await sb.from('bc_disputes').update({
      status: 'resolved',
      resolution: { by: 'ai', reasons: result.reasons, refund: refundResult },
      resolved_at: new Date().toISOString(),
    }).eq('id', disputeId)

    await logBcAudit('system', null, 'auto_refund_executed', 'order', dispute.order_id, { amount: total, refundResult })

    const buyerEmail = dispute.buyer_email || (order as { buyer_email?: string }).buyer_email
    if (buyerEmail) {
      await sendBcOwnerEmail(buyerEmail, `Refund issued for Order ${dispute.order_id}`, `A refund of $${total.toFixed(2)} has been issued.`)
    }

    return { result, autoRefund: true, refundResult }
  }

  return { result, autoRefund: false }
})
