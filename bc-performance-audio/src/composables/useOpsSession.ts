import { getStoredOpsPhrase, setStoredOpsPhrase, clearStoredOpsPhrase } from '~/utils/opsClientAuth.js'

function normalizeOpsPhrase (phrase: string) {
  return String(phrase || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

async function hashOpsPhrase (phrase: string) {
  const data = new TextEncoder().encode(normalizeOpsPhrase(phrase))
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const authed = ref(false)

async function syncAuthed () {
  if (!import.meta.client) return false
  const config = useRuntimeConfig()
  const expected = String(config.public.opsAccessKeyHash || '').trim().toLowerCase()
  const phrase = getStoredOpsPhrase()
  if (!expected || !phrase) {
    authed.value = false
    return false
  }
  const actual = await hashOpsPhrase(phrase)
  const ok = actual === expected
  authed.value = ok
  return ok
}

export function useOpsSession () {
  if (import.meta.client) {
    syncAuthed()
  }

  async function unlock (phrase: string) {
    setStoredOpsPhrase(phrase)
    return syncAuthed()
  }

  async function revoke () {
    clearStoredOpsPhrase()
    authed.value = false
  }

  return {
    isAuthed: authed,
    unlock,
    revoke,
    syncAuthed,
  }
}
