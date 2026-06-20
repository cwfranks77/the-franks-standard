/**
 * Store discovery — categories, purchases, ratings, spotlight, featured.
 */

async function discoverStores (admin, { userId = null, limit = 10 } = {}) {
  const { data: featured } = await admin
    .from('search_index_stores')
    .select('*')
    .eq('featured_store', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(3)

  const { data: spotlightRow } = await admin
    .from('daily_spotlight')
    .select('store_id, spotlight_date')
    .eq('spotlight_date', new Date().toISOString().slice(0, 10))
    .maybeSingle()

  let spotlightStore = null
  if (spotlightRow?.store_id) {
    const { data } = await admin.from('search_index_stores').select('*').eq('store_id', spotlightRow.store_id).maybeSingle()
    spotlightStore = data
  }

  let preferredCategories = []
  const purchasedStoreIds = new Set()

  if (userId) {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { data: signals } = await admin
      .from('user_behavior_signals')
      .select('category, store_id, signal_type')
      .eq('user_id', userId)
      .gte('created_at', since)

    for (const s of signals ?? []) {
      if (s.category) preferredCategories.push(s.category)
      if (s.store_id && s.signal_type === 'store_visit') purchasedStoreIds.add(s.store_id)
    }

    const { data: orders } = await admin
      .from('orders')
      .select('seller_id, listing_id')
      .eq('buyer_id', userId)
      .eq('status', 'paid')
      .limit(50)

    for (const o of orders ?? []) {
      if (o.seller_id) purchasedStoreIds.add(o.seller_id)
      if (o.listing_id) {
        const { data: l } = await admin.from('listings').select('category').eq('id', o.listing_id).maybeSingle()
        if (l?.category) preferredCategories.push(l.category)
      }
    }
  }

  preferredCategories = [...new Set(preferredCategories)]

  let query = admin
    .from('search_index_stores')
    .select('*')
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(50)

  const { data: allStores } = await query

  const scored = (allStores ?? []).map((s) => {
    let score = Number(s.rating) || 0
    const cats = Array.isArray(s.categories) ? s.categories : []
    if (preferredCategories.some((c) => cats.includes(c))) score += 20
    if (purchasedStoreIds.has(s.store_id)) score += 15
    if (s.featured_store) score += 10
    if (spotlightStore && s.store_id === spotlightStore.store_id) score += 25
    return { ...s, _discovery_score: score }
  }).sort((a, b) => b._discovery_score - a._discovery_score)

  const seen = new Set()
  const results = []
  const push = (store) => {
    if (!store || seen.has(store.store_id)) return
    seen.add(store.store_id)
    results.push(store)
  }

  if (spotlightStore) push(spotlightStore)
  for (const f of featured ?? []) push(f)
  for (const s of scored) {
    push(s)
    if (results.length >= limit) break
  }

  return {
    ok: true,
    stores: results.slice(0, limit),
    spotlight_store: spotlightStore,
    featured_stores: featured ?? [],
  }
}

module.exports = { discoverStores }
