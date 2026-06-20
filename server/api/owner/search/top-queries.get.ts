import { createRequire } from 'node:module'
import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

const require = createRequire(import.meta.url)

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
    .select('query')
    .gte('created_at', since)
    .not('query', 'eq', '')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const q = String(row.query || '').trim().toLowerCase()
    if (!q) continue
    counts.set(q, (counts.get(q) || 0) + 1)
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([queryText, count]) => ({ query: queryText, count }))

  return { ok: true, since, days, top_queries: top }
})
