/**
 * Single source for seller outreach postcard (print, Lob, ops copy).
 */
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'
import { EXCELLENCE_PROGRAM } from '~/utils/sellerExcellenceProgram.js'

export const POSTCARD_SITE = 'https://thefranksstandard.com'
export const POSTCARD_QR_URL = `${POSTCARD_SITE}/go/postcard?ref=postcard&utm_source=postcard&utm_medium=mail&utm_campaign=seller-outreach&promo=FOUNDERS10`

export const POSTCARD_FRONT = {
  headline: 'Security built in. Fees half the big sites.',
  headlineEm: 'Security',
  subhead: 'Proof-first marketplace for serious sellers',
  bullets: [
    'COA + escrow on every sale',
    '4–5% fees — not ~13% stacked',
    'Forced-refund rules in writing',
    'eBay/CSV import · AI store',
    'Video inspect · dropship tools',
    'Top volume → fee rewards',
  ],
  bannerFounders: 'FOUNDERS10 — 3 months Pro FREE (limited)',
  bannerExcellence: `Seller Excellence — #1 wins ${EXCELLENCE_PROGRAM.rewards[0].feeDiscount} for ${EXCELLENCE_PROGRAM.rewards[0].durationDays} days`,
  footerUrl: 'thefranksstandard.com/sell',
  phone: '(877) 837-0527',
}

export function postcardBackCopy () {
  const champ = EXCELLENCE_PROGRAM.rewards[0]
  const runner = EXCELLENCE_PROGRAM.rewards[1]
  return `THE FRANKS STANDARD — sell where proof is required

SECURITY (why buyers trust you here):
• COA or signed guarantee required before publish
• Verify serial at thefranksstandard.com/verify/coa
• Stripe escrow — paid after buyer confirms delivery
• Written enforcement: refunds, account freeze, bans

LOW FEES (keep more margin):
• ${PRICING_PUBLIC.txRangeLabel} sale fees by plan — not ${PRICING_PUBLIC.competitorTypical} stacked elsewhere
• ${PRICING_PUBLIC.launchTxPromoPercent}% launch promo · first 10 listings free

SELLER PERKS:
• FOUNDERS10 — 3 months Pro FREE (limited spots)
• HONOR26 — military & first responders: 6 months Pro
• AI store builder · video rooms · eBay import

VOLUME REWARDS — ${EXCELLENCE_PROGRAM.shortName} (${EXCELLENCE_PROGRAM.cycleLabel}):
• #1 ${champ.title}: ${champ.feeDiscount} for ${champ.durationDays} days + homepage spotlight
• #2 ${runner.title}: ${runner.feeDiscount} for ${runner.durationDays} days
• Scored on completed sales, ratings & positive reviews

Start: thefranksstandard.com/sell
Scan QR: thefranksstandard.com/go/postcard · Code FOUNDERS10

Charles Franks · (877) 837-0527
info@thefranksstandard.com`
}
