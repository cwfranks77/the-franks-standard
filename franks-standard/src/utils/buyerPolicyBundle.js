import { POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'
import { LIABILITY_POLICY_VERSION } from '~/utils/liabilityPolicyVersion.js'

export { LIABILITY_POLICY_VERSION as BUYER_POLICY_VERSION }

export const BUYER_POLICY_EFFECTIVE_LABEL = POLICY_LAST_UPDATED

export const BUYER_POLICY_DOCUMENTS = [
  { id: 'terms', label: 'Terms of Service', path: '/terms', required: true },
  { id: 'marketplace_policy', label: 'Marketplace Policies & Enforcement', path: '/marketplace-policy', required: true },
  { id: 'buyer_agreement', label: 'Buyer Marketplace Facilitator Agreement', path: '/buyer-agreement', required: true },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy', required: true },
]

export const BUYER_DIGITAL_AGREEMENT_INTRO =
  'Before your first purchase on The Franks Standard LLC marketplace facilitator website, you must digitally agree to the policies below. This one agreement covers all purchases until The Franks Standard LLC publishes a new policy version.'

export const BUYER_DIGITAL_AGREEMENT_CLOSING =
  'By typing your full legal name and checking the box, you agree that your electronic signature has the same effect as a handwritten signature for all listed policies.'

export const BUYER_AGREEMENT_SECTIONS = [
  'The Franks Standard LLC does not sell, own, authenticate, grade, warrant, or guarantee third-party listed items. Each purchase is between you and the independent seller.',
  'A serialized COA issued through The Franks Standard LLC (FS-YYYY-NNNNNN) is seller-backed — not a warranty or certification by The Franks Standard LLC that the item is authentic.',
  'You release The Franks Standard LLC from claims about authenticity or seller misrepresentation to the fullest extent permitted by law. Disputes are primarily between you and the seller.',
  'Escrow, refunds, and disputes follow the Marketplace Policies of The Franks Standard LLC.',
]

export const BUYER_AGREEMENT_CHECKBOX =
  'I have read and agree to the Buyer Marketplace Facilitator Agreement of The Franks Standard LLC. I understand the Platform is a marketplace facilitator only, that sellers — not The Franks Standard LLC — back items and COAs (including serialized COA), and that purchase disputes about authenticity or description are primarily between me and the seller.'

export function buyerAgreementTextForHash () {
  return [
    LIABILITY_POLICY_VERSION,
    BUYER_DIGITAL_AGREEMENT_INTRO,
    ...BUYER_AGREEMENT_SECTIONS,
    BUYER_AGREEMENT_CHECKBOX,
  ].join('\n')
}
