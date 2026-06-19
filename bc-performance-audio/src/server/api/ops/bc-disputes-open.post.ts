import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'
import { sendBcOwnerEmail } from '#bc-server-utils/emailSender'

/** Owner opens a dispute on behalf of a buyer (or records a buyer report). */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const orderId = String(body?.orderId || '').trim()
  const reason = String(body?.reason || 'non-shipment').trim()
  const buyerEmail = String(body?.buyerEmail || '').trim()
  const sellerId = String(body?.sellerId || '').trim() || null
  const evidence = body?.evidence || null

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId is required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data, error } = await sb.from('bc_disputes').insert({
    order_id: orderId,
    buyer_email: buyerEmail || null,
    seller_id: sellerId,
    reason,
    evidence,
    status: 'open',
  }).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logBcAudit('admin', null, 'dispute_opened', 'order', orderId, { disputeId: data.id })
  if (buyerEmail) {
    await sendBcOwnerEmail(buyerEmail, `Dispute opened for Order ${orderId}`, 'Your dispute has been opened. We will update you within 72 hours.')
  }

  return { success: true, dispute: data }
})
