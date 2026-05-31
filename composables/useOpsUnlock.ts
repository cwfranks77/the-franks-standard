import { normalizeOpsPhrase } from '~/utils/opsPhrase'

async function sha256Hex (input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Owner unlock phrase check (matches value in NUXT_PUBLIC_OPS_ACCESS_KEY at build time). */
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
    const expectedHash = String(config.public?.opsAccessKeyHash || '').toLowerCase()
    if (!expectedHash) {
      error.value = 'Operator key is not configured on this build. Add NUXT_PUBLIC_OPS_ACCESS_KEY in GitHub Actions and redeploy.'
      return false
    }
    submitting.value = true
    try {
      const typedHash = await sha256Hex(normalizeOpsPhrase(phrase.value))
      if (typedHash === expectedHash) {
        grant()
        phrase.value = ''
        return true
      }
      error.value =
        'That phrase does not match this build. Use the exact value from NUXT_PUBLIC_OPS_ACCESS_KEY (check .env and GitHub Actions secret). Special characters like # must match exactly.'
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
