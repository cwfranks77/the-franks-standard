import { normalizeOpsPhrase } from '~/utils/opsPhrase'
import { storeOpsPhraseForSession } from '~/utils/opsClientAuth'
import { verifyOpsPhrase } from '~/utils/verifyOpsPhrase'

/** Owner unlock — phrase checked on server only (never embed hash in static HTML). */
export function useOpsUnlock () {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { grant } = useOpsSession()

  const phrase = ref('')
  const error = ref('')
  const submitting = ref(false)

  const keyConfigured = computed(
    () => Boolean(config.public?.opsUnlockAvailable),
  )

  async function submit (): Promise<boolean> {
    error.value = ''
    if (!keyConfigured.value) {
      error.value = 'Operator unlock is not configured on this build. Set owner secrets and redeploy.'
      return false
    }
    submitting.value = true
    try {
      const raw = String(phrase.value || '').trim()
      if (!(await verifyOpsPhrase(raw))) {
        error.value = 'That phrase does not match. Type it exactly — spaces become dashes, capitals do not matter.'
        return false
      }
      // Store phrase first — listing tools read it from sessionStorage.
      storeOpsPhraseForSession(normalizeOpsPhrase(raw))
      grant()
      phrase.value = ''
      return true
    } finally {
      submitting.value = false
    }
  }

  async function submitAndGoPanel () {
    const ok = await submit()
    if (ok) await router.push('/ops/panel')
  }

  return {
    phrase,
    error,
    submitting,
    keyConfigured,
    submit,
    submitAndGoPanel,
  }
}
