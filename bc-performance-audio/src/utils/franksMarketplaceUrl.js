const FRANKS_MARKETPLACE_DEFAULT = 'https://thefranksstandard.com'

/** Base URL for The Franks Standard marketplace (used from the dedicated B&C site). */
export function getFranksMarketplaceBaseUrl (runtimeConfig) {
  const raw = String(
    runtimeConfig?.public?.franksMarketplaceUrl
    || runtimeConfig?.franksMarketplaceUrl
    || '',
  ).trim()
  if (!raw) return FRANKS_MARKETPLACE_DEFAULT
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return FRANKS_MARKETPLACE_DEFAULT
    return u.toString().replace(/\/$/, '')
  } catch {
    return FRANKS_MARKETPLACE_DEFAULT
  }
}

export function franksMarketplacePath (runtimeConfig, path = '/') {
  const base = getFranksMarketplaceBaseUrl(runtimeConfig)
  const suffix = String(path || '/').startsWith('/') ? path : `/${path}`
  return `${base}${suffix === '/' ? '' : suffix}`
}
