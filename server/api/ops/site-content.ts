import { requireOpsAuth } from '../../utils/opsAuth'
import { fetchSiteMarketing, saveSiteMarketing } from '../../utils/ownerCms'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method === 'GET') {
    requireOpsAuth(event)
    const query = getQuery(event)
    const keys = query.keys ? String(query.keys).split(',').map((k) => k.trim()) : undefined
    return fetchSiteMarketing(keys)
  }
  if (method === 'PUT') {
    requireOpsAuth(event)
    const body = await readBody(event)
    const contentKey = String(body?.contentKey || '')
    const payload = body?.payload
    if (!contentKey || !payload || typeof payload !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'contentKey and payload required' })
    }
    await saveSiteMarketing(contentKey, payload)
    return { ok: true, contentKey }
  }
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
