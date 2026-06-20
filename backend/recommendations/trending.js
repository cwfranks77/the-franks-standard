/**
 * Trending engine — 72-hour window with weighted signals.
 */

const TRENDING_HOURS = 72

const WEIGHTS = {
  view: 1,
  save: 3,
  purchase: 10,
  message: 4,
  coa_upload: 6,
  dispute_free: 2,
}

async function computeTrendingScores (admin, { limit = 20, windowHours = TRENDING_HOURS } = {}) {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()
  const scores = new Map()

  const bump = (listingId, points, factor) => {
    if (!listingId) return
    const row = scores.get(listingId) || { score: 0, factors: {} }
    row.score += points
    row.factors[factor] = (row.factors[factor] || 0) + 1
    scores.set(listingId, row)
  }

  const { data: behavior } = await admin
    .from('user_behavior_signals')
    .select('listing_id, signal_type')
    .gte('created_at', since)
    .not('listing_id', 'is', null)

  for (const b of behavior ?? []) {
    if (b.signal_type === 'view') bump(b.listing_id, WEIGHTS.view, 'views')
    if (b.signal_type === 'save') bump(b.listing_id, WEIGHTS.save, 'saves')
    if (b.signal_type === 'purchase') bump(b.listing_id, WEIGHTS.purchase, 'purchases')
  }

  const { data: activity } = await admin
    .from('platform_activity_events')
    .select('metadata, event_type, action_category')
    .gte('created_at', since)
    .in('action_category', ['browse', 'transaction', 'message', 'listing'])

  for (const a of activity ?? []) {
    const lid = a.metadata?.listing_id
    if (!lid) continue
    if (a.event_type === 'purchase' || a.action_category === 'transaction') bump(lid, WEIGHTS.purchase, 'purchases')
    else if (a.event_type === 'message_sent') bump(lid, WEIGHTS.message, 'messages')
    else bump(lid, WEIGHTS.view, 'views')
  }

  const { data: coaLinks } = await admin
    .from('coa_files')
    .select('listing_id')
    .gte('created_at', since)
    .not('listing_id', 'is', null)

  for (const c of coaLinks ?? []) bump(c.listing_id, WEIGHTS.coa_upload, 'coa_uploads')

  const { data: disputedListings } = await admin
    .from('dispute_cases')
    .select('order_id')
    .gte('created_at', since)
    .neq('status', 'resolved')

  const disputedOrderIds = new Set((disputedListings ?? []).map((d) => d.order_id))
  if (disputedOrderIds.size) {
    const { data: orders } = await admin.from('orders').select('listing_id').in('id', [...disputedOrderIds])
    const disputedListingIds = new Set((orders ?? []).map((o) => o.listing_id))
    for (const [lid, row] of scores) {
      if (!disputedListingIds.has(lid)) {
        row.score += WEIGHTS.dispute_free
        row.factors.dispute_free = 1
      }
    }
  } else {
    for (const [, row] of scores) {
      row.score += WEIGHTS.dispute_free
      row.factors.dispute_free = 1
    }
  }

  const upsertRows = [...scores.entries()].map(([listing_id, v]) => ({
    listing_id,
    score: Math.round(v.score * 10000) / 10000,
    window_hours: windowHours,
    factors: v.factors,
    updated_at: new Date().toISOString(),
  }))

  if (upsertRows.length) {
    await admin.from('listing_trending_scores').upsert(upsertRows, { onConflict: 'listing_id' })
  }

  const topIds = upsertRows.sort((a, b) => b.score - a.score).slice(0, limit).map((r) => r.listing_id)
  let items = []
  if (topIds.length) {
    const { data: listings } = await admin
      .from('search_index_listings')
      .select('*')
      .in('listing_id', topIds)
    const byId = new Map((listings ?? []).map((l) => [l.listing_id, l]))
    items = topIds.map((id) => ({ ...byId.get(id), trending_score: scores.get(id)?.score }))
  }

  return { ok: true, window_hours: windowHours, items, scores_updated: upsertRows.length }
}

async function recommendTrending (admin, { limit = 12 } = {}) {
  const { data: cached } = await admin
    .from('listing_trending_scores')
    .select('listing_id, score, factors')
    .order('score', { ascending: false })
    .limit(limit)

  if ((cached ?? []).length >= limit) {
    const ids = cached.map((c) => c.listing_id)
    const { data: listings } = await admin.from('search_index_listings').select('*').in('listing_id', ids)
    const byId = new Map((listings ?? []).map((l) => [l.listing_id, l]))
    return {
      ok: true,
      trending_items: ids.map((id) => ({
        ...byId.get(id),
        trending_score: cached.find((c) => c.listing_id === id)?.score,
      })),
    }
  }

  const computed = await computeTrendingScores(admin, { limit })
  return { ok: true, trending_items: computed.items }
}

module.exports = { computeTrendingScores, recommendTrending, TRENDING_HOURS, WEIGHTS }
