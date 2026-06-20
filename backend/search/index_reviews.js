/**
 * Index seller, buyer, and platform reviews.
 */

const { buildSearchText } = require('./_utils.js')

async function indexReviews (admin, { limit = 300 } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const rows = []

  const { data: sellerReviews } = await admin
    .from('seller_reviews')
    .select('id, reviewer_id, seller_id, rating, text, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  for (const r of sellerReviews ?? []) {
    rows.push({
      review_id: r.id,
      review_type: 'seller',
      text: String(r.text || '').slice(0, 4000),
      rating: r.rating,
      reviewer_id: r.reviewer_id,
      target_id: r.seller_id,
      search_text: buildSearchText([r.text]),
      indexed_at: new Date().toISOString(),
    })
  }

  const { data: buyerReviews } = await admin
    .from('buyer_reviews')
    .select('id, reviewer_id, buyer_id, rating, text, created_at')
    .order('created_at', { ascending: false })
    .limit(Math.floor(limit / 2))

  for (const r of buyerReviews ?? []) {
    rows.push({
      review_id: r.id,
      review_type: 'buyer',
      text: String(r.text || '').slice(0, 4000),
      rating: r.rating,
      reviewer_id: r.reviewer_id,
      target_id: r.buyer_id,
      search_text: buildSearchText([r.text]),
      indexed_at: new Date().toISOString(),
    })
  }

  const { data: platformReviews } = await admin
    .from('platform_reviews')
    .select('id, reviewer_id, rating, text, created_at')
    .order('created_at', { ascending: false })
    .limit(Math.floor(limit / 4))

  for (const r of platformReviews ?? []) {
    rows.push({
      review_id: r.id,
      review_type: 'platform',
      text: String(r.text || '').slice(0, 4000),
      rating: r.rating,
      reviewer_id: r.reviewer_id,
      target_id: r.reviewer_id,
      search_text: buildSearchText([r.text]),
      indexed_at: new Date().toISOString(),
    })
  }

  if (!rows.length) return { ok: true, indexed: 0 }

  const { error } = await admin.from('search_index_reviews').upsert(rows, { onConflict: 'review_id' })
  if (error) return { ok: false, error: error.message }

  return { ok: true, indexed: rows.length }
}

module.exports = { indexReviews }
