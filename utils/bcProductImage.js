const PLACEHOLDER = '/img/hero-showcase-v2.svg'

/** Product photos load from supplier CDN; local site only supplies a tiny SVG fallback. */
export function bcProductImageSrc (raw, siteUrl = '') {
  const value = String(raw || '').trim()
  if (!value) return PLACEHOLDER
  if (/^https?:\/\//i.test(value)) return value.replace(/^http:\/\//i, 'https://')
  if (value.startsWith('/')) return value
  const base = String(siteUrl || '').replace(/\/$/, '')
  return base ? `${base}/${value.replace(/^\//, '')}` : value
}
