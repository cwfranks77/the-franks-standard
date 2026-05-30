/**
 * Mandatory seller policy digital signature — required before any selling (direct, store, dropship, import).
 */

import {
  SELLER_POLICY_DOCUMENTS,
  SELLER_POLICY_VERSION,
  SELLER_DIGITAL_AGREEMENT_INTRO,
  SELLER_DIGITAL_AGREEMENT_CLOSING,
} from '~/utils/sellerPolicyBundle.js'

const POLICY_INVOKE_TIMEOUT_MS = 25_000

async function parseSellerPolicyFnError (fnErr: unknown, data: unknown): Promise<string> {
  if (data && typeof data === 'object' && data !== null && 'error' in data) {
    const d = data as { error?: string; message?: string; detail?: string }
    return String(d.message || d.detail || d.error || 'Could not record your signature.')
  }
  const err = fnErr as { context?: Response; message?: string }
  if (err?.context && typeof err.context.json === 'function') {
    try {
      const body = await err.context.json()
      if (body?.message) return String(body.message)
      if (body?.error) return String(body.error)
      if (body?.detail) return String(body.detail)
    } catch { /* ignore */ }
  }
  const msg = err?.message || ''
  if (msg && !/non-2xx/i.test(msg)) return msg
  return 'Could not record your signature. Check your connection and try again.'
}

function shouldFallbackToProfileUpdate (message: string): boolean {
  return /timed out|timeout|fetch|network|failed to fetch|edge function|non-2xx|502|503|504|not found|deploy/i.test(message)
}

async function invokeWithTimeout<T> (promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Recording timed out. Check your connection and tap Try again.')), ms)
    }),
  ])
}

export function useSellerPolicyAcceptance () {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  /** Shared across SellerPolicyAgreement + sell/import pages (separate ref() broke unlock). */
  const accepted = useState('seller-policy-accepted', () => false)
  const signerName = useState('seller-policy-signer', () => '')
  const acceptedAt = useState('seller-policy-accepted-at', () => '')
  const loading = useState('seller-policy-loading', () => true)
  const submitting = useState('seller-policy-submitting', () => false)
  const error = useState('seller-policy-error', () => '')
  const authedSellerId = useState<string | null>('seller-policy-auth-uid', () => null)

  watch(
    user,
    (u) => {
      if (u?.id) authedSellerId.value = u.id
    },
    { immediate: true },
  )

  function applyProfileAcceptance (profile: {
    seller_policies_accepted_at?: string | null
    seller_policies_version?: string | null
    seller_policies_signer_name?: string | null
  } | null) {
    accepted.value = !!(
      profile?.seller_policies_accepted_at &&
      profile?.seller_policies_version === SELLER_POLICY_VERSION
    )
    signerName.value = profile?.seller_policies_signer_name || ''
    acceptedAt.value = profile?.seller_policies_accepted_at || ''
  }

  async function loadStatus () {
    loading.value = true
    error.value = ''
    submitting.value = false
    const wasAccepted = accepted.value
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        accepted.value = false
        authedSellerId.value = null
        return
      }
      authedSellerId.value = authUser.id
      const { data, error: qErr } = await supabase
        .from('profiles')
        .select('seller_policies_accepted_at, seller_policies_version, seller_policies_signer_name')
        .eq('id', authUser.id)
        .maybeSingle()
      if (qErr) {
        error.value = qErr.message
        if (!wasAccepted) accepted.value = false
        return
      }
      applyProfileAcceptance(data)
      if (wasAccepted && !accepted.value) accepted.value = true
    } finally {
      loading.value = false
    }
  }

  async function recordAcceptanceOnProfile (userId: string, legalName: string) {
    const now = new Date().toISOString()
    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        seller_policies_accepted_at: now,
        seller_policies_version: SELLER_POLICY_VERSION,
        seller_policies_signer_name: legalName,
      })
      .eq('id', userId)
    if (updErr) throw new Error(updErr.message)
    return { accepted_at: now, signer_name: legalName }
  }

  async function submitAcceptance (legalName: string, documentIds: string[]) {
    submitting.value = true
    error.value = ''
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        error.value = 'Sign in to accept seller policies.'
        return false
      }
      authedSellerId.value = authUser.id

      let signer = legalName
      let acceptedAtIso = new Date().toISOString()

      try {
        const invokeResult = await invokeWithTimeout(
          supabase.functions.invoke('accept-seller-policies', {
            body: {
              legal_name: legalName,
              policy_version: SELLER_POLICY_VERSION,
              documents: documentIds,
            },
          }),
          POLICY_INVOKE_TIMEOUT_MS,
        )
        const { data, error: fnErr } = invokeResult

        if (fnErr) {
          throw new Error(await parseSellerPolicyFnError(fnErr, data))
        }
        if (data?.error) {
          throw new Error(String(data.message || data.error))
        }
        signer = data?.signer_name || legalName
        acceptedAtIso = data?.accepted_at || acceptedAtIso
      } catch (invokeErr) {
        const msg = invokeErr instanceof Error ? invokeErr.message : String(invokeErr)
        if (!shouldFallbackToProfileUpdate(msg)) throw invokeErr
        const fallback = await recordAcceptanceOnProfile(authUser.id, legalName)
        signer = fallback.signer_name
        acceptedAtIso = fallback.accepted_at
      }

      accepted.value = true
      signerName.value = signer
      acceptedAt.value = acceptedAtIso
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      return false
    } finally {
      submitting.value = false
    }
  }

  const needsAcceptance = computed(() => {
    const uid = user.value?.id ?? authedSellerId.value
    return !!uid && !loading.value && !accepted.value
  })

  return {
    SELLER_POLICY_VERSION,
    SELLER_POLICY_DOCUMENTS,
    SELLER_DIGITAL_AGREEMENT_INTRO,
    SELLER_DIGITAL_AGREEMENT_CLOSING,
    accepted,
    signerName,
    acceptedAt,
    loading,
    submitting,
    error,
    needsAcceptance,
    loadStatus,
    submitAcceptance,
  }
}
