import { normalizeOpsPhrase } from '~/utils/opsPhrase'

export const OPS_PHRASE_STORAGE_KEY = 'tfs_ops_phrase_v1'

async function sha256HexUtf8 (message) {
  const data = new TextEncoder().encode(message)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyOpsPhraseBrowser (phrase, expectedHash) {
  const hash = String(expectedHash || '').trim().toLowerCase()
  if (!hash) return false
  const typed = await sha256HexUtf8(normalizeOpsPhrase(phrase))
  return typed === hash
}

export function storeOpsPhraseForSession (phrase) {
  if (!import.meta.client) return
  const normalized = normalizeOpsPhrase(phrase)
  sessionStorage.setItem(OPS_PHRASE_STORAGE_KEY, normalized)
  localStorage.setItem(OPS_PHRASE_STORAGE_KEY, normalized)
}

export function setStoredOpsPhrase (phrase) {
  storeOpsPhraseForSession(phrase)
}

export function clearStoredOpsPhrase () {
  if (!import.meta.client) return
  sessionStorage.removeItem(OPS_PHRASE_STORAGE_KEY)
  localStorage.removeItem(OPS_PHRASE_STORAGE_KEY)
}

export function getStoredOpsPhrase () {
  if (!import.meta.client) return ''
  return (
    sessionStorage.getItem(OPS_PHRASE_STORAGE_KEY)
    || localStorage.getItem(OPS_PHRASE_STORAGE_KEY)
    || ''
  )
}

export function isOpsApiUnavailable (error) {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status
  if (status === 404 || status === 405) return true
  const msg = String(error?.message || error || '').toLowerCase()
  return msg.includes('not found') || msg.includes('owner api not available')
}
