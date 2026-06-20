/**
 * TFS Security Hardening — Nuxt/Nitro edition (backend only, idempotent).
 *
 * This project does NOT use Express. Security is applied via:
 *   - server/middleware/00-security-headers.ts  (Helmet-equivalent headers)
 *   - server/middleware/01-security.ts          (rate limits, sanitization, guards)
 *   - backend/security/security_hardening.js    (shared logic)
 *
 * Express-style app.use() from the original sketch is intentionally not used.
 */

import { createRequire } from 'node:module'
import type { H3Event } from 'h3'

const require = createRequire(import.meta.url)

const hardening = require('../backend/security/security_hardening.js')
const { checkRateLimit } = require('../backend/security/rate_limit.js')

export const {
  SECURITY_HEADERS,
  GLOBAL_RATE,
  AUTH_RATE,
  sanitizeString,
  sanitizeObject,
  isAuthPath,
  isCriticalPath,
  requireAuthContext,
  requireOwnerOrAdminContext,
  protectCriticalRouteContext,
  getSecurityHardeningStatus,
} = hardening

/** Apply security headers on a Nitro/H3 event (called from middleware). */
export function applySecurityHeaders (event: H3Event) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS as Record<string, string>)) {
    setResponseHeader(event, key, value)
  }
}

/** Check global IP rate limit — returns true if allowed. */
export async function checkGlobalRateLimit (
  admin: ReturnType<typeof import('../server/utils/serviceSupabase').getServiceSupabase>,
  ip: string,
  path: string,
) {
  const result = await checkRateLimit(admin, {
    category: 'global',
    key: ip,
    ipAddress: ip,
    metadata: { path },
  })
  return result.allowed
}

/** Check auth-route rate limit — returns true if allowed. */
export async function checkAuthRateLimit (
  admin: ReturnType<typeof import('../server/utils/serviceSupabase').getServiceSupabase>,
  ip: string,
  path: string,
) {
  const result = await checkRateLimit(admin, {
    category: 'auth',
    key: ip,
    ipAddress: ip,
    metadata: { path },
  })
  return result.allowed
}

/** Sanitize JSON body on event after readBody in a route handler. */
export function sanitizeRequestBody<T extends Record<string, unknown>> (body: T): T {
  return sanitizeObject(body) as T
}

/** Full hardening status for owner diagnostics. */
export function getTfsSecurityStatus () {
  return getSecurityHardeningStatus()
}
