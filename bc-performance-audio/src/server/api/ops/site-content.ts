import { fetchSiteContentMap, upsertSiteMarketingContent } from '#bc-server-utils/ownerCms'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

/** Owner read/write for site_marketing_content (homepage, SEO, theme, etc.). */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)

  if (event.method === 'GET') {
    const query = getQuery(event)
    const raw = String(query.keys || '').trim()
    const keys = raw ? raw.split(',').map((k) => k.trim()).filter(Boolean) : []
    if (!keys.length) {
      throw createError({ statusCode: 400, statusMessage: 'keys query required' })
    }
    try {
      const map = await fetchSiteContentMap(keys)
      return map
    } catch (e: any) {
      throw createError({ statusCode: 500, statusMessage: e?.message || 'Could not read site content' })
    }
  }

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const contentKey = String(body?.contentKey || '').trim()
    const payload = body?.payload
    if (!contentKey || payload == null || typeof payload !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'contentKey and payload object required' })
    }
    try {
      await upsertSiteMarketingContent(contentKey, payload as Record<string, unknown>)
      return { success: true, contentKey }
    } catch (e: any) {
      throw createError({ statusCode: 500, statusMessage: e?.message || 'Could not save site content' })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
