import { fetchSiteContentMap } from '#bc-server-utils/ownerCms'

/** Public read-only site content for static deploy + storefront. */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raw = String(query.keys || '').trim()
  const keys = raw ? raw.split(',').map((k) => k.trim()).filter(Boolean) : []
  if (!keys.length) {
    throw createError({ statusCode: 400, statusMessage: 'keys query required' })
  }
  try {
    return await fetchSiteContentMap(keys)
  } catch {
    return {}
  }
})
