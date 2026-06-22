import { requireTfsOwnerAuth } from '#tfs-owner-api/lib/auth'

/** Owner-only middleware for all TFS file manager API routes. */
export default defineEventHandler((event) => {
  const path = event.path || ''
  if (!path.startsWith('/tfs/api/owner/')) return
  requireTfsOwnerAuth(event)
})
