/** Canonical slug for Brandy's Sporting Goods — matches brandysportingoods.com */
export const BRANDYS_STORE_SLUG = 'brandysportinggoods'

const ALIASES = {
  brandysportinggoods: BRANDYS_STORE_SLUG,
  brandyssportinggoods: BRANDYS_STORE_SLUG,
  'brandy-s-sporting-goods': BRANDYS_STORE_SLUG,
  'brandys-sporting-goods': BRANDYS_STORE_SLUG,
}

export function resolveStoreSlug (raw) {
  const s = String(raw || '').toLowerCase().trim()
  return ALIASES[s] || s
}

const BRANDY_STORE_HOSTS = new Set([
  'brandysportingoods.com',
  'brandysportinggoods.com',
  'brandyssportinggoods.com',
])

export function isBrandyStoreHost (hostname) {
  const h = String(hostname || '').toLowerCase().replace(/^www\./, '')
  return BRANDY_STORE_HOSTS.has(h)
}

export const BRANDY_HOLD_HEADLINE = "Brandy's Sporting Goods — opening soon"
export const BRANDY_HOLD_MESSAGE =
  'We are finishing supplier setup and inventory before checkout goes live. Check back soon or browse the main marketplace.'

/** True when Brandy storefront should show hold page (env: NUXT_PUBLIC_BRANDY_STORE_ON_HOLD). */
export function isBrandyStoreOnHold (slug) {
  const canonical = resolveStoreSlug(slug)
  if (canonical !== BRANDYS_STORE_SLUG) return false
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const flag = String(import.meta.env.NUXT_PUBLIC_BRANDY_STORE_ON_HOLD ?? 'true').toLowerCase()
    return flag !== 'false' && flag !== '0'
  }
  return true
}
