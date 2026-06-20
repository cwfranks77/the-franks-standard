import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { getOrSet, DEFAULT_TTLS } = require('../../backend/cache/cache.js')
const { prepareHandlerContext } = require('../../backend/performance/response_optimizer.js')

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
  prepareHandlerContext(event, { cdnMaxAge: DEFAULT_TTLS.featured })

  const admin = adminClient()
  const { value, hit } = await getOrSet('featured:current', DEFAULT_TTLS.featured, async () => {
    const { data: store } = await admin
      .from('profiles')
      .select('id, store_name, store_slug, featured_store')
      .eq('featured_store', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!store) return { featured: false, store: null }
    return { featured: true, store: storePayload(store) }
  })

  return { ...value, _cache: { hit } }
})
