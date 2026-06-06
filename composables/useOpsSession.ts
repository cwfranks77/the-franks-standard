const STORAGE_KEY = 'tfs_ops_session_v1'

export function useOpsSession () {
  const isAuthed = useState('ops-authed', () => false)

  if (import.meta.client) {
    let authed = localStorage.getItem(STORAGE_KEY) === '1'
    // Migrate legacy sessionStorage unlock so existing tabs keep access.
    if (!authed && sessionStorage.getItem(STORAGE_KEY) === '1') {
      localStorage.setItem(STORAGE_KEY, '1')
      sessionStorage.removeItem(STORAGE_KEY)
      authed = true
    }
    isAuthed.value = authed
  }

  function grant () {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, '1')
      sessionStorage.removeItem(STORAGE_KEY)
      isAuthed.value = true
    }
  }

  async function revoke () {
    if (import.meta.client) {
      try {
        await $fetch('/api/ops/session', { method: 'DELETE' })
      } catch { /* cookie may already be gone */ }
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      isAuthed.value = false
    }
  }

  return { isAuthed, grant, revoke }
}
