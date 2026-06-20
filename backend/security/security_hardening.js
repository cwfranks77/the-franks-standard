/**
 * TFS Security Hardening — backend-only, idempotent.
 * Used by Nitro server middleware (not Express).
 */

const HTML_ESCAPE = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

function escapeHtml (str) {
  return String(str).replace(/[&<>"'/]/g, (c) => HTML_ESCAPE[c] || c)
}

/** Helmet-equivalent response headers for Nitro setResponseHeaders */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
  ].join('; '),
}

/** Global: 300 requests / 15 min per IP */
const GLOBAL_RATE = { max: 300, windowMs: 15 * 60 * 1000 }

/** Auth-sensitive routes: 20 / 10 min */
const AUTH_RATE = { max: 20, windowMs: 10 * 60 * 1000 }

const AUTH_PATH_PREFIXES = [
  '/api/auth',
  '/api/login',
  '/api/register',
  '/api/password',
  '/api/signup',
]

const CRITICAL_PATH_PREFIXES = [
  '/api/owner',
  '/api/reports',
  '/api/admin',
  '/api/payouts',
  '/api/checkout',
]

function sanitizeString (input) {
  if (typeof input !== 'string') return ''
  let s = input.trim()
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  s = s.replace(/javascript:/gi, '')
  s = s.replace(/on\w+\s*=/gi, '')
  return escapeHtml(s)
}

function sanitizeObject (obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map((v) => (typeof v === 'string' ? sanitizeString(v) : sanitizeObject(v)))

  const clean = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (typeof value === 'string') {
      clean[key] = sanitizeString(value)
    } else if (value && typeof value === 'object') {
      clean[key] = sanitizeObject(value)
    } else {
      clean[key] = value
    }
  }
  return clean
}

function isAuthPath (path) {
  const p = String(path || '').split('?')[0]
  return AUTH_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

function isCriticalPath (path) {
  const p = String(path || '').split('?')[0]
  return CRITICAL_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

/** Owner ops key or owner user id — pairs with owner_only.js */
function requireAuthContext ({ userId = null } = {}) {
  if (!userId) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }
  return { ok: true, userId }
}

function requireOwnerOrAdminContext ({ opsKeyValid = false, userId = null, roles = [] } = {}) {
  if (opsKeyValid) return { ok: true, method: 'ops_key' }
  if (!userId) return { ok: false, status: 401, error: 'Unauthorized' }
  const list = Array.isArray(roles) ? roles : []
  if (list.includes('owner') || list.includes('admin')) {
    return { ok: true, method: 'role' }
  }
  return { ok: false, status: 403, error: 'Forbidden' }
}

function protectCriticalRouteContext ({ userId = null, isBanned = false, opsKeyValid = false } = {}) {
  if (opsKeyValid) return { ok: true }
  if (!userId || isBanned) {
    return { ok: false, status: 403, error: 'Access denied' }
  }
  return { ok: true }
}

function getSecurityHardeningStatus () {
  return {
    headers: Object.keys(SECURITY_HEADERS),
    global_rate: GLOBAL_RATE,
    auth_rate: AUTH_RATE,
    auth_paths: AUTH_PATH_PREFIXES,
    critical_paths: CRITICAL_PATH_PREFIXES,
    sanitization: true,
  }
}

module.exports = {
  SECURITY_HEADERS,
  GLOBAL_RATE,
  AUTH_RATE,
  AUTH_PATH_PREFIXES,
  CRITICAL_PATH_PREFIXES,
  sanitizeString,
  sanitizeObject,
  isAuthPath,
  isCriticalPath,
  requireAuthContext,
  requireOwnerOrAdminContext,
  protectCriticalRouteContext,
  getSecurityHardeningStatus,
}
