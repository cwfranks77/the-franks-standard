/**
 * Mandatory seller policy digital signature — required before any selling (direct, store, dropship, import).
 */

import {
  SELLER_POLICY_DOCUMENTS,
  SELLER_POLICY_VERSION,
  SELLER_DIGITAL_AGREEMENT_INTRO,
  SELLER_DIGITAL_AGREEMENT_CLOSING,
} from '~/utils/sellerPolicyBundle.js'

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
        accepted.value = false
        return
      }
      applyProfileAcceptance(data)
    } finally {
      loading.value = false
    }
  }

  function documentsPayload (documentIds: string[]) {
    const out: Record<string, boolean> = {}
    for (const id of documentIds) out[id] = true
    return out
  }

  async function recordAcceptanceViaRpc (legalName: string, documentIds: string[]) {
    const { data, error: rpcErr } = await supabase.rpc('record_seller_policy_acceptance', {
      p_legal_name: legalName,
      p_policy_version: SELLER_POLICY_VERSION,
      p_documents: documentsPayload(documentIds),
    })
    if (rpcErr) throw new Error(rpcErr.message)
    const row = data as {
      ok?: boolean
      error?: string
      message?: string
      accepted_at?: string
      signer_name?: string
    } | null
    if (row?.error) {
      throw new Error(String(row.message || row.error))
    }
    if (!row?.ok) {
      throw new Error('Could not record your signature. Refresh and try again.')
    }
    return {
      accepted_at: row.accepted_at || new Date().toISOString(),
      signer_name: row.signer_name || legalName,
    }
  }

  async function recordAcceptanceOnProfile (userId: string, legalName: string) {
    const now = new Date().toISOString()
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    if (!existing) {
      const { error: insErr } = await supabase.from('profiles').insert({
        id: userId,
        full_name: legalName,
        account_type: 'seller',
      })
      if (insErr) throw new Error(insErr.message)
    }
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

      // Critical path: security-definer RPC (same as production DB function migration 032).
      let primary: { accepted_at: string; signer_name: string }
      try {
        primary = await recordAcceptanceViaRpc(legalName, documentIds)
      } catch (rpcErr) {
        const rpcMsg = rpcErr instanceof Error ? rpcErr.message : String(rpcErr)
        const rpcMissing = /Could not find the function|PGRST202|42883|function.*does not exist/i.test(rpcMsg)
        if (!rpcMissing) throw rpcErr
        // Fallback only when RPC is not deployed — direct profile update under JWT.
        primary = await recordAcceptanceOnProfile(authUser.id, legalName)
        recordAcceptanceViaRpc(legalName, documentIds).catch(() => {})
      }

      accepted.value = true
      signerName.value = primary.signer_name
      acceptedAt.value = primary.accepted_at
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg.includes('500')
        ? `Server error saving your signature (${msg}). Try again in a minute or email info@thefranksstandard.com.`
        : msg
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
