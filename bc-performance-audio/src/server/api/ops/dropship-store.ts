import { fetchSiteContentMap, upsertSiteMarketingContent } from '#bc-server-utils/ownerCms'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

const STORE_KEY = 'bcDropshipStore'

function defaultStore (storeId: string) {
  return {
    id: storeId,
    slug: storeId,
    name: 'B&C Performance Audio',
    tagline: '',
    accent: '#d32f2f',
    is_live: true,
    hero_json: { eyebrow: '', slogan: '' },
    items: [],
  }
}

export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const query = getQuery(event)
  const storeId = String(query.storeId || 'bc-performance-audio').trim()

  if (event.method === 'GET') {
    try {
      const map = await fetchSiteContentMap([STORE_KEY])
      const saved = map[STORE_KEY] as Record<string, unknown> | undefined
      const stores = (saved?.stores as Record<string, unknown>) || {}
      const store = stores[storeId] || defaultStore(storeId)
      return { store, source: 'supabase' }
    } catch (e: any) {
      return { store: defaultStore(storeId), source: 'defaults', message: e?.message }
    }
  }

  if (event.method === 'PUT' || event.method === 'POST') {
    const body = await readBody(event)
    const store = body?.store
    if (!store || typeof store !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'store object required' })
    }
    try {
      const map = await fetchSiteContentMap([STORE_KEY])
      const saved = (map[STORE_KEY] as Record<string, unknown>) || { stores: {} }
      const stores = { ...(saved.stores as Record<string, unknown> || {}), [storeId]: store }
      await upsertSiteMarketingContent(STORE_KEY, { ...saved, stores })
      return { success: true, store }
    } catch (e: any) {
      throw createError({ statusCode: 500, statusMessage: e?.message || 'Save failed' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
