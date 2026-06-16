import {
  clearStoredOpsPhrase,
  storeOpsPhraseForSession,
} from '~/utils/opsClientAuth'
import { verifyOpsPhraseRemote } from '~/utils/opsRemoteUnlock'

export function useOwnerAccess () {
  const config = useRuntimeConfig()
  const unlocked = useState<boolean>('owner-unlocked', () => false)
  const error = useState<string>('owner-unlock-error', () => '')

  const keyConfigured = computed(
    () => Boolean(config.public.opsUnlockAvailable),
  )

  async function tryUnlock (phrase: string) {
    error.value = ''
    if (!keyConfigured.value) {
      error.value = 'Operator phrase is not configured on this build. Set owner secrets, then rebuild.'
      return false
    }
    const ok = await verifyOpsPhraseRemote(phrase)
    if (ok) {
      unlocked.value = true
      storeOpsPhraseForSession(phrase)
      return true
    }
    error.value = 'That phrase does not match. Type it exactly — capitals do not matter.'
    return false
  }

  function lock () {
    unlocked.value = false
    clearStoredOpsPhrase()
  }

  return { unlocked, error, keyConfigured, tryUnlock, lock }
}
