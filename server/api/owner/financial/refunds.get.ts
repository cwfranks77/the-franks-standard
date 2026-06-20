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
    { data: refundEvents, error: e1 },
    { data: refundRequests, error: e2 },
  ] = await Promise.all([
    sb.from('order_refund_events').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
    sb.from('refund_requests').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
  ])

  if (e1) throw createError({ statusCode: 500, statusMessage: e1.message })
  if (e2) throw createError({ statusCode: 500, statusMessage: e2.message })

  const totalRefunded = (refundEvents ?? []).reduce((s, r) => s + (Number(r.amount) || 0), 0)

  return {
    ok: true,
    since,
    total_refunded: Math.round(totalRefunded * 100) / 100,
    processed_refunds: refundEvents ?? [],
    refund_requests: refundRequests ?? [],
  }
})
