// scripts/securityHardening.ts
// TFS Security Hardening Script – backend only, idempotent

import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import xss from 'xss'
import type { Express, Request, Response, NextFunction } from 'express'
import { createRequire } from 'node:module'
import type { H3Event } from 'h3'

const require = createRequire(import.meta.url)
const hardening = require('../backend/security/security_hardening.js')
const { checkRateLimit } = require('../backend/security/rate_limit.js')

// ---------- 1. Security headers (Helmet) — Express apps only ----------

export function applySecurityHeaders (app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'self'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  )
}

// ---------- 2. Global rate limiting — Express apps only ----------

export function applyGlobalRateLimit (app: Express) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.use(limiter)
}

// ---------- 3. Sensitive route rate limiting — Express apps only ----------

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// app.post('/api/auth/login', authLimiter, loginHandler)

// ---------- 4. Input sanitization (xss package) ----------

export function sanitizeString (input: unknown): string {
  if (typeof input !== 'string') return ''
  return xss(input.trim())
}

export function sanitizeObject<T extends Record<string, unknown>> (obj: T): T {
  const clean: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (typeof value === 'string') {
      clean[key] = sanitizeString(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      clean[key] = value
    }
  }
  return clean as T
}

export function sanitizeRequest (
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, unknown>) as typeof req.query
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params as Record<string, unknown>) as typeof req.params
  }
  next()
}

// ---------- 5. Auth/session guard middleware — Express apps only ----------

export function requireAuth (
  req: Request & { user?: { id?: string } },
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

export function requireOwnerOrAdmin (
  req: Request & { user?: { id?: string, roles?: string[] } },
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const roles = req.user.roles || []
  if (!roles.includes('owner') && !roles.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}

// ---------- 6. Abuse protection for critical routes — Express apps only ----------

export function protectCriticalRoute (
  req: Request & { user?: { id?: string, is_banned?: boolean } },
  res: Response,
  next: NextFunction,
) {
  if (!req.user || req.user.is_banned) {
    return res.status(403).json({ error: 'Access denied' })
  }
  next()
}

// ---------- 7. Attach everything to an Express app ----------

export function applyTfsSecurity (app: Express) {
  applySecurityHeaders(app)
  applyGlobalRateLimit(app)
  app.use(sanitizeRequest)
}

// ---------- Nuxt/Nitro (live site) — no Express app.use() ----------

export const {
  SECURITY_HEADERS,
  GLOBAL_RATE,
  AUTH_RATE,
  isAuthPath,
  isCriticalPath,
  requireAuthContext,
  requireOwnerOrAdminContext,
  protectCriticalRouteContext,
  getSecurityHardeningStatus,
} = hardening

export function applySecurityHeadersNitro (event: H3Event) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS as Record<string, string>)) {
    setResponseHeader(event, key, value)
  }
}

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

export function sanitizeRequestBody<T extends Record<string, unknown>> (body: T): T {
  return sanitizeObject(body)
}

export function getTfsSecurityStatus () {
  return getSecurityHardeningStatus()
}
