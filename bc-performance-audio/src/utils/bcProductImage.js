const PLACEHOLDER = '/img/hero-showcase-v2.svg'

export const PETRA_IMAGE_CDN = 'https://s3.us-east-2.amazonaws.com/petraimages.com'
const BROKEN_PETRA_IMAGE_HOST = /https?:\/\/petraimages\.com\.s3\.amazonaws\.com/i

const BC_PLACEHOLDER_IMAGES = {
  amplifier: '/img/bc-catalog/amplifier.svg',
  subwoofer: '/img/bc-catalog/subwoofer.svg',
  enclosure: '/img/bc-catalog/enclosure.svg',
  soundbar: '/img/bc-catalog/soundbar.svg',
  cable: '/img/bc-catalog/cable.svg',
  speaker: '/img/bc-catalog/speaker.svg',
  marine: '/img/bc-catalog/marine.svg',
  car: '/img/bc-catalog/car-audio.svg',
}

/** Product photos load from supplier CDN; local SVG when no photo is available. */
export function bcProductImageSrc (raw, siteUrl = '') {
  const value = String(raw || '').trim()
  if (!value) return PLACEHOLDER
  if (/^https?:\/\//i.test(value)) {
    // Fix the old broken Petra host so catalog photos actually load.
    return fixPetraImageUrl(value)
  }
  if (value.startsWith('/')) return value
  const base = String(siteUrl || '').replace(/\/$/, '')
  return base ? `${base}/${value.replace(/^\//, '')}` : value
}

export function fixPetraImageUrl (raw) {
  const value = String(raw || '').trim().replace(/^http:\/\//i, 'https://')
  if (!value) return ''
  if (BROKEN_PETRA_IMAGE_HOST.test(value)) {
    const path = value.replace(BROKEN_PETRA_IMAGE_HOST, '')
    return `${PETRA_IMAGE_CDN}${path.startsWith('/') ? path : `/${path}`}`
  }
  return value
}

export function petraImageUrlFromSku (sku) {
  const id = String(sku || '').trim()
  if (!id || id === 'N/A') return ''
  return `${PETRA_IMAGE_CDN}/600x600/${id.toUpperCase()}.jpg`
}

/** Pick a category-appropriate local SVG from name / description / category. */
export function bcPlaceholderImageForProduct (product) {
  const text = `${product?.name || ''} ${product?.description || ''} ${product?.category || ''}`.toLowerCase()

  if (/\b(bluetooth|bt\b|wifi smart|wireless speaker|portable speaker|soundbar|boombox)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.soundbar
  }
  if (/\b(marine|boat|powersport|offshore|trolling)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.marine
  }
  if (/\b(car audio|dash kit|head unit|receiver|radio\b|stereo|vehicle)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.car
  }
  if (/\b(cable|wire|harness|adapter|rca|interconnect|wiring kit)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.cable
  }
  if (/\b(subwoofer|sub\b|woofer|bass driver)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.subwoofer
  }
  if (/\b(enclosure|loaded box|speaker box|dual \d+\"\s*enclosure)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.enclosure
  }
  if (/\b(amplifier|amp\b|monoblock|multi-channel)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.amplifier
  }
  if (/\b(speaker|spkr|tweeter|midrange|bookshelf)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.speaker
  }
  if (/\b(soundbar|home theater|surround|receiver|av receiver)\b/.test(text)) {
    return BC_PLACEHOLDER_IMAGES.soundbar
  }

  return BC_PLACEHOLDER_IMAGES.speaker
}

/** Best display image for a B&C catalog row: Petra CDN by SKU, then fixed remote URL, then local/placeholder SVG. */
export function resolveBcProductImage (product) {
  if (!product) return PLACEHOLDER

  const raw = String(product.image || '').trim()

  if (/^https?:\/\//i.test(raw)) {
    const fixedRemote = fixPetraImageUrl(raw)
    if (fixedRemote) return fixedRemote
  }

  const fromSku = petraImageUrlFromSku(product.sku || product.vendorSku)
  if (fromSku) return fromSku

  if (raw.startsWith('/')) return raw

  return bcPlaceholderImageForProduct(product)
}
