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

  async function loadStatus () {
    loading.value = true
    error.value = ''
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      loading.value = false
      accepted.value = false
      return
    }
    const { data, error: qErr } = await supabase
      .from('profiles')
      .select('seller_policies_accepted_at, seller_policies_version, seller_policies_signer_name')
      .eq('id', user.id)
      .maybeSingle()
    if (qErr) {
      error.value = qErr.message
      loading.value = false
      return
    }
    accepted.value = !!(
      data?.seller_policies_accepted_at &&
      data?.seller_policies_version === SELLER_POLICY_VERSION
    )
    signerName.value = data?.seller_policies_signer_name || ''
    acceptedAt.value = data?.seller_policies_accepted_at || ''
    loading.value = false
  }

  async function submitAcceptance (legalName: string, documentIds: string[]) {
    submitting.value = true
    error.value = ''
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('accept-seller-policies', {
        body: {
          legal_name: legalName,
          policy_version: SELLER_POLICY_VERSION,
          documents: documentIds,
        },
      })
      if (fnErr) throw new Error(fnErr.message)
      if (data?.error) throw new Error(data.message || data.error)
      accepted.value = true
      signerName.value = data.signer_name || legalName
      acceptedAt.value = data.accepted_at || new Date().toISOString()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      return false
    } finally {
      submitting.value = false
    }
  }

  const needsAcceptance = computed(
    () => !!user.value && !loading.value && !accepted.value,
  )

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
