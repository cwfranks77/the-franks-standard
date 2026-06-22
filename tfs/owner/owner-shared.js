/**
 * TFS owner tools — shared ops-key session (sessionStorage only, never logged).
 */
const STORAGE_KEY = 'tfs_owner_ops_key'

export function getOwnerKey () {
  return sessionStorage.getItem(STORAGE_KEY) || ''
}

export function setOwnerKey (key) {
  sessionStorage.setItem(STORAGE_KEY, String(key || '').trim())
}

export function clearOwnerKey () {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function requireOwnerKey () {
  const key = getOwnerKey()
  if (!key) {
    window.location.href = '/tfs/owner/index.html'
    return null
  }
  return key
}

/** Client-side audit hook — server writes authoritative log entries. */
export function logClientAction (action, path) {
  if (typeof console !== 'undefined' && console.debug) {
    console.debug(`[TFS File Manager] ${action}: ${path}`)
  }
}

export async function tfsOwnerFetch (url, options = {}) {
  const key = requireOwnerKey()
  if (!key) throw new Error('Not authenticated')

  const headers = new Headers(options.headers || {})
  headers.set('x-ops-key', key)

  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    clearOwnerKey()
    window.location.href = '/tfs/owner/index.html'
    throw new Error('Unauthorized')
  }
  return res
}

export function formatBytes (n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
