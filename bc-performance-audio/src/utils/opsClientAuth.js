const STORAGE_KEY = 'bc-ops-phrase-v1'

export function getStoredOpsPhrase () {
  if (!import.meta.client) return ''
  try {
    return String(sessionStorage.getItem(STORAGE_KEY) || '').trim()
  } catch {
    return ''
  }
}

export function setStoredOpsPhrase (phrase) {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(STORAGE_KEY, String(phrase || '').trim())
  } catch {
    // ignore
  }
}

export function clearStoredOpsPhrase () {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
