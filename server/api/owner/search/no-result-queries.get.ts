import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const days = Math.min(90, Math.max(1, Number(query.days) || 30))
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await sb
    .from('search_events')
    .select('query, filters, results_count, created_at')
    .gte('created_at', since)
    .eq('results_count', 0)
    .not('query', 'eq', '')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const counts = new Map<string, { query: string; count: number; last_at: string }>()
  for (const row of data ?? []) {
    const q = String(row.query || '').trim().toLowerCase()
    if (!q) continue
    const existing = counts.get(q)
    if (!existing) counts.set(q, { query: q, count: 1, last_at: row.created_at })
    else {
      existing.count += 1
      if (row.created_at > existing.last_at) existing.last_at = row.created_at
    }
  }

  const noResults = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return { ok: true, since, days, no_result_queries: noResults }
})
