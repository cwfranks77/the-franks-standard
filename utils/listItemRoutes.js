/** Entry points for "List an item" — choose collectible vs general before the full sell form. */

export const LIST_ITEM_START_PATH = '/sell/start'
export const LIST_ITEM_COA_PATH = '/sell/coa'
export const SELL_FORM_PATH = '/sell'

export const LISTING_KIND_GENERAL = 'general'
export const LISTING_KIND_COLLECTIBLE = 'collectible'

const ALLOWED_COA_TYPES = new Set(['upload', 'guarantee', 'franks_issued'])

/** Normalize ?kind= from route query. */
export function parseListingKind (query) {
  const kind = String(query?.kind || '').toLowerCase()
  if (kind === LISTING_KIND_GENERAL) return LISTING_KIND_GENERAL
  if (kind === LISTING_KIND_COLLECTIBLE) return LISTING_KIND_COLLECTIBLE
  return ''
}

export function parseCoaTypeFromQuery (query) {
  const coa = String(query?.coaType || query?.coa || '').toLowerCase()
  return ALLOWED_COA_TYPES.has(coa) ? coa : ''
}

/** True when user chose a listing path (not the sell hub chooser). */
export function isActiveListingFlow (query) {
  const kind = parseListingKind(query)
  if (kind === LISTING_KIND_GENERAL || kind === LISTING_KIND_COLLECTIBLE) return true
  const mode = String(query?.mode || '').toLowerCase()
  return mode === 'dropship' || mode === 'direct'
}

/** Rebuild post-login destination when ?redirect= was split by an unencoded ? in the URL. */
export function resolveAuthRedirect (query, fallback = '/dashboard') {
  const raw = query?.redirect
  if (typeof raw !== 'string' || !raw.startsWith('/')) return fallback

  if (raw.includes('?') || raw.includes('#')) return raw

  const extra = new URLSearchParams()
  for (const [key, value] of Object.entries(query || {})) {
    if (key === 'redirect') continue
    if (value == null || value === '') continue
    if (Array.isArray(value)) {
      value.forEach((v) => extra.append(key, String(v)))
    } else {
      extra.set(key, String(value))
    }
  }
  const suffix = extra.toString()
  return suffix ? `${raw}?${suffix}` : raw
}

/** Non-collectible → sell form, no COA step. */
export function generalListingRoute () {
  return { path: SELL_FORM_PATH, query: { kind: LISTING_KIND_GENERAL } }
}

/** Collectible with proof chosen on /sell/coa. */
export function collectibleListingRoute (coaType) {
  const coa = String(coaType || '').toLowerCase()
  if (!ALLOWED_COA_TYPES.has(coa)) return LIST_ITEM_COA_PATH
  return {
    path: SELL_FORM_PATH,
    query: { kind: LISTING_KIND_COLLECTIBLE, coaType: coa },
  }
}

/** Collectible listings must pass /sell/coa before the form when coaType is missing. */
export function collectibleNeedsCoaStep (query) {
  if (parseListingKind(query) !== LISTING_KIND_COLLECTIBLE) return false
  return !parseCoaTypeFromQuery(query)
}
