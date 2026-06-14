/**
 * Authenticity seal and listing disclosures.
 * COA / Seller Written Guarantee language: utils/franksCoaModel.js
 */

import {
  COA_FINE_PRINT_FULL,
  COA_FINE_PRINT_SHORT,
  SELLER_WRITTEN_GUARANTEE_LABEL,
} from '~/utils/franksCoaModel.js'

export { COA_FINE_PRINT_FULL, COA_FINE_PRINT_SHORT }

export const SEAL_ASSET = '/franks-authenticity-seal.svg'

export const SEAL_TITLE = 'Seller-backed listing'

/** One-line lead on listings */
export const SEAL_LISTING_LEAD =
  'The seller of this item backs its authenticity. The Franks Standard seal means required seller proof is on file — not a Platform guarantee that the item is genuine.'

/** Short label on compact seal */
export const SEAL_COMPACT_LABEL = 'Seller backs item'

export const SEAL_MEANS = [
  'The seller named on this listing backs the authenticity and description of this item.',
  'Required proof is on file: uploaded third-party COA and/or a Franks Standard COA serial with the seller\'s Written Guarantee digitally attached to that certificate.',
  'One Franks serial (FS-YYYY-NNNNNN) binds one listing office — photos and description at issue time — not a blank reusable form.',
  'Checkout and disputes run on-platform with escrow and enforcement under our Marketplace Policies if the item is later proven fake or misrepresented.',
]

export const SEAL_DOES_NOT_MEAN = [
  'The Franks Standard LLC does not guarantee, warrant, certify, or authenticate that this item is genuine.',
  'A Franks Standard COA is not the Platform standing behind the item — the seller is.',
  'We are not a grading company, auction house expert, or insurer.',
  'Automated integrity screening reduces risk; it is not laboratory authentication.',
]

/** @deprecated Use SELLER_WRITTEN_GUARANTEE_LABEL — legacy listings only */
export const SELLER_GUARANTEE_TITLE = SELLER_WRITTEN_GUARANTEE_LABEL
export const SELLER_GUARANTEE_SUBTITLE = '(on Franks COA — seller backs item, not the Platform)'

/** Legacy standalone form copy — retired for new listings */
export const GUARANTEE_TEMPLATE_INTRO =
  'Legacy standalone guarantee forms are retired for new listings. New collectibles use uploaded COA or Franks COA with Seller Written Guarantee on the certificate.'

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
