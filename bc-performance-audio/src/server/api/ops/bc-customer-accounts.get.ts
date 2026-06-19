import { getBcServiceSupabase, supabaseUnavailable } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

/** List customer accounts for owner approval. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const sb = getBcServiceSupabase()
  if (!sb) return supabaseUnavailable()

  const query = getQuery(event)
  const status = String(query.status || '').trim()

  let q = sb.from('bc_customer_profiles').select('*').order('created_at', { ascending: false }).limit(100)
  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const pending = (data || []).filter((r) => r.status === 'pending').length
  return { rows: data || [], pending, source: 'supabase' }
})
