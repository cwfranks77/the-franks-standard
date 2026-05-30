/**
 * Seller policy bundle — version and documents that must be digitally accepted before selling.
 * Keep SELLER_POLICY_VERSION in sync with marketplacePolicyMeta POLICY_LAST_UPDATED (ISO date).
 */

import { POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'

/** Bump when Terms, Marketplace Policy, Seller Agreement, or Prohibited Items change materially. */
export const SELLER_POLICY_VERSION = '2026-05-29'

export const SELLER_POLICY_EFFECTIVE_LABEL = POLICY_LAST_UPDATED

/** Binding documents included in the digital seller agreement. */
export const SELLER_POLICY_DOCUMENTS = [
  { id: 'terms', label: 'Terms of Service', path: '/terms', required: true },
  { id: 'marketplace_policy', label: 'Marketplace Policies & Enforcement Standards', path: '/marketplace-policy', required: true },
  { id: 'seller_agreement', label: 'Seller Agreement', path: '/seller-agreement', required: true },
  { id: 'prohibited_items', label: 'Prohibited Items', path: '/prohibited-items', required: true },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy', required: true },
]

export const SELLER_DIGITAL_AGREEMENT_INTRO =
  'Before you list, import, dropship, or otherwise sell on The Franks Standard, you must digitally sign and agree to every binding policy below. This applies whether you sell occasionally, operate a store, or use dropship automation.'

/** Shown on the policy gate — counsel review in progress */
export const SELLER_POLICY_ATTORNEY_NOTICE =
  'Policy version marked for attorney review. Print the linked documents for counsel; when you receive stamped final copies, send them to the team to replace this draft in the site.'

export const SELLER_DIGITAL_AGREEMENT_CLOSING =
  'By typing your full legal name and checking the box, you agree that your electronic signature has the same effect as a handwritten signature for all listed policies, including escrow, refunds, account freeze, platform debt, authenticity enforcement, and permanent ban provisions.'
