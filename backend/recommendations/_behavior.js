/**
 * Record user behavior signals for recommendations.
 */

async function recordBehavior (admin, {
  userId,
  signalType,
  listingId = null,
  storeId = null,
  category = null,
  price = null,
  metadata = {},
}) {
  if (!admin || !userId || !signalType) return { ok: false, error: 'missing_fields' }

  await admin.from('user_behavior_signals').insert({
    user_id: userId,
    signal_type: signalType,
    listing_id: listingId,
    store_id: storeId,
    category,
    price,
    metadata,
  })

  return { ok: true }
}

async function loadUserSignals (admin, userId, { limit = 200 } = {}) {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await admin
    .from('user_behavior_signals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Also pull from platform activity when behavior table is sparse
  const { data: activity } = await admin
    .from('platform_activity_events')
    .select('event_type, action_category, metadata, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { signals: data ?? [], activity: activity ?? [] }
}

function extractPreferences (signals, activity) {
  const categories = new Map()
  const priceSamples = []
  const listingIds = new Set()
  const storeIds = new Set()
  const purchased = new Set()
  const saved = new Set()
  const viewed = new Set()

  for (const s of signals) {
    if (s.category) categories.set(s.category, (categories.get(s.category) || 0) + 1)
    if (s.price != null) priceSamples.push(Number(s.price))
    if (s.listing_id) listingIds.add(s.listing_id)
    if (s.store_id) storeIds.add(s.store_id)
    if (s.signal_type === 'purchase') purchased.add(s.listing_id)
    if (s.signal_type === 'save') saved.add(s.listing_id)
    if (s.signal_type === 'view') viewed.add(s.listing_id)
    if (s.signal_type === 'store_visit') storeIds.add(s.store_id)
  }

  for (const a of activity) {
    const lid = a.metadata?.listing_id
    const cat = a.metadata?.category
    if (cat) categories.set(cat, (categories.get(cat) || 0) + 1)
    if (lid) {
      listingIds.add(lid)
      if (a.event_type === 'purchase' || a.action_category === 'transaction') purchased.add(lid)
      if (a.event_type === 'listing_view' || a.action_category === 'browse') viewed.add(lid)
    }
    if (a.metadata?.store_id) storeIds.add(a.metadata.store_id)
  }

  const avgPrice = priceSamples.length
    ? priceSamples.reduce((a, b) => a + b, 0) / priceSamples.length
    : null

  return {
    topCategories: [...categories.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 5),
    avgPrice,
    priceMin: avgPrice ? avgPrice * 0.6 : null,
    priceMax: avgPrice ? avgPrice * 1.4 : null,
    listingIds: [...listingIds],
    storeIds: [...storeIds],
    purchased: [...purchased],
    saved: [...saved],
    viewed: [...viewed],
  }
}

module.exports = { recordBehavior, loadUserSignals, extractPreferences }
