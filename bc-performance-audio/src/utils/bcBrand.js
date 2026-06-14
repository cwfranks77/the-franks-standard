/**
 * B&C Performance Audio — brand strings for safe ampersand handling.
 * Use these in script/SEO (plain text) and {{ }} bindings (Vue auto-escapes).
 * In static template HTML, prefer B&amp;C or {{ BC_BRAND.short }}.
 */
export const BC_BRAND = Object.freeze({
  short: 'B&C',
  full: 'B&C Performance Audio',
  tagline: 'Unmatched Power. Crystal Clarity. Competition Grade Sound.',
  accent: '#d32f2f',
})

/** SEO-safe title — ampersand is fine in plain JS strings passed to useSeoMeta */
export function bcPageTitle (suffix = '') {
  const base = BC_BRAND.full
  return suffix ? `${base} — ${suffix}` : base
}
