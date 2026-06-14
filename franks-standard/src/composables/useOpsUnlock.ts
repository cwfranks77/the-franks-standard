import { normalizeOpsPhrase } from '~/utils/opsPhrase'
import {
  storeOpsPhraseForSession,
  verifyOpsPhraseBrowser,
} from '~/utils/opsClientAuth'

/** Owner unlock — browser hash on static GitHub Pages; server cookie in dev. */
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
      const raw = String(phrase.value || '').trim()
      const expectedHash = String(config.public?.opsAccessKeyHash || '').trim().toLowerCase()

      async function unlockSuccess () {
        grant()
        storeOpsPhraseForSession(normalizeOpsPhrase(raw))
        phrase.value = ''
        return true
      }

      if (await verifyOpsPhraseBrowser(raw, expectedHash)) {
        return await unlockSuccess()
      }

      if (import.meta.dev) {
        try {
          await $fetch('/api/ops/session', {
            method: 'POST',
            body: { phrase: normalizeOpsPhrase(raw) },
          })
          return await unlockSuccess()
        } catch (e: unknown) {
          const err = e as { data?: { statusMessage?: string }; message?: string }
          error.value = err?.data?.statusMessage || err?.message ||
            'That phrase does not match your owner password.'
          return false
        }
      }

      error.value = 'That phrase does not match your owner password. Type it exactly — capitals do not matter.'
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
