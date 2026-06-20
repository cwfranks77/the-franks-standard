import { createClient } from '@supabase/supabase-js'
import { backendRequire as require } from '#cjs-require'
const { getOrSet, DEFAULT_TTLS } = require('#backend/cache/cache.js')
const { prepareHandlerContext } = require('#backend/performance/response_optimizer.js')

function adminClient () {
  const url = process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''
  return createClient(url, key, { auth: { persistSession: false } })
}

function storePayload (store: {
  id: string
  store_name: string | null
  store_slug: string | null
  featured_store: boolean | null
}) {
  const slug = store.store_slug ?? ''
  return {
    store_id: store.id,
    store_name: store.store_name,
    store_slug: slug,
    featured: !!store.featured_store,
    store_url: slug ? `/store/${slug}` : null,
  }
}

export default defineEventHandler(async (event) => {
  prepareHandlerContext(event, { cdnMaxAge: DEFAULT_TTLS.spotlight })

  const admin = adminClient()
  const query = getQuery(event)
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `spotlight:${today}`

  if (query.refresh === '1') {
    const { data: candidates } = await admin
      .from('profiles')
      .select('id')
      .eq('active_store', true)
      .not('store_slug', 'is', null)
      .neq('store_slug', '')

    const pool = (candidates ?? []).map((c) => c.id)
    if (pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      await admin.from('daily_spotlight').upsert(
        { store_id: pick, spotlight_date: today, date: today },
        { onConflict: 'spotlight_date' },
      )
    }
  }

  const { value, hit } = await getOrSet(cacheKey, DEFAULT_TTLS.spotlight, async () => {
    const { data: row } = await admin
      .from('daily_spotlight')
      .select('spotlight_date, date, store_id')
      .eq('spotlight_date', today)
      .maybeSingle()

    if (!row?.store_id) {
      return { spotlight: null, message: 'No spotlight store selected for today.' }
    }

    const { data: store } = await admin
      .from('profiles')
      .select('id, store_name, store_slug, featured_store')
      .eq('id', row.store_id)
      .maybeSingle()

    if (!store) {
      return { spotlight: null, message: 'Spotlight store not found.' }
    }

    return {
      spotlight_date: row.spotlight_date || row.date,
      store: storePayload(store),
    }
  })

  return { ...value, _cache: { hit } }
})
