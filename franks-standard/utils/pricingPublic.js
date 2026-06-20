/** Public pricing copy — single source for site, ops, and social. */
export const PRICING_PUBLIC = {
  starterTxPercent: 5,
  proTxPercent: 4.5,
  storeTxPercent: 4,
  launchTxPromoPercent: 3,
  proMonthly: '14.99',
  proAnnual: '143.88',
  storeMonthly: '32.99',
  storeAnnual: '316.70',
  competitorTypical: '13%+',
  txRangeLabel: '4–5%',
  proValueLabel: '$14.99/mo Pro',
}

export function launchPromoFeeLine () {
  return `${PRICING_PUBLIC.launchTxPromoPercent}% transaction fee for your first 90 days (then ${PRICING_PUBLIC.txRangeLabel} by plan)`
}

export function saleFeesMarketingLine () {
  return `Sale fees ${PRICING_PUBLIC.txRangeLabel} by plan (${PRICING_PUBLIC.launchTxPromoPercent}% for new sellers' first 90 days) vs typical ${PRICING_PUBLIC.competitorTypical} elsewhere`
}