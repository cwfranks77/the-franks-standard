import { normalizeOpsPhrase } from '~/utils/opsPhrase.js'

const STORAGE_KEY = 'bc-ops-phrase-v1'

async function sha256HexUtf8 (message) {
  const data = new TextEncoder().encode(message)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Browser-side phrase check — same normalize + SHA-256 rules as the server hash. */
export async function verifyOpsPhraseBrowser (phrase, expectedHash) {
  const hash = String(expectedHash || '').trim().toLowerCase()
  if (!hash) return false
  const typed = await sha256HexUtf8(normalizeOpsPhrase(phrase))
  return typed === hash
}

export function storeOpsPhraseForSession (phrase) {
  if (!import.meta.client) return
  const normalized = normalizeOpsPhrase(phrase)
  // Session for this tab; local so refresh / new tab still has the phrase for owner tools.
  try {
    sessionStorage.setItem(STORAGE_KEY, normalized)
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    // ignore quota / private mode
  }
}

export function setStoredOpsPhrase (phrase) {
  storeOpsPhraseForSession(phrase)
}

export function clearStoredOpsPhrase () {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getStoredOpsPhrase () {
  if (!import.meta.client) return ''
  try {
    return String(
      sessionStorage.getItem(STORAGE_KEY)
      || localStorage.getItem(STORAGE_KEY)
      || '',
    ).trim()
  } catch {
    return ''
  }
}
