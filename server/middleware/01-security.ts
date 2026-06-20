import { createRequire } from 'node:module'
import { requireOwnerAuth } from '../utils/ownerAuth'
import { getServiceSupabase } from '../utils/serviceSupabase'

const require = createRequire(import.meta.url)
const { checkRateLimit, checkRateLimitForPath } = require('../../backend/security/rate_limit.js')
const { checkOwnerAccess, isOwnerRoute } = require('../../backend/security/owner_only.js')
const { scoreIp } = require('../../backend/security/ip_risk.js')

function clientIp (event: Parameters<typeof getRequestURL>[0]) {
  return getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getHeader(event, 'x-real-ip')
    || 'unknown'
}

function opsKeyValid (event: Parameters<typeof getRequestURL>[0]) {
  try {
    requireOwnerAuth(event)
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (isOwnerRoute(path)) {
    const allowed = checkOwnerAccess({
      path,
      opsKeyValid: opsKeyValid(event),
      userId: getHeader(event, 'x-user-id') || null,
    })
    if (!allowed.allowed) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden — owner access only.' })
    }
  }

  if (!path.startsWith('/api/')) return

  const ip = clientIp(event)
  const sb = getServiceSupabase()

  const pathLimit = await checkRateLimitForPath(sb, path, ip, { ipAddress: ip, metadata: { path } })
  if (!pathLimit.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please wait and try again.' })
  }

  const apiLimit = await checkRateLimit(sb, {
    category: 'api',
    key: ip,
    ipAddress: ip,
    metadata: { path },
  })

  if (!apiLimit.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please wait and try again.' })
  }

  if (sb && ip && ip !== 'unknown') {
    await scoreIp(sb, ip).catch(() => {})
  }
})
