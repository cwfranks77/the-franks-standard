/**
 * Outreach attribution — postcards, mail batches, QR codes, and /go/* landers.
 * Persists ref + UTM in sessionStorage; passed to signup via auth user_metadata.
 */

export const ATTRIBUTION_STORAGE_KEY = 'tfs_outreach_attribution'

/** @typedef {{ slug: string, label: string, path: string, promo?: string, defaultRef: string, defaultUtm?: Record<string,string> }} OutreachCampaign */

/** @type {Record<string, OutreachCampaign>} */
export const OUTREACH_CAMPAIGNS = {
  postcard: {
    slug: 'postcard',
    label: 'Postcard mail (default batch)',
    path: '/join/founders10',
    promo: 'FOUNDERS10',
    defaultRef: 'postcard',
    defaultUtm: { utm_source: 'postcard', utm_medium: 'direct_mail', utm_campaign: 'seller-outreach' },
  },
  founders10: {
    slug: 'founders10',
    label: 'Founding seller (FOUNDERS10)',
    path: '/join/founders10',
    promo: 'FOUNDERS10',
    defaultRef: 'founders10',
    defaultUtm: { utm_source: 'web', utm_medium: 'referral', utm_campaign: 'founders10' },
  },
  store90: {
    slug: 'store90',
    label: 'Store / dropship partner',
    path: '/join/store-partner',
    promo: 'STORE90',
    defaultRef: 'store90',
    defaultUtm: { utm_source: 'outreach', utm_medium: 'partner', utm_campaign: 'store90' },
  },
  'store-partner': {
    slug: 'store-partner',
    label: 'Store / dropship partner',
    path: '/join/store-partner',
    promo: 'STORE90',
    defaultRef: 'store90',
    defaultUtm: { utm_source: 'outreach', utm_medium: 'partner', utm_campaign: 'store90' },
  },
  import: {
    slug: 'import',
    label: 'eBay / CSV import',
    path: '/sell/import',
    defaultRef: 'import',
    defaultUtm: { utm_source: 'outreach', utm_medium: 'email', utm_campaign: 'inventory-import' },
  },
  sell: {
    slug: 'sell',
    label: 'Sell landing',
    path: '/sell/start',
    defaultRef: 'sell',
    defaultUtm: { utm_source: 'outreach', utm_medium: 'print', utm_campaign: 'sell' },
  },
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const REF_KEYS = ['ref', 'campaign', 'src', 'aff']

export function normalizeRef (raw) {
  const s = String(raw || '').trim().toLowerCase()
  if (!s) return ''
  return s.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 64)
}

export function parseAttributionFromQuery (query = {}) {
  const out = {
    ref: '',
    campaign: '',
    promo: '',
    landing_path: '',
    captured_at: new Date().toISOString(),
  }
  for (const k of UTM_KEYS) {
    const v = String(query[k] || '').trim()
    if (v) out[k] = v.slice(0, 120)
  }
  const aff = String(query.aff || '').trim().toLowerCase().replace(/^@/, '')
  if (aff) out.aff = aff.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 48)
  const ref = normalizeRef(query.ref || query.src || '')
  const campaign = normalizeRef(query.campaign || query.utm_campaign || '')
  if (ref) out.ref = ref
  if (campaign) out.campaign = campaign
  if (out.aff && !out.ref) out.ref = `aff-${out.aff}`
  const promo = String(query.promo || '').trim().toUpperCase()
  if (promo) out.promo = promo
  return out
}

export function mergeAttribution (existing, incoming) {
  const base = { ...(existing || {}) }
  for (const [k, v] of Object.entries(incoming || {})) {
    if (v == null || v === '') continue
    base[k] = v
  }
  if (!base.first_touch_at && incoming?.captured_at) {
    base.first_touch_at = incoming.captured_at
  }
  base.last_touch_at = incoming?.captured_at || new Date().toISOString()
  return base
}

export function getCampaign (slug) {
  const key = String(slug || '').trim().toLowerCase()
  return OUTREACH_CAMPAIGNS[key] || null
}

export function buildTrackedQuery (campaignSlug, overrides = {}) {
  const c = getCampaign(campaignSlug)
  const q = { ...(c?.defaultUtm || {}) }
  if (c?.defaultRef && !overrides.ref) q.ref = c.defaultRef
  if (c?.promo && !overrides.promo) q.promo = c.promo
  Object.assign(q, overrides)
  return q
}

export function buildTrackedPath (campaignSlug, overrides = {}) {
  const c = getCampaign(campaignSlug)
  if (!c) return '/sell/start'
  const params = new URLSearchParams()
  const q = buildTrackedQuery(campaignSlug, overrides)
  for (const [k, v] of Object.entries(q)) {
    if (v != null && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  return qs ? `${c.path}?${qs}` : c.path
}

/** Short link for QR codes and print — always /go/{slug} with optional ref. */
export function buildGoUrl (siteOrigin, campaignSlug, overrides = {}) {
  const base = String(siteOrigin || 'https://thefranksstandard.com').replace(/\/$/, '')
  const slug = String(campaignSlug || 'postcard').trim().toLowerCase()
  const params = new URLSearchParams()
  const q = buildTrackedQuery(slug, overrides)
  for (const [k, v] of Object.entries(q)) {
    if (v != null && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  return qs ? `${base}/go/${slug}?${qs}` : `${base}/go/${slug}`
}

export function buildQrImageUrl (targetUrl, size = 200) {
  const data = encodeURIComponent(String(targetUrl || '').trim())
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`
}

/** Per-recipient ref for mail CSV / Lob merge: pcard500-ebayuser */
export function buildProspectTrackingRef (batchRef, username) {
  const batch = normalizeRef(batchRef || 'postcard')
  const user = normalizeRef(String(username || '').replace(/^@/, ''))
  if (!user) return batch
  return `${batch}-${user}`.slice(0, 64)
}

export function attributionFromRoute (route) {
  const path = route?.path || ''
  const query = route?.query || {}
  const parsed = parseAttributionFromQuery(query)
  parsed.landing_path = path

  const goMatch = path.match(/^\/go\/([^/]+)/)
  if (goMatch) {
    const c = getCampaign(goMatch[1])
    if (c) {
      parsed.campaign = parsed.campaign || c.slug
      if (!parsed.ref) parsed.ref = c.defaultRef
      if (!parsed.promo && c.promo) parsed.promo = c.promo
    }
  }
  if (path.startsWith('/join/') && !parsed.campaign) {
    parsed.campaign = path.replace('/join/', '') || 'join'
  }
  const affMatch = path.match(/^\/r\/([^/]+)/)
  if (affMatch) {
    const handle = affMatch[1].toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    parsed.aff = handle
    parsed.ref = parsed.ref || `aff-${handle}`
    parsed.utm_source = parsed.utm_source || 'affiliate'
    parsed.utm_medium = parsed.utm_medium || 'influencer'
    parsed.campaign = parsed.campaign || 'affiliate'
    parsed.utm_content = parsed.utm_content || handle
  }
  return parsed
}

export function pickAttributionQueryKeys (query) {
  const out = {}
  for (const k of [...UTM_KEYS, ...REF_KEYS, 'promo']) {
    const v = query?.[k]
    if (v != null && String(v).trim() !== '') out[k] = String(v).trim()
  }
  return out
}

export function attributionForSignup (stored) {
  if (!stored || typeof stored !== 'object') return {}
  let affiliateHandle = stored.aff || null
  if (!affiliateHandle && stored.ref?.startsWith('aff-')) {
    affiliateHandle = stored.ref.slice(4)
  }
  if (!affiliateHandle && stored.utm_medium === 'influencer' && stored.utm_content) {
    affiliateHandle = stored.utm_content
  }
  return {
    signup_ref: stored.ref || null,
    signup_campaign: stored.campaign || null,
    signup_promo: stored.promo || null,
    signup_utm_source: stored.utm_source || null,
    signup_utm_medium: stored.utm_medium || null,
    signup_utm_campaign: stored.utm_campaign || null,
    signup_utm_content: stored.utm_content || null,
    signup_landing_path: stored.landing_path || null,
    signup_first_touch_at: stored.first_touch_at || stored.captured_at || null,
    signup_affiliate_handle: affiliateHandle || null,
    signup_affiliate_tier: stored.utm_campaign && stored.utm_medium === 'influencer'
      ? stored.utm_campaign
      : null,
  }
}
