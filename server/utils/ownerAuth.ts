import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

function normalizeOpsPhrase (phrase: string): string {
  return String(phrase || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function hashOpsPhrase (phrase: string): string {
  return createHash('sha256').update(normalizeOpsPhrase(phrase)).digest('hex')
}

/** Owner-only guard for reporting and ops API routes. */
export function requireOwnerAuth (event: H3Event): void {
  const config = useRuntimeConfig(event)
  const expected = String(config.opsAccessKeyHash || '').trim().toLowerCase()
  if (!expected) {
    throw createError({ statusCode: 503, statusMessage: 'Owner access is not configured on this deploy.' })
  }

  const headerKey = getHeader(event, 'x-ops-key')
    || getHeader(event, 'x-ops-access-key')
    || ''

  const candidate = String(headerKey || '').trim()
  if (!candidate || hashOpsPhrase(candidate) !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized — owner authentication required.' })
  }
}
