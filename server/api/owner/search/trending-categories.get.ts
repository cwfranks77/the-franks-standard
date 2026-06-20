import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const days = Math.min(90, Math.max(1, Number(query.days) || 30))
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: events, error } = await sb
    .from('search_events')
    .select('filters')
    .gte('created_at', since)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const catCounts = new Map<string, number>()
  for (const row of events ?? []) {
    const cat = (row.filters as { category?: string })?.category
    if (cat) catCounts.set(cat, (catCounts.get(cat) || 0) + 1)
  }

  const { data: listings } = await sb
    .from('search_index_listings')
    .select('category')
    .not('category', 'is', null)

  for (const l of listings ?? []) {
    if (l.category) catCounts.set(l.category, (catCounts.get(l.category) || 0) + 0)
  }

  const trending = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category, search_count]) => ({ category, search_count }))

  return { ok: true, since, days, trending_categories: trending }
})
