import {
  BUYER_POLICY_DOCUMENTS,
  BUYER_POLICY_VERSION,
  buyerAgreementTextForHash,
} from '~/utils/buyerPolicyBundle.js'
import { sha256HexUtf8 } from '~/utils/sha256Browser.js'

export function useBuyerPolicyAcceptance () {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const accepted = useState('buyer-policy-accepted', () => false)
  const signerName = useState('buyer-policy-signer', () => '')
  const acceptedAt = useState('buyer-policy-accepted-at', () => '')
  const loading = useState('buyer-policy-loading', () => true)
  const submitting = useState('buyer-policy-submitting', () => false)
  const error = useState('buyer-policy-error', () => '')

  function applyProfileAcceptance (profile: {
    buyer_policies_accepted_at?: string | null
    buyer_policies_version?: string | null
    buyer_policies_signer_name?: string | null
  } | null) {
    accepted.value = !!(
      profile?.buyer_policies_accepted_at &&
      profile?.buyer_policies_version === BUYER_POLICY_VERSION
    )
    signerName.value = profile?.buyer_policies_signer_name || ''
    acceptedAt.value = profile?.buyer_policies_accepted_at || ''
  }

  async function loadStatus () {
    loading.value = true
    error.value = ''
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        accepted.value = false
        return
      }
      const { data, error: qErr } = await supabase
        .from('profiles')
        .select('buyer_policies_accepted_at, buyer_policies_version, buyer_policies_signer_name')
        .eq('id', authUser.id)
        .maybeSingle()
      if (qErr) {
        error.value = qErr.message
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

  async function submitAcceptance (legalName: string, documentIds: string[]) {
    submitting.value = true
    error.value = ''
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        error.value = 'Sign in to accept buyer policies.'
        return false
      }
      void sha256HexUtf8(buyerAgreementTextForHash())
      const { data, error: rpcErr } = await supabase.rpc('record_buyer_policy_acceptance', {
        p_legal_name: legalName.trim(),
        p_policy_version: BUYER_POLICY_VERSION,
        p_documents: documentsPayload(documentIds),
      })
      if (rpcErr) throw new Error(rpcErr.message)
      const row = data as { ok?: boolean; error?: string; message?: string; accepted_at?: string; signer_name?: string } | null
      if (row?.error) throw new Error(String(row.message || row.error))
      if (!row?.ok) throw new Error('Could not record buyer agreement.')
      accepted.value = true
      signerName.value = row.signer_name || legalName.trim()
      acceptedAt.value = row.accepted_at || new Date().toISOString()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      return false
    } finally {
      submitting.value = false
    }
  }

  const needsAcceptance = computed(() => {
    return !!user.value?.id && !loading.value && !accepted.value
  })

  return {
    BUYER_POLICY_VERSION,
    BUYER_POLICY_DOCUMENTS,
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
