import {
  buildSellerGoogleSearchUrl,
  buildSellerGooglePhysicalSearchUrl,
  buildSellerMapsSearchUrl,
} from '~/utils/sellerGoogleSearch.js'
import {
  buildGoUrl,
  buildProspectTrackingRef,
  buildQrImageUrl,
} from '~/utils/outreachTracking.js'

const MAIL_HEADER = [
  'username',
  'business_name',
  'address_line1',
  'address_city',
  'address_state',
  'address_zip',
  'mail_ready',
  'campaign_ref',
  'tracking_url',
  'qr_image_url',
  'feedback_pct',
  'listing_hits',
  'ebay_store_url',
  'google_physical',
  'google_maps',
  'notes',
].join(',')

function esc (v) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`
}

export function mailProspectsToCsv (rows, addressByUser = {}, options = {}) {
  const batchRef = options.batchRef || 'postcard'
  const campaignSlug = options.campaignSlug || 'postcard'
  const siteOrigin = options.siteOrigin || 'https://thefranksstandard.com'
  const lines = rows.map((r) => {
    const u = r.username
    const saved = addressByUser[u] || addressByUser[u?.toLowerCase()] || {}
    const storeUrl = r.store_url || r.ebay_store_url || `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(u)}&_ipg=60&rt=nc`
    const campaignRef = buildProspectTrackingRef(batchRef, u)
    const trackingUrl = buildGoUrl(siteOrigin, campaignSlug, { ref: campaignRef })
    return [
      esc(u),
      esc(saved.business_name ?? ''),
      esc(saved.address_line1 ?? ''),
      esc(saved.address_city ?? ''),
      esc(saved.address_state ?? ''),
      esc(saved.address_zip ?? ''),
      esc(saved.mail_ready ?? ''),
      esc(campaignRef),
      esc(trackingUrl),
      esc(buildQrImageUrl(trackingUrl)),
      esc(r.feedback_pct ?? ''),
      esc(r.listing_hits ?? ''),
      esc(storeUrl),
      esc(buildSellerGooglePhysicalSearchUrl(u)),
      esc(buildSellerMapsSearchUrl(u)),
      esc(saved.notes ?? ''),
    ].join(',')
  })
  return [MAIL_HEADER, ...lines].join('\n')
}

export function mailProspectsToResearchCsv (rows) {
  const header = [
    'username',
    'feedback_pct',
    'feedback_count',
    'listing_hits',
    'is_ebay_store',
    'sample_title',
    'ebay_store_url',
    'google_contact',
    'google_physical',
    'google_maps',
  ].join(',')
  const lines = rows.map((r) => {
    const u = r.username
    return [
      esc(u),
      esc(r.feedback_pct ?? ''),
      esc(r.feedback_count ?? ''),
      esc(r.listing_hits ?? ''),
      esc(r.is_ebay_store ? 'yes' : ''),
      esc(r.sample_titles?.[0] ?? ''),
      esc(r.store_url ?? ''),
      esc(buildSellerGoogleSearchUrl(u)),
      esc(buildSellerGooglePhysicalSearchUrl(u)),
      esc(buildSellerMapsSearchUrl(u)),
    ].join(',')
  })
  return [header, ...lines].join('\n')
}
