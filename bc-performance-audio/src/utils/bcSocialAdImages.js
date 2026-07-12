/** Public paths for B&C Performance Audio social / paid ad creatives. */
export const BC_AD_LOGO = '/img/bc-logo-primary.png'
export const BC_AD_HERO = '/img/hero-showcase-v2.svg'

/**
 * Turn an ad "image" note into a display URL for owner ad previews.
 * Returns empty string when the creative needs a screen recording only.
 */
export function resolveBcAdImageSrc (imageNote) {
  const raw = String(imageNote || '').trim()
  if (!raw || /^n\/a$/i.test(raw)) return ''

  if (/screen record|screen:/i.test(raw) && !/\.(png|jpe?g|svg|webp|gif)/i.test(raw)) {
    return ''
  }

  const fileMatch = raw.match(/([\w.-]+\.(?:png|jpe?g|svg|webp|gif))/i)
  if (fileMatch) {
    const file = fileMatch[1].toLowerCase()
    if (file.includes('bc-logo') || file.includes('bc_logo')) return BC_AD_LOGO
    return `/img/${file.replace(/^public\//, '')}`
  }

  if (/bc-logo|b&c logo|bc logo/i.test(raw)) return BC_AD_LOGO
  if (/hero-showcase/i.test(raw)) return BC_AD_HERO

  return ''
}
