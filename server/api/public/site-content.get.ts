import { fetchSiteMarketing } from '../../utils/ownerCms'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keys = query.keys ? String(query.keys).split(',').map((k) => k.trim()) : undefined
  setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  return fetchSiteMarketing(keys)
})
