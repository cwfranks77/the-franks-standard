import { backendRequire as require } from '#cjs-require'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'

const { recommendForUser } = require('#backend/recommendations/recommend_for_user.js')
const { recommendSimilarItems } = require('#backend/recommendations/recommend_similar_items.js')
const { recommendTrending } = require('#backend/recommendations/recommend_trending.js')
const { discoverStores } = require('#backend/recommendations/store_discovery.js')

export default defineEventHandler(async (event) => {
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const q = getQuery(event)
  const mode = String(q.mode ?? 'user')

  if (mode === 'similar' && q.listing_id) {
    return recommendSimilarItems(sb, { listingId: String(q.listing_id), limit: Number(q.limit) || 8 })
  }
  if (mode === 'trending') {
    return recommendTrending(sb, { limit: Number(q.limit) || 12 })
  }
  if (mode === 'stores') {
    return discoverStores(sb, { userId: q.user_id ? String(q.user_id) : null, limit: Number(q.limit) || 10 })
  }

  if (!q.user_id) throw createError({ statusCode: 400, statusMessage: 'user_id required for user recommendations' })
  return recommendForUser(sb, { userId: String(q.user_id), limit: Number(q.limit) || 12 })
})
