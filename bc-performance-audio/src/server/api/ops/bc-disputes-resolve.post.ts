import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'
import { refundBcOrderPayment } from '#bc-server-utils/bcStripe'

/** Owner resolves a dispute — optional Stripe refund when payment_intent_id is supplied. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const disputeId = String(body?.disputeId || '').trim()
  const resolution = body?.resolution || {}
  const refundToBuyer = Boolean(body?.refundToBuyer)
  const paymentIntentId = String(body?.paymentIntentId || '').trim()

  if (!disputeId) {
    throw createError({ statusCode: 400, statusMessage: 'disputeId is required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data: dispute, error: fetchErr } = await sb
    .from('bc_disputes')
    .select('*')
    .eq('id', disputeId)
    .single()

  if (fetchErr || !dispute) {
    throw createError({ statusCode: 404, statusMessage: 'Dispute not found' })
  }

  let refundResult = null
  if (refundToBuyer && paymentIntentId) {
    refundResult = await refundBcOrderPayment(paymentIntentId)
  }

  const { data, error } = await sb.from('bc_disputes').update({
    status: 'resolved',
    resolution: { ...resolution, refund: refundResult },
    resolved_at: new Date().toISOString(),
  }).eq('id', disputeId).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logBcAudit('admin', null, 'dispute_resolved', 'dispute', disputeId, { resolution, refundToBuyer, refundResult })
  return { success: true, dispute: data, refundResult }
})
