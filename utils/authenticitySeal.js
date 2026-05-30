/**
 * Authenticity seal, seller guarantee, and COA template disclosures.
 * Not legal advice; aligns product copy with Terms and Marketplace Policy.
 */

export const SEAL_ASSET = '/franks-authenticity-seal.svg'

export const SEAL_TITLE = 'Seller-backed listing'

/** One-line lead on listings */
export const SEAL_LISTING_LEAD =
  'The seller of this item backs its authenticity. The Franks Standard seal means required seller proof is on file — not a Platform guarantee that the item is genuine.'

/** Short label on compact seal */
export const SEAL_COMPACT_LABEL = 'Seller backs item'

export const SEAL_MEANS = [
  'The seller named on this listing backs the authenticity and description of this item.',
  'The seller supplied required proof (uploaded COA, signed Seller Authenticity Guarantee, or a Franks Standard COA template serial tied to this listing).',
  'Franks Standard COA documents are an in-platform template and registry — they record seller representation and listing pairing at issue time.',
  'Checkout and disputes run on-platform with escrow and enforcement under our Marketplace Policies if the item is later proven fake or misrepresented.',
]

export const SEAL_DOES_NOT_MEAN = [
  'The Franks Standard LLC does not guarantee, warrant, certify, or authenticate that this item is genuine.',
  'A Franks Standard COA is not the Platform standing behind the item — the seller is.',
  'We are not a grading company, auction house expert, or insurer.',
  'Automated integrity screening reduces risk; it is not laboratory authentication.',
]

/** Fine print — full (COA verify page, legal-adjacent UI) */
export const COA_FINE_PRINT_FULL =
  'The Franks Standard Certificate of Authenticity (COA) is a platform-issued document template that links this listing\'s photos and description to a serial number at the time of issue. It is not a guarantee, warranty, or expert opinion by The Franks Standard LLC. The seller of this item is solely responsible for representing that the item is authentic and as described. The Platform may enforce Marketplace Policies (including refunds and account action) when an item is proven counterfeit or misrepresented; that enforcement does not mean the Platform vouched for authenticity at sale.'

/** Fine print — short (listing cards, sell flow, under seal) */
export const COA_FINE_PRINT_SHORT =
  'Franks Standard COA = seller-backed template only. Not a Platform guarantee of authenticity. See Terms and Marketplace Policies.'

export const SELLER_GUARANTEE_TITLE = 'Seller Authenticity Guarantee'
export const SELLER_GUARANTEE_SUBTITLE = '(Franks Standard template — you back this item, not the Platform)'

export const GUARANTEE_TEMPLATE_INTRO =
  'This is the Franks Standard in-platform guarantee template. By signing, you — the seller — back this item. The Franks Standard does not guarantee or warrant authenticity; we provide the form, listing rules, and enforcement if policies are violated.'

export const GUARANTEE_WITH_SEAL_INTRO = GUARANTEE_TEMPLATE_INTRO

export const SCREENING_LABEL = 'Listing integrity screening'
export const SCREENING_DESC =
  'Automated checks for misleading language, missing proof, and obvious misrepresentation. Screening is risk reduction — not Platform authentication of the item.'

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
