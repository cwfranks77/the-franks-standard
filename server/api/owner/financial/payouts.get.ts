import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const status = String(query.status ?? '').trim()
  const limit = Math.min(500, Math.max(1, Number(query.limit) || 100))

  let q = sb
    .from('payouts')
    .select('id, seller_id, order_id, amount, fee, status, hold_reason, scheduled_at, created_at, updated_at, processed_at, reference')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true, payouts: data ?? [] }
})
