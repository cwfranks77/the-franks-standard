/**
 * Auth session storage: default = session only (no auto-login after browser close).
 * "Keep me signed in" on login stores preference in localStorage (tfs_remember_me = 1).
 */

export const REMEMBER_ME_KEY = 'tfs_remember_me'

export function getRememberMe () {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(REMEMBER_ME_KEY) === '1'
}

export function setRememberMe (value) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REMEMBER_ME_KEY, value ? '1' : '0')
}

/** Move token between localStorage and sessionStorage when preference changes. */
export function migrateAuthTokenToPreferredStorage (supabaseUrl) {
  if (typeof window === 'undefined') return
  const key = getAuthStorageKey(supabaseUrl)
  const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
  if (!raw) return
  activeStorage().setItem(key, raw)
  if (getRememberMe()) {
    sessionStorage.removeItem(key)
  } else {
    localStorage.removeItem(key)
  }
}

/** Supabase JS auth token key for this project */
export function getAuthStorageKey (supabaseUrl) {
  const ref = String(supabaseUrl || '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (!ref) return 'sb-auth-token'
  return `sb-${ref}-auth-token`
}

function activeStorage () {
  return getRememberMe() ? localStorage : sessionStorage
}

/** Custom storage adapter for Supabase auth (nuxt.config clientOptions). */
export function createAuthStorageAdapter () {
  return {
    getItem (key) {
      if (typeof window === 'undefined') return null
      return activeStorage().getItem(key)
    },
    setItem (key, value) {
      if (typeof window === 'undefined') return
      activeStorage().setItem(key, value)
      if (getRememberMe()) {
        sessionStorage.removeItem(key)
      } else {
        localStorage.removeItem(key)
      }
    },
    removeItem (key) {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    },
  }
}

export function clearAllAuthStorage (supabaseUrl) {
  if (typeof window === 'undefined') return
  const key = getAuthStorageKey(supabaseUrl)
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
  for (const store of [localStorage, sessionStorage]) {
    for (let i = store.length - 1; i >= 0; i--) {
      const k = store.key(i)
      if (k && k.startsWith('sb-') && k.includes('auth-token')) {
        store.removeItem(k)
      }
    }
  }
}

