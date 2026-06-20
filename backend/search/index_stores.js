/**
 * Index marketplace stores (profiles with active seller storefront).
 */

const { buildSearchText } = require('./_utils.js')

async function indexStores (admin, { limit = 200 } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const { data: stores, error } = await admin
    .from('profiles')
    .select('id, store_name, store_slug, featured_store, active_store')
    .not('store_slug', 'is', null)
    .neq('store_slug', '')
    .eq('active_store', true)
    .limit(limit)

  if (error) return { ok: false, error: error.message }

  const rows = []
  for (const s of stores ?? []) {
    const { data: cats } = await admin
      .from('listings')
      .select('category')
      .eq('seller_id', s.id)
      .eq('status', 'published')
      .limit(50)

    const categories = [...new Set((cats ?? []).map((c) => c.category).filter(Boolean))]

    const { data: reviews } = await admin
      .from('seller_reviews')
      .select('rating')
      .eq('seller_id', s.id)
      .limit(200)

    const ratings = (reviews ?? []).map((r) => Number(r.rating)).filter(Number.isFinite)
    const rating = ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
      : null

    const description = `Store ${s.store_name || ''} — ${categories.join(', ')}`.trim()
    rows.push({
      store_id: s.id,
      store_name: String(s.store_name || '').slice(0, 300),
      description: description.slice(0, 2000),
      categories,
      rating,
      featured_store: !!s.featured_store,
      search_text: buildSearchText([s.store_name, s.store_slug, ...categories]),
      indexed_at: new Date().toISOString(),
    })
  }

  if (!rows.length) return { ok: true, indexed: 0 }

  const { error: upsertErr } = await admin.from('search_index_stores').upsert(rows, { onConflict: 'store_id' })
  if (upsertErr) return { ok: false, error: upsertErr.message }

  return { ok: true, indexed: rows.length }
}

module.exports = { indexStores }
