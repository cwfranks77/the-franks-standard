import { createRequire } from 'node:module'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'

const require = createRequire(import.meta.url)
const { searchQuery } = require('../../../backend/search/query.js')

/** GET /api/search/query — backend search (no UI). */
export default defineEventHandler(async (event) => {
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const q = getQuery(event)
  return searchQuery(sb, {
    q: String(q.q ?? ''),
    userId: q.user_id ? String(q.user_id) : null,
    category: q.category ? String(q.category) : null,
    minPrice: q.min_price != null ? Number(q.min_price) : null,
    maxPrice: q.max_price != null ? Number(q.max_price) : null,
    condition: q.condition ? String(q.condition) : null,
    sellerId: q.seller_id ? String(q.seller_id) : null,
    brand: q.brand ? String(q.brand) : null,
    sort: String(q.sort ?? 'relevance'),
    limit: Math.min(60, Number(q.limit) || 40),
    type: String(q.type ?? 'listings'),
  })
})
