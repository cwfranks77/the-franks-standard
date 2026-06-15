import {
  clearStoredOpsPhrase,
  storeOpsPhraseForSession,
  verifyOpsPhraseBrowser
} from '~/utils/opsClientAuth'

export function useOwnerAccess() {
  const config = useRuntimeConfig()
  const unlocked = useState<boolean>('owner-unlocked', () => false)
  const error = useState<string>('owner-unlock-error', () => '')

  const keyConfigured = computed(
    () => String(config.public.opsAccessKeyHash || '').length > 0
  )

  async function tryUnlock(phrase: string) {
    error.value = ''
    if (!keyConfigured.value) {
      error.value = 'Operator phrase is not configured on this build. Set NUXT_PUBLIC_OPS_ACCESS_KEY in GitHub Secrets or a local .env file, then rebuild.'
      return false
    }
    const ok = await verifyOpsPhraseBrowser(
      phrase,
      String(config.public.opsAccessKeyHash || '')
    )
    if (ok) {
      unlocked.value = true
      storeOpsPhraseForSession(phrase)
      return true
    }
    error.value = 'That phrase does not match. Type it exactly — capitals do not matter.'
    return false
  }

  function lock() {
    unlocked.value = false
    clearStoredOpsPhrase()
  }

  return { unlocked, error, keyConfigured, tryUnlock, lock }
}
