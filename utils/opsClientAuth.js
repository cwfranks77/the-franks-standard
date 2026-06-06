import { normalizeOpsPhrase } from '~/utils/opsPhrase'
import { sha256HexUtf8 } from '~/utils/sha256Browser.js'

export const OPS_PHRASE_STORAGE_KEY = 'tfs_ops_phrase_v1'

export async function hashOpsPhraseBrowser (input) {
  const normalized = normalizeOpsPhrase(input)
  if (import.meta.client && globalThis.crypto?.subtle && globalThis.isSecureContext) {
    const bytes = new TextEncoder().encode(normalized)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  return sha256HexUtf8(normalized)
}

export async function verifyOpsPhraseBrowser (phrase, expectedHash) {
  const hash = String(expectedHash || '').trim().toLowerCase()
  if (!hash) return false
  const typed = await hashOpsPhraseBrowser(phrase)
  return typed === hash
}

export function isOpsApiUnavailable (error) {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status
  if (status === 405 || status === 404 || status === 502 || status === 503) return true
  const msg = String(error?.message || '')
  return /method not allowed|fetch failed|network/i.test(msg)
}

export function storeOpsPhraseForSession (phrase) {
  if (!import.meta.client) return
  sessionStorage.setItem(OPS_PHRASE_STORAGE_KEY, normalizeOpsPhrase(phrase))
}

export function getStoredOpsPhrase () {
  if (!import.meta.client) return ''
  return sessionStorage.getItem(OPS_PHRASE_STORAGE_KEY) || ''
}

export function clearStoredOpsPhrase () {
  if (!import.meta.client) return
  sessionStorage.removeItem(OPS_PHRASE_STORAGE_KEY)
}
