import {
  ATTRIBUTION_STORAGE_KEY,
  mergeAttribution,
  attributionFromRoute,
  attributionForSignup,
  buildGoUrl,
  buildTrackedPath,
  buildQrImageUrl,
  buildProspectTrackingRef,
  getCampaign,
  OUTREACH_CAMPAIGNS,
} from '~/utils/outreachTracking.js'

export function useOutreachAttribution () {
  function readStored () {
    if (!import.meta.client) return null
    try {
      const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function writeStored (data) {
    if (!import.meta.client || !data) return
    try {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }

  function captureFromRoute (route) {
    const incoming = attributionFromRoute(route)
    const hasSignal = incoming.ref || incoming.campaign || incoming.promo
      || incoming.utm_source || incoming.utm_medium
    if (!hasSignal && !incoming.landing_path?.startsWith('/go/')) return readStored()

    const merged = mergeAttribution(readStored(), incoming)
    writeStored(merged)
    trackOutreachEvent('outreach_touch', merged)
    return merged
  }

  function getAttribution () {
    return readStored()
  }

  function getSignupMetadataFields () {
    return attributionForSignup(readStored())
  }

  function siteOrigin () {
    if (import.meta.client && typeof window !== 'undefined') {
      const { protocol, host, hostname } = window.location
      if (hostname && !/localhost|127\.0\.0\.1/i.test(hostname)) {
        return `${protocol}//${host}`
      }
    }
    const cfg = String(useRuntimeConfig().public?.siteUrl || '').trim().replace(/\/$/, '')
    return cfg || 'https://thefranksstandard.com'
  }

  function trackOutreachEvent (name, payload = {}) {
    if (!import.meta.client || typeof window === 'undefined') return
    const w = window
    if (typeof w.gtag === 'function') {
      w.gtag('event', name, {
        event_category: 'outreach',
        ref: payload.ref || undefined,
        campaign: payload.campaign || undefined,
        promo: payload.promo || undefined,
        utm_source: payload.utm_source || undefined,
        utm_medium: payload.utm_medium || undefined,
      })
    }
  }

  return {
    ATTRIBUTION_STORAGE_KEY,
    OUTREACH_CAMPAIGNS,
    getCampaign,
    readStored,
    captureFromRoute,
    getAttribution,
    getSignupMetadataFields,
    buildGoUrl: (slug, overrides) => buildGoUrl(siteOrigin(), slug, overrides),
    buildTrackedPath,
    buildQrImageUrl,
    buildProspectTrackingRef,
    trackOutreachEvent,
    siteOrigin,
  }
}
