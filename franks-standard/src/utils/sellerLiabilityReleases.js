import { LIABILITY_POLICY_VERSION } from '~/utils/liabilityPolicyVersion.js'

export { LIABILITY_POLICY_VERSION }

export const SELLER_RELEASE_COLLECTIBLE = 'collectible_antique_coa'
export const SELLER_RELEASE_GENERAL = 'general_merchandise'

export function sellerReleaseTypeForListing (needsCoa) {
  return needsCoa ? SELLER_RELEASE_COLLECTIBLE : SELLER_RELEASE_GENERAL
}

export const SELLER_RELEASE_META = {
  [SELLER_RELEASE_COLLECTIBLE]: {
    title: 'Collectible, Antique & COA Seller Liability Release',
    subtitle: 'The Franks Standard LLC — marketplace facilitator',
  },
  [SELLER_RELEASE_GENERAL]: {
    title: 'General Merchandise Seller Liability Release',
    subtitle: 'The Franks Standard LLC — marketplace facilitator',
  },
}

/** Full release text shown before publish (attorney draft v2026-06-12). */
export function sellerReleaseBody (releaseType) {
  if (releaseType === SELLER_RELEASE_COLLECTIBLE) {
    return [
      'This Release is between The Franks Standard LLC, a Louisiana limited liability company ("Platform"), acting solely as a marketplace facilitator, and you, the seller.',
      'The Platform does not buy, sell, own, possess, inspect, authenticate, grade, warrant, or guarantee any item listed on the marketplace facilitator website operated by The Franks Standard LLC (thefranksstandard.com).',
      'You alone are responsible for truth and accuracy of title, description, condition, photos, price, legal right to sell, and authenticity of the item. If the item is counterfeit, fraudulent, stolen, materially misdescribed, or not as represented, you bear full responsibility — not The Franks Standard LLC.',
      'If you upload a third-party COA, you back its accuracy. The Franks Standard LLC does not verify third-party certificate content.',
      'If you use a serialized COA issued through The Franks Standard LLC (unique serial FS-YYYY-NNNNNN with Seller Written Guarantee digitally attached), you acknowledge it is a seller-backed registry tool — not a warranty or certification by The Franks Standard LLC. You may not reuse a serial on another item.',
      'Disputes about authenticity, condition, or description are primarily between you and the buyer. You release and discharge The Franks Standard LLC and the Platform from claims arising from your listings, uploaded COAs, or serialized COAs to the fullest extent permitted by Louisiana law.',
      'You shall defend, indemnify, and hold harmless The Franks Standard LLC from third-party claims arising from your listings, items, or COAs.',
      'By typing your legal name below, you sign electronically under the E-SIGN Act and Louisiana law.',
    ]
  }
  return [
    'This Release is between The Franks Standard LLC ("Platform"), marketplace facilitator only, and you, the seller.',
    'For general merchandise listings (no collectible COA requirement), you alone are responsible for accurate title, description, condition, photos, price, legal right to sell, and fulfillment.',
    'The Franks Standard LLC does not inspect, test, or warrant items.',
    'Buyer disputes about wrong item, defect, or misdescription are between you and the buyer. The Franks Standard LLC shall not be a party except as mandatory law requires.',
    'You release The Franks Standard LLC from claims arising from your merchandise listings to the fullest extent permitted by law and indemnify The Franks Standard LLC against related third-party claims.',
    'By typing your legal name below, you sign electronically under the E-SIGN Act and Louisiana law.',
  ]
}

export function sellerReleaseCheckbox (releaseType) {
  if (releaseType === SELLER_RELEASE_COLLECTIBLE) {
    return 'I have read and agree to the Collectible, Antique & COA Seller Liability Release. I accept full legal responsibility for my item and any COA I use (uploaded or serialized COA). I understand The Franks Standard LLC is a marketplace facilitator only and has no liability for authenticity, fraud, or misdescription of my listings.'
  }
  return 'I have read and agree to the General Merchandise Seller Liability Release. I accept full legal responsibility for my listing. The Franks Standard LLC is a marketplace facilitator only and is not liable for my item descriptions, condition, or fulfillment.'
}

export function sellerReleaseTextForHash (releaseType) {
  return [
    LIABILITY_POLICY_VERSION,
    releaseType,
    ...sellerReleaseBody(releaseType),
    sellerReleaseCheckbox(releaseType),
  ].join('\n')
}
