/** Client-side charity split preview (matches supabase/functions/_shared/stripe.ts). */

export function feeBpsForTier (tier) {
  const t = String(tier ?? 'starter').toLowerCase()
  if (t === 'store') return 400
  if (t === 'pro') return 450
  return 500
}

export function calcFees (amountUsd, sellerTier) {
  const bps = feeBpsForTier(sellerTier)
  const platformFee = Math.round(amountUsd * bps) / 10000
  const sellerPayout = Math.round((amountUsd - platformFee) * 100) / 100
  return { platformFee, sellerPayout }
}

export function calcCharitySplit (amountUsd, charityPercent, sellerTier) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(charityPercent) || 0)))
  if (pct <= 0) {
    return { charityPercent: 0, charityAmount: 0, platformFee: 0, sellerPayout: 0, fullDonation: false }
  }
  const charityAmount = Math.round(amountUsd * pct * 100) / 10000
  if (pct >= 100) {
    return {
      charityPercent: 100,
      charityAmount: Math.round(amountUsd * 100) / 100,
      platformFee: 0,
      sellerPayout: 0,
      fullDonation: true,
    }
  }
  const sellerGross = Math.round((amountUsd - charityAmount) * 100) / 100
  const { platformFee, sellerPayout } = calcFees(sellerGross, sellerTier)
  return {
    charityPercent: pct,
    charityAmount,
    platformFee,
    sellerPayout,
    fullDonation: false,
  }
}

export const CHARITY_PERCENT_PRESETS = [10, 25, 50, 75, 100]
