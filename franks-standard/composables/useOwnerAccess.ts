import {
  clearStoredOpsPhrase,
  getStoredOpsPhrase,
  storeOpsPhraseForSession,
} from '~/utils/opsClientAuth'
import { verifyOpsPhrase } from '~/utils/verifyOpsPhrase'
import { appendLocalActivity } from '~/utils/platformActivity'

export function useOwnerAccess () {
  const config = useRuntimeConfig()
  const unlocked = useState<boolean>('owner-unlocked', () => false)
  const error = useState<string>('owner-unlock-error', () => '')

  const keyConfigured = computed(
    () => Boolean(config.public.opsUnlockAvailable),
  )

  function restoreSessionIfPossible () {
    if (!import.meta.client || unlocked.value) return
    if (getStoredOpsPhrase()) unlocked.value = true
  }

  if (import.meta.client) {
    onMounted(restoreSessionIfPossible)
  }

  async function tryUnlock (phrase: string) {
    error.value = ''
    if (!keyConfigured.value) {
      error.value = 'Operator phrase is not configured on this build. Set owner secrets, then rebuild.'
      return false
    }
    const ok = await verifyOpsPhrase(phrase)
    if (ok) {
      unlocked.value = true
      storeOpsPhraseForSession(phrase)
      appendLocalActivity({
        user_id: 'operator',
        user_display_name: 'Operator',
        ip_address: 'browser-session',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        action: 'Operator console unlocked',
        action_category: 'owner',
        metadata: {},
      })
      return true
    }
    error.value = 'That phrase does not match. Type it exactly — spaces become dashes, capitals do not matter.'
    return false
  }

  function lock () {
    unlocked.value = false
    clearStoredOpsPhrase()
  }

  return { unlocked, error, keyConfigured, tryUnlock, lock }
}
