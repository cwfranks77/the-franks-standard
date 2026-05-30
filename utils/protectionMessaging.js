/**
 * Balanced buyer + seller protection messaging (ads, social, trust page).
 * Framing: honest sellers get a fair floor; buyers get proof + escrow — not "all sellers are crooks."
 */

import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

export const SITE_URL = 'https://thefranksstandard.com'

export const PROTECTION_HEADLINE = 'Trust both sides — not trust no one'

/** Seller-facing rule — every collectible is recorded on-platform (no signature-only bypass). */
export const COLLECTIBLE_PROOF_REGISTRY =
  'Every collectible listed on The Franks Standard must have proof on file: either a third-party COA upload (PSA, PCGS, issuer, etc.) or a Franks Standard COA serial (FS-YYYY-NNNNNN) issued at publish and stored in our registry. There is no signature-only or written-guarantee bypass — each item is tied to a listing, photos, and verify at /verify/coa.'

export const BUYER_PILLARS = [
  { icon: '🏢', title: 'Floor office COA', desc: 'Each Franks COA is tied to one listing slot (FS-YYYY-NNNNNN) and the photos/description at issue — not a blank form.' },
  { icon: '🔍', title: 'Verify before you buy', desc: 'Scan serial at /verify/coa — registry must match the listing you are viewing.' },
  { icon: '🔒', title: 'Escrow checkout', desc: 'Payment held until you confirm delivery — room to open a dispute if the item is wrong.' },
  { icon: '🚫', title: 'Zero tolerance for proven fakes', desc: 'Confirmed counterfeits: seller ban + listing removed + COA revoked.' },
]

export const SELLER_PILLARS = [
  { icon: '✅', title: 'Your proof, your reputation', desc: 'Uploaded COA or Franks serial on file showcases authentic inventory — you are not lumped in with anonymous scammers.' },
  { icon: '💵', title: 'Escrow protects you too', desc: 'Funds release after delivery confirmation and tracking — reduces "item not received" scams.' },
  { icon: '📦', title: 'Ship what you listed', desc: 'Match the listing and COA office — disputes go both ways if a buyer claims falsely.' },
  { icon: '📉', title: 'Lower fees, real buyers', desc: `${PRICING_PUBLIC.txRangeLabel} sale fees by plan — buyers come for proof, not endless haggling over "is it real?"` },
]

/** Social ad — balanced protection (Facebook / Instagram / X) */
export function balancedProtectionAd () {
  return `Trust the deal — both ways.

FOR BUYERS 🛡️
• Franks COA locked to ONE listing (floor office #FS-YYYY-NNNNNN)
• Verify serial + photos at ${SITE_URL}/verify/coa
• Stripe escrow — pay, inspect, then confirm
• Report concerns · proven fakes = permanent seller ban

FOR SELLERS 🤝
• Your authentic items stand out — required proof, not "guilty until proven innocent"
• Escrow until buyer confirms (tracking protects you on non-delivery claims)
• Half the stacked fees of big marketplaces (${PRICING_PUBLIC.txRangeLabel} by plan)
• AI store · eBay import · dropship setup

We police bad listings — not honest shop owners.

Browse: ${SITE_URL}/browse
Sell: ${SITE_URL}/sell
How protection works: ${SITE_URL}/protection`
}

/** Short Reels/TikTok script */
export function protectionReelScript () {
  return `[Hook] Marketplaces treat every seller like a suspect. We treat proof like the product.

[Buyer] COA tied to ONE listing office · verify the serial · escrow until you confirm.

[Seller] Show your real inventory · get paid after delivery · lower fees · serious buyers.

[CTA] thefranksstandard.com/protection

#TheFranksStandard #Collectibles #TrustBothSides`
}

export const SOCIAL_ADS_PROTECTION = [
  {
    platform: 'Facebook / Instagram — Balanced protection',
    icon: '🛡️',
    format: '1200×628 or 1080×1080 — split graphic: buyer left / seller right',
    image: 'franks-pavilion.png + "Trust both sides" headline',
    text: balancedProtectionAd(),
  },
  {
    platform: 'X — Protection launch tweet',
    icon: '𝕏',
    format: 'Tweet + 1200×675 card',
    image: 'Floor office COA diagram mockup',
    text: `New on The Franks Standard — protection that respects buyers AND sellers.

Buyers: COA serial = one listing office. Verify at ${SITE_URL}/verify/coa. Escrow until you confirm.
Sellers: Proof-first floor for REAL inventory. Escrow + tracking. ${PRICING_PUBLIC.txRangeLabel} fees — not 13%+.

We ban proven fakes — we don't paint every seller as dishonest.

${SITE_URL}/protection #TheFranksStandard #TrustBothSides`,
  },
  {
    platform: 'TikTok / Reels — Trust both sides',
    icon: '🎬',
    format: '9:16 · 30s',
    image: 'Screen: listing COA bond green check → verify page',
    text: protectionReelScript(),
  },
]
