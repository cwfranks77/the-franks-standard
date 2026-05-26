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

export function calcFees (amountUsd: number, sellerTier?: string | null) {
  const bps = feeBpsForTier(sellerTier)
  const platformFee = Math.round(amountUsd * bps) / 10000
  const sellerPayout = Math.round((amountUsd - platformFee) * 100) / 100
  return { platformFee, sellerPayout, platformFeeCents: Math.round(platformFee * 100), feeBps: bps }
}

/** Dropship: retail = platform fee + supplier wholesale + seller margin. */
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