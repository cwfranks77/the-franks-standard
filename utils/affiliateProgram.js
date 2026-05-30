/**
 * Influencer & affiliate partner program — nano/micro creators in collectibles.
 * Tracked via /r/{handle}, ?aff=, and signup_affiliate_handle on profiles.
 */

import { normalizeRef } from '~/utils/outreachTracking.js'

export const AFFILIATE_PROMO_CODE = 'CREATOR'
export const AFFILIATE_REF_PREFIX = 'aff-'

/** Follower bands for outreach targeting (not enforced in code). */
export const AFFILIATE_TIERS = {
  nano: {
    id: 'nano',
    label: 'Nano creator',
    followers: '1K – 10K',
    typicalPayout: 'Free Pro month per 3 seller signups who list',
    fit: 'Local card breakers, shop TikToks, niche Discord mods',
  },
  micro: {
    id: 'micro',
    label: 'Micro creator',
    followers: '10K – 100K',
    typicalPayout: 'Co-marketing + flat fee or rev-share on referred GMV (negotiated)',
    fit: 'YouTube break channels, Instagram/whatnot-style hosts, coin TikTok',
  },
  macro: {
    id: 'macro',
    label: 'Macro / partner',
    followers: '100K+',
    typicalPayout: 'Custom co-marketing, category sponsorship, event coverage',
    fit: 'Established hobby media — pitch case-by-case',
  },
}

/**
 * Seed partners (edit or add via Ops → Influencers local roster).
 * @type {Array<{ handle: string, displayName: string, tier: keyof AFFILIATE_TIERS, platform: string, landing: string, promo?: string, active: boolean, notes?: string }>}
 */
export const AFFILIATE_PARTNERS_SEED = [
  {
    handle: 'example-breaks',
    displayName: 'Example Breaks (demo)',
    tier: 'micro',
    platform: 'youtube',
    landing: 'sell',
    active: true,
    notes: 'Replace with real handle before sharing link publicly.',
  },
]

export function normalizeAffiliateHandle (raw) {
  const s = String(raw || '').trim().toLowerCase().replace(/^@/, '')
  if (!s) return ''
  return s.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 48)
}

export function affiliateRef (handle) {
  const h = normalizeAffiliateHandle(handle)
  return h ? `${AFFILIATE_REF_PREFIX}${h}` : ''
}

export function parseAffiliateRef (ref) {
  const r = normalizeRef(ref)
  if (r.startsWith(AFFILIATE_REF_PREFIX)) {
    return r.slice(AFFILIATE_REF_PREFIX.length)
  }
  return ''
}

export function getAffiliatePartner (handle, extraRoster = []) {
  const h = normalizeAffiliateHandle(handle)
  if (!h) return null
  const all = [...AFFILIATE_PARTNERS_SEED, ...extraRoster]
  return all.find((p) => p.active !== false && normalizeAffiliateHandle(p.handle) === h) || null
}

/** Landing path key → site path */
export const AFFILIATE_LANDINGS = {
  sell: '/sell',
  founders: '/join/founders10',
  learn: '/learn',
  import: '/sell/import',
  store: '/join/store-partner',
}

export function resolveAffiliateLanding (key) {
  return AFFILIATE_LANDINGS[key] || AFFILIATE_LANDINGS.sell
}

/**
 * Query params for attribution + optional promo.
 * @param {string} handle
 * @param {{ landing?: string, promo?: string, partner?: object }} opts
 */
export function buildAffiliateTrackingQuery (handle, opts = {}) {
  const h = normalizeAffiliateHandle(handle)
  const partner = opts.partner || getAffiliatePartner(h)
  const tier = partner?.tier || 'nano'
  const landing = opts.landing || partner?.landing || 'sell'
  return {
    aff: h,
    ref: affiliateRef(h),
    promo: opts.promo || partner?.promo || AFFILIATE_PROMO_CODE,
    utm_source: 'affiliate',
    utm_medium: 'influencer',
    utm_campaign: tier,
    utm_content: h,
    landing,
  }
}

export function buildAffiliatePath (handle, siteOrigin, opts = {}) {
  const q = buildAffiliateTrackingQuery(handle, opts)
  const landing = resolveAffiliateLanding(q.landing)
  delete q.landing
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) {
    if (v != null && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  return qs ? `${landing}?${qs}` : landing
}

export function buildAffiliateShortUrl (siteOrigin, handle) {
  const base = String(siteOrigin || 'https://thefranksstandard.com').replace(/\/$/, '')
  const h = normalizeAffiliateHandle(handle)
  return h ? `${base}/r/${encodeURIComponent(h)}` : base
}

export function extractAffiliateHandleFromAttribution (stored = {}) {
  if (stored.aff) return normalizeAffiliateHandle(stored.aff)
  const fromRef = parseAffiliateRef(stored.ref)
  if (fromRef) return fromRef
  if (stored.utm_medium === 'influencer' && stored.utm_content) {
    return normalizeAffiliateHandle(stored.utm_content)
  }
  return ''
}

/** Disclosure line creators must use (FTC). */
export const AFFILIATE_FTC_DISCLOSURE =
  '#ad · Paid partnership with The Franks Standard — I earn a bonus when you sign up and sell through my link.'

export const AFFILIATE_MEDIA_KIT = {
  tagline: 'Sell on a proof-forward floor — 4–5% fees, seller proof on collectibles, Stripe escrow.',
  bullets: [
    '4–5% sale fees by plan (not ~13% stacked on big marketplaces)',
    'Seller COA or signed guarantee on collectible listings (marketplace facilitator)',
    'eBay CSV import + AI store builder',
    'Video inspect rooms before checkout',
    'FOUNDERS10: 3 months Pro free for early sellers (limited)',
  ],
  hashtags: ['#sportscards', '#thefranksstandard', '#collectibles', '#cardbreak'],
}
