/**
 * Similar items by category, price band, brand, and seller.
 */

async function recommendSimilarItems (admin, { listingId, limit = 8 }) {
  if (!listingId) return { ok: false, error: 'listing_id_required' }

  const { data: source } = await admin
    .from('search_index_listings')
    .select('*')
    .eq('listing_id', listingId)
    .maybeSingle()

  if (!source) {
    const { data: listing } = await admin
      .from('listings')
      .select('id, category, brand, price, seller_id, title, description, condition, tags')
      .eq('id', listingId)
      .maybeSingle()
    if (!listing) return { ok: false, error: 'listing_not_found' }
    Object.assign(source || {}, {
      listing_id: listing.id,
      category: listing.category,
      brand: listing.brand,
      price: listing.price,
      seller_id: listing.seller_id,
    })
  }

  const price = Number(source.price) || 0
  const minP = price > 0 ? price * 0.7 : 0
  const maxP = price > 0 ? price * 1.3 : 999999

  let query = admin
    .from('search_index_listings')
    .select('*')
    .neq('listing_id', listingId)
    .limit(100)

  if (source.category) query = query.eq('category', source.category)
  if (price > 0) query = query.gte('price', minP).lte('price', maxP)

  const { data: candidates } = await query

  const similar = (candidates ?? [])
    .map((l) => {
      let score = 0
      if (l.category === source.category) score += 40
      if (l.brand && l.brand === source.brand) score += 25
      if (l.condition === source.condition) score += 10
      if (l.seller_id === source.seller_id) score += 5
      if (price && l.price != null) score += Math.max(0, 25 - Math.abs(Number(l.price) - price))
      return { ...l, _similarity: score }
    })
    .sort((a, b) => b._similarity - a._similarity)
    .slice(0, limit)

  return { ok: true, listing_id: listingId, similar_items: similar }
}

module.exports = { recommendSimilarItems }
