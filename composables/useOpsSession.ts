const STORAGE_KEY = 'tfs_ops_session_v1'

export function useOpsSession () {
  const isAuthed = useState('ops-authed', () => false)
  if (import.meta.client) {
    isAuthed.value = sessionStorage.getItem(STORAGE_KEY) === '1'
  }

  function grant () {
    if (import.meta.client) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      isAuthed.value = true
    }
  }

  function revoke () {
    if (import.meta.client) {
      sessionStorage.removeItem(STORAGE_KEY)
      isAuthed.value = false
    }
  }

  return { isAuthed, grant, revoke }
}