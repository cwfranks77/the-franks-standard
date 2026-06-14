import { requireOpsAuth } from '../../utils/opsAuth'
import { fetchDropshipStoreForOps, saveDropshipStore } from '../../utils/ownerCms'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const storeId = String(getQuery(event).storeId || 'bc-performance-audio')

  if (method === 'GET') {
    requireOpsAuth(event)
    return fetchDropshipStoreForOps(storeId)
  }
  if (method === 'PUT') {
    requireOpsAuth(event)
    const body = await readBody(event)
    await saveDropshipStore(body?.store || {}, body?.items || [])
    return fetchDropshipStoreForOps(storeId)
  }
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
