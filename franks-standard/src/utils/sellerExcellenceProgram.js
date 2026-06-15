/**
 * Franks Standard Seller Excellence — quarterly recognition for top sellers.
 */

/** How often a new award period opens (months). */
export const EXCELLENCE_CYCLE_MONTHS = 6

export const EXCELLENCE_PROGRAM = {
  name: 'Franks Standard Seller Excellence',
  shortName: 'Seller Excellence',
  tagline: 'Top sellers earn our token of appreciation — featured placement, excellence badges, and reduced or waived platform fees.',
  cycleLabel: `Every ${EXCELLENCE_CYCLE_MONTHS} months`,
  rewards: [
    {
      rank: 1,
      title: 'Champion',
      feeDiscount: '0% platform fees',
      feeBps: 0,
      durationDays: 30,
      perks: ['Homepage spotlight', '“Champion” badge on listings', 'Priority support queue'],
    },
    {
      rank: 2,
      title: 'Runner-up',
      feeDiscount: '50% off platform fees',
      feeBps: null,
      feeDiscountPercent: 50,
      durationDays: 30,
      perks: ['Featured on Top Sellers page', 'Badge on store profile'],
    },
    {
      rank: 3,
      title: 'Rising star',
      feeDiscount: '25% off platform fees',
      feeBps: null,
      feeDiscountPercent: 25,
      durationDays: 30,
      perks: ['Top Sellers listing', 'Eligible for next cycle bonus points'],
    },
  ],
  scoring: [
    'Completed sales (paid & fulfilled orders)',
    'Average buyer rating (4★ and 5★ count extra)',
    'Volume of positive written feedback',
  ],
  rules: [
    'Must maintain COA/guarantee compliance — no active authenticity strikes.',
    'Fake or prohibited listings disqualify you for that cycle.',
    'Ties broken by higher average rating, then earlier qualifying sale.',
    'Fee discounts apply to marketplace sales fees only; Stripe/payment processing still applies.',
  ],
}

/** Weighted score for sorting leaderboard rows client-side if view unavailable. */
export function excellenceScore (row) {
  const sales = Number(row.completed_sales) || 0
  const avg = Number(row.rating_avg) || 0
  const reviews = Number(row.review_count) || 0
  const positive = Number(row.positive_reviews) || 0
  return sales * 10 + avg * reviews * 2 + positive * 5
}

export function currentPeriodKey (date = new Date()) {
  const y = date.getUTCFullYear()
  const half = date.getUTCMonth() < 6 ? 'H1' : 'H2'
  return `${y}-${half}`
}
