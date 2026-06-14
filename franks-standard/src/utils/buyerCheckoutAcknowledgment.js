import { LIABILITY_POLICY_VERSION } from '~/utils/liabilityPolicyVersion.js'

export const CHECKOUT_ACK_VERSION = LIABILITY_POLICY_VERSION

export const CHECKOUT_ACK_BULLETS = [
  'The Franks Standard LLC is a marketplace facilitator only — not the seller of this item.',
  'Your contract for the item is with the seller named on this order.',
  'Any serialized COA or Seller Written Guarantee on this listing is seller-backed; The Franks Standard LLC does not warrant the item is authentic.',
  'You agree to escrow, refund, and dispute rules in the Marketplace Policies of The Franks Standard LLC.',
  'You will not hold The Franks Standard LLC liable for seller fraud, misdescription, or inauthentic items beyond what mandatory law requires.',
]

export const CHECKOUT_ACK_CHECKBOX =
  'I agree to the Checkout Order Acknowledgment for this purchase on The Franks Standard LLC marketplace facilitator website.'

export const CHECKOUT_ACK_SERIALIZED_COA_CHECKBOX =
  'I understand the serialized COA on this listing is issued by The Franks Standard LLC as a registry tool only and does not mean The Franks Standard LLC authenticated this item.'

export function checkoutAckTextForHash ({ hasSerializedCoa = false } = {}) {
  const parts = [CHECKOUT_ACK_VERSION, ...CHECKOUT_ACK_BULLETS, CHECKOUT_ACK_CHECKBOX]
  if (hasSerializedCoa) parts.push(CHECKOUT_ACK_SERIALIZED_COA_CHECKBOX)
  return parts.join('\n')
}
