/**
 * Personalized recommendations for a user.
 */

const { loadUserSignals, extractPreferences } = require('./_behavior.js')
const { computeTrendingScores } = require('./trending.js')

async function recommendForUser (admin, { userId, limit = 12 }) {
  if (!userId) return { ok: false, error: 'user_id_required' }

  const { signals, activity } = await loadUserSignals(admin, userId)
  const prefs = extractPreferences(signals, activity)

  let query = admin.from('search_index_listings').select('*').limit(200)

  if (prefs.topCategories.length) {
    query = query.in('category', prefs.topCategories)
  }
  if (prefs.priceMin != null) query = query.gte('price', prefs.priceMin)
  if (prefs.priceMax != null) query = query.lte('price', prefs.priceMax)

  const { data: listings } = await query

  const exclude = new Set([...prefs.purchased])
  const scored = (listings ?? [])
    .filter((l) => !exclude.has(l.listing_id))
    .map((l) => {
      let score = 10
      if (prefs.topCategories.includes(l.category)) score += 30
      if (prefs.viewed.includes(l.listing_id)) score += 15
      if (prefs.saved.includes(l.listing_id)) score += 25
      if (prefs.avgPrice && l.price != null) {
        const diff = Math.abs(Number(l.price) - prefs.avgPrice)
        score += Math.max(0, 20 - diff / 10)
      }
      return { ...l, _score: score }
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)

  const { data: stores } = await admin
    .from('search_index_stores')
    .select('*')
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(limit)

  const recommendedStores = (stores ?? [])
    .filter((s) => prefs.storeIds.includes(s.store_id) || prefs.topCategories.some((c) => (s.categories || []).includes(c)))
    .slice(0, 6)

  const trending = await computeTrendingScores(admin, { limit: 8 })

  return {
    ok: true,
    user_id: userId,
    recommended_listings: scored,
    recommended_stores: recommendedStores.length ? recommendedStores : (stores ?? []).slice(0, 6),
    trending_items: trending.items ?? [],
    preferences: prefs,
  }
}

module.exports = { recommendForUser }
