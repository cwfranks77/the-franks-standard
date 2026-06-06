import { normalizeOpsPhrase } from '~/utils/opsPhrase'

/** Owner unlock — verifies phrase on server and sets the ops session cookie for API saves. */
export function useOpsUnlock () {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { grant } = useOpsSession()

  const phrase = ref('')
  const error = ref('')
  const submitting = ref(false)

  const keyConfigured = computed(
    () => String(config.public?.opsAccessKeyHash || '').length > 0,
  )

  async function submit (): Promise<boolean> {
    error.value = ''
    if (!keyConfigured.value) {
      error.value = 'Operator key is not configured on this build. Add NUXT_PUBLIC_OPS_ACCESS_KEY in GitHub Actions and redeploy.'
      return false
    }
    submitting.value = true
    try {
      await $fetch('/api/ops/session', {
        method: 'POST',
        body: { phrase: normalizeOpsPhrase(phrase.value) },
      })
      grant()
      phrase.value = ''
      return true
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; message?: string }
      error.value = err?.data?.statusMessage || err?.message ||
        'That phrase does not match. Use the exact value from NUXT_PUBLIC_OPS_ACCESS_KEY.'
      return false
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
