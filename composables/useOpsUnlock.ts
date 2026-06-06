import { normalizeOpsPhrase } from '~/utils/opsPhrase'
import {
  isOpsApiUnavailable,
  storeOpsPhraseForSession,
  verifyOpsPhraseBrowser,
} from '~/utils/opsClientAuth'

/** Owner unlock — server cookie in dev; browser hash + Supabase edge on static GitHub Pages. */
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
    const normalized = normalizeOpsPhrase(phrase.value)
    try {
      await $fetch('/api/ops/session', {
        method: 'POST',
        body: { phrase: normalized },
      })
      grant()
      storeOpsPhraseForSession(normalized)
      phrase.value = ''
      return true
    } catch (e: unknown) {
      if (isOpsApiUnavailable(e)) {
        const ok = await verifyOpsPhraseBrowser(
          normalized,
          String(config.public?.opsAccessKeyHash || ''),
        )
        if (ok) {
          grant()
          storeOpsPhraseForSession(normalized)
          phrase.value = ''
          return true
        }
        error.value = 'That phrase does not match. Use the exact value from NUXT_PUBLIC_OPS_ACCESS_KEY.'
        return false
      }
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
