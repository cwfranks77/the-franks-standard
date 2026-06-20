/**
 * Index published listings for search.
 */

const { buildSearchText, parseTags } = require('./_utils.js')

async function indexListings (admin, { limit = 500, listingIds = null } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  let q = admin
    .from('listings')
    .select('id, title, description, category, brand, condition, price, seller_id, tags, status, created_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (listingIds?.length) q = q.in('id', listingIds)

  const { data: listings, error } = await q
  if (error) return { ok: false, error: error.message }

  const sellerIds = [...new Set((listings ?? []).map((l) => l.seller_id).filter(Boolean))]
  const ratings = {}

  if (sellerIds.length) {
    const { data: reviews } = await admin
      .from('seller_reviews')
      .select('seller_id, rating')
      .in('seller_id', sellerIds)
    for (const sid of sellerIds) {
      const rs = (reviews ?? []).filter((r) => r.seller_id === sid).map((r) => Number(r.rating))
      ratings[sid] = rs.length ? Math.round((rs.reduce((a, b) => a + b, 0) / rs.length) * 100) / 100 : null
    }
  }

  const rows = (listings ?? []).map((l) => {
    const tags = parseTags(l.tags)
    const brand = l.brand || l.category || ''
    const searchText = buildSearchText([l.title, l.description, l.category, brand, conditionLabel(l.condition), ...tags])
    return {
      listing_id: l.id,
      title: String(l.title || '').slice(0, 500),
      description: String(l.description || '').slice(0, 4000),
      category: l.category || null,
      brand: brand || null,
      condition: l.condition || null,
      price: l.price != null ? Number(l.price) : null,
      seller_id: l.seller_id,
      tags,
      search_text: searchText,
      rating_avg: ratings[l.seller_id] ?? null,
      indexed_at: new Date().toISOString(),
    }
  })

  if (!rows.length) return { ok: true, indexed: 0 }

  const { error: upsertErr } = await admin.from('search_index_listings').upsert(rows, { onConflict: 'listing_id' })
  if (upsertErr) return { ok: false, error: upsertErr.message }

  return { ok: true, indexed: rows.length }
}

function conditionLabel (c) {
  return String(c || '').replace(/_/g, ' ')
}

module.exports = { indexListings }
