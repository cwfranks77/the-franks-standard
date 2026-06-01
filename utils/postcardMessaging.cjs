/** Node/Lob copy — keep in sync with postcardMessaging.js */
const PRICING = { txRangeLabel: '4–5%', launchTxPromoPercent: 3, competitorTypical: '13%+' }
const EXCELLENCE = {
  shortName: 'Seller Excellence',
  cycleLabel: 'Every 6 months',
  rewards: [
    { rank: 1, title: 'Champion', feeDiscount: '0% platform fees', durationDays: 30 },
    { rank: 2, title: 'Runner-up', feeDiscount: '50% off platform fees', durationDays: 30 },
  ],
}

function postcardBackCopy () {
  const champ = EXCELLENCE.rewards[0]
  const runner = EXCELLENCE.rewards[1]
  return `THE FRANKS STANDARD — sell where proof is required

SECURITY (why buyers trust you here):
• COA or signed guarantee required before publish
• Verify serial at thefranksstandard.com/verify/coa
• Stripe escrow — paid after buyer confirms delivery
• Written enforcement: refunds, account freeze, bans

LOW FEES (keep more margin):
• ${PRICING.txRangeLabel} sale fees by plan — not ${PRICING.competitorTypical} stacked elsewhere
• ${PRICING.launchTxPromoPercent}% launch promo · first 10 listings free

SELLER PERKS:
• FOUNDERS10 — 3 months Pro FREE (limited spots)
• HONOR26 — military & first responders: 6 months Pro
• AI store builder · video rooms · eBay import

VOLUME REWARDS — ${EXCELLENCE.shortName} (${EXCELLENCE.cycleLabel}):
• #1 ${champ.title}: ${champ.feeDiscount} for ${champ.durationDays} days + homepage spotlight
• #2 ${runner.title}: ${runner.feeDiscount} for ${runner.durationDays} days
• Scored on completed sales, ratings & positive reviews

Start: thefranksstandard.com/sell
Scan QR: thefranksstandard.com/go/postcard · Code FOUNDERS10

Charles Franks · (877) 837-0527
info@thefranksstandard.com`
}

module.exports = { postcardBackCopy, POSTCARD_QR_URL: 'https://thefranksstandard.com/go/postcard?ref=postcard&utm_source=postcard&utm_medium=mail&promo=FOUNDERS10' }
