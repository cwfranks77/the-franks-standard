import { runOwnerTool, tools } from '../_toolRoute'

export default defineEventHandler(async (event) => {
  const listingId = String(getRouterParam(event, 'listingId') || '')
  return runOwnerTool(event, ({ sb, actorId }) => tools.lookupListing(sb, listingId, { actorId }))
})
