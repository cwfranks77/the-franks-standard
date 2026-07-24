import {
  getStoredOpsPhrase,
  storeOpsPhraseForSession,
  clearStoredOpsPhrase,
  verifyOpsPhraseBrowser,
} from '~/utils/opsClientAuth.js'
import { normalizeOpsPhrase } from '~/utils/opsPhrase.js'

/**
 * B&C owner session — logo ×5 unlock on the storefront.
 * Verify first, then store the phrase (never wipe a good session on a typo).
 */
export function useOpsSession () {
  const config = useRuntimeConfig()
  const authed = useState<boolean>('bc-ops-authed', () => false)

  function restoreSessionIfPossible () {
    if (!import.meta.client || authed.value) return
    // Sync restore so route middleware does not bounce while hash verify is in flight.
    if (getStoredOpsPhrase()) authed.value = true
  }

  if (import.meta.client) {
    restoreSessionIfPossible()
  }

  async function syncAuthed () {
    if (!import.meta.client) return false
    const expected = String(config.public.opsAccessKeyHash || '').trim().toLowerCase()
    const phrase = getStoredOpsPhrase()
    if (!expected || !phrase) {
      authed.value = false
      return false
    }
    const ok = await verifyOpsPhraseBrowser(phrase, expected)
    authed.value = ok
    return ok
  }

  async function unlock (phrase: string) {
    const expected = String(config.public.opsAccessKeyHash || '').trim().toLowerCase()
    const raw = String(phrase || '')
    if (!expected) {
      authed.value = false
      return false
    }
    const ok = await verifyOpsPhraseBrowser(raw, expected)
    if (!ok) return false
    // Store only after a successful match — wrong attempts must not clear a good phrase.
    storeOpsPhraseForSession(normalizeOpsPhrase(raw))
    authed.value = true
    return true
  }

  /** Restore in-memory auth when the phrase is already in storage (middleware / refresh). */
  function grant () {
    if (!import.meta.client) return
    restoreSessionIfPossible()
    void syncAuthed()
  }

  async function revoke () {
    clearStoredOpsPhrase()
    authed.value = false
  }

  return {
    isAuthed: authed,
    unlock,
    grant,
    revoke,
    syncAuthed,
    restoreSessionIfPossible,
  }
}
