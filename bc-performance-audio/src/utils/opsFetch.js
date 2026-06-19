import { getStoredOpsPhrase } from '~/utils/opsClientAuth.js'

/** Authenticated owner API fetch — sends unlock phrase as x-ops-key header. */
export async function opsFetch (url, options = {}) {
  const opsKey = getStoredOpsPhrase()
  const headers = {
    ...(options.headers || {}),
    ...(opsKey ? { 'x-ops-key': opsKey } : {}),
  }
  return $fetch(url, { ...options, headers })
}
