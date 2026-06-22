import type { H3Event } from 'h3'

const DESTRUCTIVE_LIMIT = 20
const WINDOW_MS = 60 * 1000
const buckets = new Map<string, number[]>()

function clientKey (event: H3Event): string {
  return String(
    getHeader(event, 'x-forwarded-for')
    || event.node?.req?.socket?.remoteAddress
    || 'local',
  ).split(',')[0].trim()
}

/** Rate-limit delete/rename — in-memory per deploy instance. */
export function assertDestructiveAllowed (event: H3Event, action: 'delete' | 'rename'): void {
  const key = `${action}:${clientKey(event)}`
  const now = Date.now()
  let times = buckets.get(key) || []
  times = times.filter((t) => now - t < WINDOW_MS)
  if (times.length >= DESTRUCTIVE_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: `Too many ${action} requests — try again in a minute.`,
    })
  }
  times.push(now)
  buckets.set(key, times)
}
