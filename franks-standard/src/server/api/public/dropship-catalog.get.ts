import { fetchDropshipStore } from '../../utils/ownerCms'

export default defineEventHandler(async (event) => {
  const storeId = String(getQuery(event).storeId || 'bc-performance-audio')
  const data = await fetchDropshipStore(storeId)
  if (!data.store?.is_live && data.store?.is_live !== undefined) {
    return { ...data, items: [], offline: true }
  }
  setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  return data
})
