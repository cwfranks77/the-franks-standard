/**
 * Owner-only route guard for sensitive backend paths.
 */

const OWNER_ROUTE_PREFIXES = [
  '/owner',
  '/api/reports',
  '/api/admin',
  '/api/fraud',
  '/api/security',
]

function getOwnerUserId () {
  return String(
    process.env.OWNER_USER_ID
    || process.env.NUXT_OWNER_USER_ID
    || '',
  ).trim()
}

function isOwnerRoute (path) {
  const p = String(path || '').split('?')[0]
  return OWNER_ROUTE_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

function checkOwnerAccess ({ path, opsKeyValid = false, userId = null }) {
  if (!isOwnerRoute(path)) return { allowed: true }

  if (opsKeyValid) return { allowed: true, method: 'ops_key' }

  const ownerId = getOwnerUserId()
  if (ownerId && userId && userId === ownerId) {
    return { allowed: true, method: 'owner_user_id' }
  }

  return { allowed: false, error: 'owner_only' }
}

module.exports = {
  checkOwnerAccess,
  isOwnerRoute,
  getOwnerUserId,
  OWNER_ROUTE_PREFIXES,
}
