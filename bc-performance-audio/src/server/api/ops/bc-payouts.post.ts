import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'

/** Queue a seller payout record (25% tax reserve is tracked separately in the ledger tab). */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const sellerId = String(body?.sellerId || '').trim()
  const amount = Number(body?.amount)
  const currency = String(body?.currency || 'USD').toUpperCase()

  if (!sellerId || !Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'sellerId and positive amount are required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data, error } = await sb.from('bc_payouts').insert({
    seller_id: sellerId,
    amount,
    currency,
    status: 'pending',
  }).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logBcAudit('admin', null, 'payout_queued', 'payout', data.id, { sellerId, amount })
  return { success: true, payout: data }
})
