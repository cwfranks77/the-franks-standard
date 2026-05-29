import { SupabaseClient } from 'npm:@supabase/supabase-js@2'

/** Must match utils/sellerPolicyBundle.js SELLER_POLICY_VERSION */
export const CURRENT_SELLER_POLICY_VERSION = '2026-05-20'

export type SellerPolicyProfile = {
  seller_policies_accepted_at: string | null
  seller_policies_version: string | null
  seller_policies_signer_name?: string | null
}

export function sellerPoliciesCurrent (profile: SellerPolicyProfile | null | undefined): boolean {
  if (!profile?.seller_policies_accepted_at || !profile?.seller_policies_version) return false
  return profile.seller_policies_version === CURRENT_SELLER_POLICY_VERSION
}

export async function loadSellerPolicyStatus (
  admin: SupabaseClient,
  sellerId: string,
): Promise<SellerPolicyProfile | null> {
  const { data } = await admin
    .from('profiles')
    .select('seller_policies_accepted_at, seller_policies_version, seller_policies_signer_name')
    .eq('id', sellerId)
    .maybeSingle()
  return data as SellerPolicyProfile | null
}

export async function assertSellerPoliciesAccepted (
  admin: SupabaseClient,
  sellerId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const profile = await loadSellerPolicyStatus(admin, sellerId)
  if (!sellerPoliciesCurrent(profile)) {
    return {
      ok: false,
      error: 'seller_policies_not_accepted',
      message:
        'Seller has not digitally signed the current Terms, Marketplace Policies, Seller Agreement, and related policies. Complete acceptance at /sell before listing or selling.',
    }
  }
  return { ok: true }
}
