import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const days = Math.min(90, Math.max(1, Number(query.days) || 30))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: searches, error: sErr },
    { count: totalSearches },
    { data: zeroResults },
    { data: trending },
    { count: indexListings },
    { count: indexStores },
  ] = await Promise.all([
    sb.from('search_events').select('query, results_count, created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(100),
    sb.from('search_events').select('id', { count: 'exact', head: true }).gte('created_at', since),
    sb.from('search_events').select('id', { count: 'exact', head: true }).gte('created_at', since).eq('results_count', 0),
    sb.from('listing_trending_scores').select('listing_id, score').order('score', { ascending: false }).limit(10),
    sb.from('search_index_listings').select('listing_id', { count: 'exact', head: true }),
    sb.from('search_index_stores').select('store_id', { count: 'exact', head: true }),
  ])

  if (sErr) throw createError({ statusCode: 500, statusMessage: sErr.message })

  const withResults = (searches ?? []).filter((s) => (s.results_count ?? 0) > 0).length
  const avgResults = (searches ?? []).length
    ? Math.round(((searches ?? []).reduce((a, s) => a + (s.results_count ?? 0), 0) / (searches ?? []).length) * 10) / 10
    : 0

  return {
    ok: true,
    period_days: days,
    since,
    totals: {
      searches: totalSearches ?? 0,
      zero_result_searches: zeroResults ?? 0,
      hit_rate_pct: totalSearches ? Math.round((withResults / (searches?.length || 1)) * 100) : 0,
      avg_results_per_search: avgResults,
      indexed_listings: indexListings ?? 0,
      indexed_stores: indexStores ?? 0,
    },
    recent_searches: searches ?? [],
    top_trending_listings: trending ?? [],
    cache_policy: {
      search_results_seconds: 60,
      autocomplete_seconds: 600,
      listings_reindex_minutes: 5,
      stores_reindex_minutes: 10,
    },
  }
})
