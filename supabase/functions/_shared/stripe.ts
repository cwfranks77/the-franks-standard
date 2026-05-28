import Stripe from 'npm:stripe@14'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' },
  })
}

export function stripeClient () {
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

export function siteUrl () {
  return (Deno.env.get('SITE_URL') ?? Deno.env.get('NUXT_PUBLIC_SITE_URL') ?? 'https://thefranksstandard.com').replace(/\/+$/, '')
}

export function platformFeeBps () {
  const raw = Deno.env.get('STRIPE_PLATFORM_FEE_BPS') ?? '500'
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 && n <= 3000 ? n : 500
}

/** Starter 5%, Pro 4.5%, Store 4% — matches pricing page. */
export function feeBpsForTier (tier?: string | null) {
  const t = String(tier ?? 'starter').toLowerCase()
  if (t === 'store') return 400
  if (t === 'pro') return 450
  return platformFeeBps()
}

export function effectiveFeeBps (
  sellerTier?: string | null,
  awardFeeBps?: number | null,
  awardFeeUntil?: string | null,
) {
  if (
    awardFeeBps != null &&
    Number.isFinite(awardFeeBps) &&
    awardFeeUntil &&
    new Date(awardFeeUntil) > new Date()
  ) {
    return Math.max(0, Math.round(awardFeeBps))
  }
  return feeBpsForTier(sellerTier)
}

export function calcFees (
  amountUsd: number,
  sellerTier?: string | null,
  awardFeeBps?: number | null,
  awardFeeUntil?: string | null,
) {
  const bps = effectiveFeeBps(sellerTier, awardFeeBps, awardFeeUntil)
  const platformFee = Math.round(amountUsd * bps) / 10000
  const sellerPayout = Math.round((amountUsd - platformFee) * 100) / 100
  return { platformFee, sellerPayout, platformFeeCents: Math.round(platformFee * 100), feeBps: bps }
}

/** Dropship: retail = platform fee + supplier wholesale + seller margin. */
/** Split sale between charity and seller; 100% = legacy full charity (no platform fee). */
export function calcCharitySplit (
  amountUsd: number,
  charityPercent: number,
  sellerTier?: string | null,
) {
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

export function calcDropshipSplit (amountUsd: number, wholesaleUsd: number, sellerTier?: string | null) {
  const { platformFee, platformFeeCents, feeBps } = calcFees(amountUsd, sellerTier)
  const maxWholesale = Math.max(0, amountUsd - platformFee - 0.01)
  const supplierCost = Math.round(Math.min(Math.max(0, wholesaleUsd), maxWholesale) * 100) / 100
  const sellerMargin = Math.round((amountUsd - platformFee - supplierCost) * 100) / 100
  return {
    platformFee,
    platformFeeCents,
    feeBps,
    supplierCost,
    sellerMargin,
    sellerPayout: sellerMargin,
  }
}