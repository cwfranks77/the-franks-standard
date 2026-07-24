/**
 * Lightweight API rate limit (sliding window) for owner/ops and API routes.
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const WINDOW_MS = 60_000
const LIMIT = 120

function getClientId (event: any): string {
  return getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname || ''
  if (!path.startsWith('/api/') && !path.startsWith('/ops/') && !path.startsWith('/owner')) {
    return
  }

  const clientId = `${getClientId(event)}:${path.split('/').slice(0, 4).join('/')}`
  const now = Date.now()
  const record = rateLimitStore.get(clientId)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + WINDOW_MS })
    return
  }

  if (record.count >= LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    })
  }

  record.count++
})
