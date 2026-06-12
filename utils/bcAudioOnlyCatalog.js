/**
 * B&C Performance Audio — keep only audio SKUs on the storefront.
 * Home audio, car audio, powersports/marine audio, and Bluetooth/portable speakers.
 */

export const BC_AUDIO_DEPARTMENTS = [
  { key: 'all', label: '📂 ALL AUDIO DEPARTMENTS', query: 'showroom' },
  { key: 'home', label: '🔊 Home Audio', query: 'home-audio' },
  { key: 'car', label: '🚗 Car Audio', query: 'car-audio' },
  { key: 'powersports', label: '⚓ Powersports Audio', query: 'powersports-audio' },
  { key: 'bluetooth', label: '📶 Bluetooth Speakers', query: 'bluetooth-speakers' },
]

/** Petra / wholesale rows we treat as audio inventory. */
const AUDIO_CATEGORIES = new Set([
  'Amplifiers',
  'Subwoofers',
  'Home Audio',
  'Home Audio & Theater',
  'Speakers, Subwoofers & Accessories',
  'Automotive Electronics',
  'Marine Electronics',
  'Portable Audio & Video',
  'Custom Install',
  'Cables, Connectors & Wiring Harnesses',
  'Cables & Interconnects',
])

const NON_AUDIO_NAME_RE =
  /\b(laptop|computer|monitor|keyboard|mouse|printer|router|network switch|tablet|iphone|android phone|phone case|screen protector|drill|wrench|hammer|refrigerator|microwave|coffee maker|toaster|blender|vacuum|lawn mower|grill|fishing rod|tent|mattress|office chair|desk chair)\b/i

const BLUETOOTH_SPEAKER_RE =
  /\b(bluetooth|bt\b|wireless speaker|portable speaker|soundbar|boom\s*box|boombox|smart speaker)\b/i

const SPEAKER_NAME_RE = /\b(speaker|spkr|soundbar|subwoofer|amplifier|amp\b|receiver|stereo|audio)\b/i

const AUDIO_CABLE_RE =
  /\b(audio|speaker|rca|hdmi|optical|subwoofer|amplifier|car audio|marine|wiring harness|interconnect)\b/i

export function normalizeBcCatalogCategory (category) {
  return String(category || '')
    .replace(/^"+|"+$/g, '')
    .trim()
}

function productText (product) {
  return `${product?.name || ''} ${product?.description || ''} ${product?.tagline || ''}`.trim()
}

/** True when this row belongs on the B&C audio storefront. */
export function isBcAudioProduct (product) {
  if (!product) return false
  const cat = normalizeBcCatalogCategory(product.category)
  if (!AUDIO_CATEGORIES.has(cat)) return false

  const text = productText(product)
  if (NON_AUDIO_NAME_RE.test(text)) return false

  if (cat === 'Portable Audio & Video') {
    return BLUETOOTH_SPEAKER_RE.test(text) || SPEAKER_NAME_RE.test(product?.name || '')
  }

  if (cat === 'Cables & Interconnects') {
    return AUDIO_CABLE_RE.test(text)
  }

  return true
}

/** home | car | powersports | bluetooth — for department filters. */
export function bcAudioDepartmentKey (product) {
  if (!isBcAudioProduct(product)) return null

  const cat = normalizeBcCatalogCategory(product.category)
  const name = String(product?.name || '')
  const segment = `${cat} ${name}`.toLowerCase()

  if (cat === 'Portable Audio & Video' || BLUETOOTH_SPEAKER_RE.test(name)) {
    return 'bluetooth'
  }
  if (cat === 'Marine Electronics' || /\bmarine\b|boat|powersport|offshore/.test(segment)) {
    return 'powersports'
  }
  if (
    cat === 'Automotive Electronics' ||
    cat === 'Cables, Connectors & Wiring Harnesses' ||
    /\bcar audio\b|automotive|vehicle audio|wiring harness/.test(segment)
  ) {
    return 'car'
  }
  return 'home'
}

export function bcAudioDepartmentLabel (key) {
  if (key === 'home') return 'Home Audio'
  if (key === 'car') return 'Car Audio'
  if (key === 'powersports') return 'Powersports Audio'
  if (key === 'bluetooth') return 'Bluetooth Speakers'
  return 'Authorized Audio'
}

export function bcAudioDepartmentIcon (key) {
  if (key === 'home') return '🔊'
  if (key === 'car') return '🚗'
  if (key === 'powersports') return '⚓'
  if (key === 'bluetooth') return '📶'
  return '🛒'
}

export function filterBcAudioProducts (products) {
  if (!Array.isArray(products)) return []
  return products.filter(isBcAudioProduct)
}
