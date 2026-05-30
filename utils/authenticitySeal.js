/**
 * Franks Standard Listing Authenticity Seal — what it means (and does not mean).
 * Not legal advice; aligns product copy with Terms and Marketplace Policy.
 */

export const SEAL_ASSET = '/franks-authenticity-seal.svg'

/** Short label on listings and COAs */
export const SEAL_TITLE = 'Franks Standard Listing Authenticity Seal'

/**
 * The seal is NOT independent laboratory authentication.
 * It means the listing met platform proof requirements at publish time.
 */
export const SEAL_MEANS = [
  'The seller supplied required proof for this category (COA upload, signed in-platform guarantee, or Franks issued COA tied to this listing).',
  'Listing text and photos passed our automated integrity screening for obvious red flags (replica language, mismatched claims, etc.).',
  'Checkout and disputes run on-platform with escrow and enforcement rules in our Marketplace Policies.',
]

export const SEAL_DOES_NOT_MEAN = [
  'The Franks Standard LLC is not a grading company, auction house expert, or insurer.',
  'We do not personally examine every item in person unless stated in a separate written service.',
  'The seal does not promise the item can never later be proven counterfeit — it means remedies follow our published policies if that happens.',
  'Automated screening is not a guarantee of genuineness; it reduces risk, it does not eliminate it.',
]

export const SCREENING_LABEL = 'Listing integrity screening'
export const SCREENING_DESC =
  'Automated checks for misleading language, missing proof, and obvious misrepresentation. This is risk screening — not laboratory authentication.'

/**
 * @param {{ coa_type?: string, integrity_status?: string, status?: string }} listing
 */
export function listingShowsAuthenticitySeal (listing) {
  if (!listing) return false
  if (listing.status && listing.status !== 'published') return false
  const coa = String(listing.coa_type || listing.coaType || '')
  if (coa === 'none' || !coa) return false
  const integrity = String(listing.integrity_status || listing.integrityStatus || 'clear')
  if (integrity === 'suspended' || integrity === 'counterfeit_confirmed') return false
  return true
}

export const GUARANTEE_WITH_SEAL_INTRO =
  'By signing, you attach the Franks Standard Listing Authenticity Seal to this listing — meaning you provided proof under our rules and accept enforcement if the item is proven fake or misrepresented.'
