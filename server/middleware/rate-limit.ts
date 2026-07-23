/**
 * Rate Limiting Middleware
 * Protects sensitive endpoints from brute force and DDoS
 */

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getClientId(event: any): string {
  return getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
}

function checkRateLimit(clientId: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(clientId)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function requireRateLimit(limit: number, windowMs: number = 60000) {
  return defineEventHandler((event) => {
    const clientId = getClientId(event)
    const allowed = checkRateLimit(clientId, limit, windowMs)

    if (!allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
      })
    }
  })
}
