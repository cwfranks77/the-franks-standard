import { normalizeBcCatalogCategory } from './bcAudioOnlyCatalog.js'

/** Storefront shelf labels — one clear bucket per product in lists and filters. */
export const BC_SHELF_CATEGORIES = [
  'Amplifiers',
  'Subwoofers',
  'Speaker Boxes',
  'Speakers',
  'Receivers & Home Theater',
  'Car Audio',
  'Marine & Powersports Audio',
  'Bluetooth & Portable',
  'Cables & Wiring',
  'Custom Install',
]

function productText (product) {
  return `${product?.name || ''} ${product?.description || ''}`.toLowerCase()
}

/** Pick the shelf category for catalog menus, grids, and search groupings. */
export function bcProductShelfCategory (product) {
  if (!product) return 'Speakers'

  const text = productText(product)
  const cat = normalizeBcCatalogCategory(product.category).toLowerCase()

  if (/\b(subwoofer|sub\b|bass driver)\b/.test(text) || cat === 'subwoofers') {
    return 'Subwoofers'
  }
  if (/\b(enclosure|loaded box|speaker box|empty box|bandpass|ported box|sealed box|sub box)\b/.test(text)) {
    return 'Speaker Boxes'
  }
  if (/\b(amplifier|amp\b|monoblock|multi-channel|multi channel)\b/.test(text) || cat === 'amplifiers') {
    return 'Amplifiers'
  }
  if (
    /\b(receiver|av receiver|stereo receiver|home theater|soundbar|turntable|preamp)\b/.test(text)
    || cat.includes('home audio')
  ) {
    return 'Receivers & Home Theater'
  }
  if (cat === 'marine electronics' || /\b(marine|boat|powersport|offshore)\b/.test(text)) {
    return 'Marine & Powersports Audio'
  }
  if (cat === 'portable audio & video' || /\b(bluetooth|portable speaker|wireless speaker|boombox)\b/.test(text)) {
    return 'Bluetooth & Portable'
  }
  if (
    cat.includes('cables')
    || cat.includes('wiring')
    || cat.includes('interconnects')
    || /\b(cable|harness|rca|wiring kit|interconnect)\b/.test(text)
  ) {
    return 'Cables & Wiring'
  }
  if (cat === 'automotive electronics' || /\b(car audio|head unit|dash kit|vehicle audio)\b/.test(text)) {
    return 'Car Audio'
  }
  if (cat === 'custom install') {
    return 'Custom Install'
  }
  if (/\b(speaker|spkr|tweeter|midrange|coaxial|component set)\b/.test(text) || cat.includes('speakers')) {
    return 'Speakers'
  }

  return 'Speakers'
}
