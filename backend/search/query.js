/**
 * Search query engine — keyword, fuzzy, filters, sort. Caches 60 seconds.
 */

const { cacheGet, cacheSet } = require('../cache/cache.js')
const { fuzzyScore } = require('./_utils.js')

const SEARCH_CACHE_TTL = 60

async function logSearchEvent (admin, { userId, query, filters, resultsCount }) {
  if (!admin) return
  await admin.from('search_events').insert({
    user_id: userId ?? null,
    query: String(query || '').slice(0, 500),
    filters: filters || {},
    results_count: resultsCount ?? 0,
  })
}

async function searchQuery (admin, {
  q = '',
  userId = null,
  category = null,
  minPrice = null,
  maxPrice = null,
  condition = null,
  sellerId = null,
  brand = null,
  sort = 'relevance',
  limit = 40,
  type = 'listings',
}) {
  const filters = { category, minPrice, maxPrice, condition, sellerId, brand, sort, type }
  const cacheKey = `search:${type}:${JSON.stringify({ q, ...filters, limit })}`

  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, cached: true }

  let results = []

  if (type === 'listings' || type === 'all') {
    let query = admin.from('search_index_listings').select('*').limit(500)
    if (category) query = query.eq('category', category)
    if (condition) query = query.eq('condition', condition)
    if (sellerId) query = query.eq('seller_id', sellerId)
    if (brand) query = query.ilike('brand', `%${brand}%`)
    if (minPrice != null) query = query.gte('price', Number(minPrice))
    if (maxPrice != null) query = query.lte('price', Number(maxPrice))

    const { data, error } = await query
    if (error) return { ok: false, error: error.message }

    const keyword = String(q || '').trim().toLowerCase()
    results = (data ?? []).map((row) => ({
      ...row,
      _relevance: keyword ? fuzzyScore(keyword, row.search_text) : 50,
      _type: 'listing',
    }))

    if (keyword) results = results.filter((r) => r._relevance > 15)
  }

  if (type === 'stores' || type === 'all') {
    const { data: stores } = await admin.from('search_index_stores').select('*').limit(100)
    const keyword = String(q || '').trim()
    const storeHits = (stores ?? []).map((row) => ({
      ...row,
      _relevance: keyword ? fuzzyScore(keyword, row.search_text) : 40,
      _type: 'store',
    })).filter((r) => !keyword || r._relevance > 15)
    results = results.concat(storeHits)
  }

  results = sortResults(results, sort)
  results = results.slice(0, limit)

  const payload = {
    ok: true,
    query: q,
    filters,
    sort,
    count: results.length,
    results,
  }

  await cacheSet(cacheKey, payload, SEARCH_CACHE_TTL)
  await logSearchEvent(admin, { userId, query: q, filters, resultsCount: results.length })

  return payload
}

function sortResults (rows, sort) {
  const list = [...rows]
  switch (sort) {
    case 'newest':
      return list.sort((a, b) => String(b.indexed_at || '').localeCompare(String(a.indexed_at || '')))
    case 'price_low':
      return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    case 'price_high':
      return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    case 'rating':
      return list.sort((a, b) => (Number(b.rating_avg ?? b.rating) || 0) - (Number(a.rating_avg ?? a.rating) || 0))
    case 'relevance':
    default:
      return list.sort((a, b) => (b._relevance || 0) - (a._relevance || 0))
  }
}

module.exports = { searchQuery, logSearchEvent, SEARCH_CACHE_TTL }
