/** Public paths for Franks Standard social / paid ad creatives. */
export const FRANKS_AD_LOGO = '/img/franks-pavilion.png'
export const FRANKS_COA_AD_IMAGE = '/img/franks-coa-watermark.svg'

/**
 * Turn an ad "image" note (filename, path, or description) into a <img src> URL.
 * Returns empty string when the ad needs a screen recording or has no static creative.
 */
export function resolveFranksAdImageSrc (imageNote) {
  const raw = String(imageNote || '').trim()
  if (!raw || /^n\/a$/i.test(raw)) return ''

  if (/screen record|screen:/i.test(raw) && !/\.(png|jpe?g|svg|webp|gif)/i.test(raw)) {
    return ''
  }

  if (/coa diagram|floor office/i.test(raw)) return FRANKS_COA_AD_IMAGE

  const fileMatch = raw.match(/([\w.-]+\.(?:png|jpe?g|svg|webp|gif))/i)
  if (fileMatch) {
    const file = fileMatch[1].toLowerCase()
    if (file.includes('coa')) return FRANKS_COA_AD_IMAGE
    if (file === 'franks-pavilion.png') return FRANKS_AD_LOGO
    return `/img/${file.replace(/^public\//, '')}`
  }

  if (/franks-pavilion/i.test(raw)) return FRANKS_AD_LOGO

  return ''
}
