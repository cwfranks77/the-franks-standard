import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { normalizeOpsPhrase } from '../../utils/opsPhrase'

export const OPS_COOKIE = 'tfs_ops_session'

export function hashOpsPhrase (phrase: string): string {
  return createHash('sha256').update(normalizeOpsPhrase(phrase)).digest('hex')
}

export function verifyOpsPhrase (phrase: string, expectedHash: string): boolean {
  if (!expectedHash) return false
  return hashOpsPhrase(phrase) === expectedHash.toLowerCase()
}

export function signOpsSessionToken (secret: string): string {
  return createHmac('sha256', secret).update('tfs-ops-session-v1').digest('hex')
}

export function verifyOpsSessionToken (token: string | undefined, secret: string): boolean {
  if (!token || !secret) return false
  try {
    const expected = signOpsSessionToken(secret)
    const a = Buffer.from(token)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function opsSessionSecret (config: ReturnType<typeof useRuntimeConfig>): string {
  return String(config.opsSessionSecret || config.public.opsAccessKeyHash || '')
}

export function isOpsAuthed (event: H3Event): boolean {
  const config = useRuntimeConfig()
  const secret = opsSessionSecret(config)
  return verifyOpsSessionToken(getCookie(event, OPS_COOKIE), secret)
}

export function requireOpsAuth (event: H3Event) {
  if (!isOpsAuthed(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Operator authentication required' })
  }
}
