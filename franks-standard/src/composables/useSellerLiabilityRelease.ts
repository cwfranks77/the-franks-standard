import { sha256HexUtf8 } from '~/utils/sha256Browser.js'
import {
  LIABILITY_POLICY_VERSION,
  sellerReleaseTextForHash,
  sellerReleaseTypeForListing,
} from '~/utils/sellerLiabilityReleases.js'

export function useSellerLiabilityRelease () {
  const supabase = useSupabaseClient()

  async function recordRelease ({
    needsCoa,
    legalName,
    listingId,
    serializedCoaUsed = false,
  }: {
    needsCoa: boolean
    legalName: string
    listingId: string
    serializedCoaUsed?: boolean
  }) {
    const releaseType = sellerReleaseTypeForListing(needsCoa)
    const textHash = sha256HexUtf8(sellerReleaseTextForHash(releaseType))
    const signatureHash = sha256HexUtf8(
      [legalName.trim(), releaseType, LIABILITY_POLICY_VERSION, listingId, String(serializedCoaUsed)].join('|'),
    )
    const { data, error } = await supabase.rpc('record_seller_liability_release', {
      p_release_type: releaseType,
      p_legal_name: legalName.trim(),
      p_listing_id: listingId,
      p_serialized_coa_used: serializedCoaUsed,
      p_release_text_sha256: textHash,
      p_signature_sha256: signatureHash,
    })
    if (error) throw new Error(error.message)
    const row = data as { ok?: boolean; error?: string; message?: string } | null
    if (row?.error) throw new Error(String(row.message || row.error))
    if (!row?.ok) throw new Error('Could not record seller liability release.')
    return row
  }

  return { recordRelease, sellerReleaseTypeForListing, LIABILITY_POLICY_VERSION }
}
