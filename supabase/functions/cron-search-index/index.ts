import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
    || req.headers.get('x-cron-secret')
    || ''
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
  const mode = String((body as { mode?: string }).mode ?? 'listings')

  const results: Record<string, unknown> = { ok: true, mode }

  if (mode === 'listings' || mode === 'all') {
    const { data: listings } = await admin.from('listings').select(
      'id, title, description, category, brand, condition, price, seller_id, tags, status',
    ).eq('status', 'published').order('updated_at', { ascending: false }).limit(500)

    const rows = (listings ?? []).map((l) => ({
      listing_id: l.id,
      title: String(l.title || '').slice(0, 500),
      description: String(l.description || '').slice(0, 4000),
      category: l.category,
      brand: l.brand || l.category,
      condition: l.condition,
      price: l.price,
      seller_id: l.seller_id,
      tags: Array.isArray(l.tags) ? l.tags : [],
      search_text: [l.title, l.description, l.category, l.brand].filter(Boolean).join(' ').toLowerCase(),
      indexed_at: new Date().toISOString(),
    }))
    if (rows.length) await admin.from('search_index_listings').upsert(rows, { onConflict: 'listing_id' })
    results.listings_indexed = rows.length
  }

  if (mode === 'stores' || mode === 'all') {
    const { data: stores } = await admin.from('profiles').select('id, store_name, store_slug, featured_store')
      .not('store_slug', 'is', null).neq('store_slug', '').eq('active_store', true).limit(200)
    const storeRows = []
    for (const s of stores ?? []) {
      const { data: cats } = await admin.from('listings').select('category').eq('seller_id', s.id).eq('status', 'published').limit(30)
      const categories = [...new Set((cats ?? []).map((c) => c.category).filter(Boolean))]
      storeRows.push({
        store_id: s.id,
        store_name: s.store_name || '',
        description: categories.join(', '),
        categories,
        featured_store: !!s.featured_store,
        search_text: [s.store_name, s.store_slug, ...categories].filter(Boolean).join(' ').toLowerCase(),
        indexed_at: new Date().toISOString(),
      })
    }
    if (storeRows.length) await admin.from('search_index_stores').upsert(storeRows, { onConflict: 'store_id' })
    results.stores_indexed = storeRows.length
  }

  return json(results)
})
