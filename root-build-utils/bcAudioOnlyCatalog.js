/**
 * B&C Performance Audio — keep only audio SKUs on the storefront.
 * Home audio, car audio, and powersports/marine audio only.
 */

export const BC_AUDIO_DEPARTMENTS = [
  { key: 'all', label: '📂 ALL AUDIO DEPARTMENTS', query: 'showroom' },
  { key: 'home', label: '🔊 Home Audio', query: 'home-audio' },
  { key: 'car', label: '🚗 Car Audio', query: 'car-audio' },
  { key: 'powersports', label: '⚓ Powersports Audio', query: 'powersports-audio' },
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
  /\b(laptop|computer|monitor|keyboard|mouse|printer|router|network switch|tablet|iphone|android phone|phone case|screen protector|drill|wrench|hammer|refrigerator|microwave|coffee maker|toaster|blender|vacuum|lawn mower|grill|fishing rod|tent|mattress|office chair|desk chair|gps|navigator|navigation|drivesmart|drive\s*\d{2}|dash\s*cam|backup\s*cam|rearview|friction\s*mount|magnetic\s*mnt|wall\s*dog|garage\s*door|data-bus|cat5\/6|hdmi\s*ext|video\s*ext|ir\s*kit|terminal\s*cup|data modul|data module|interface module|bypass module|remote start|car alarm|security system|obd|can-?bus|crimestopper|evo-all|headrest monitor|overhead monitor|dvd player|antenna\b|cb radio|tire|wheel|oil filter|brake pad|spark plug|battery charger(?!.*audio))\b/i

const CAR_SECURITY_RE =
  /\b(bypass|interface module|data modul|remote start|security|alarm system|keyless|immobilizer|obd|can bus|crimestopper|evo-all)\b/i

const CAR_AUDIO_RE =
  /\b(car audio|speaker|subwoofer|amplifier|amp\b|receiver|stereo|head unit|tweeter|wiring harness|equalizer|monoblock|component|coaxial|soundbar|bluetooth|marine audio|powersport)\b/i

const CUSTOM_INSTALL_AUDIO_RE =
  /\b(speaker|subwoofer|amplifier|audio|in-wall|in-ceiling|sound|stereo|receiver|surround)\b/i

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
  if (CAR_SECURITY_RE.test(text)) return false

  if (cat === 'Portable Audio & Video') {
    return BLUETOOTH_SPEAKER_RE.test(text) || SPEAKER_NAME_RE.test(product?.name || '')
  }

  if (cat === 'Home Audio' || cat === 'Home Audio & Theater') {
    return (
      SPEAKER_NAME_RE.test(text) ||
      /\b(receiver|surround|theater|tower|bookshelf|subwoofer|amplifier|soundbar)\b/i.test(text)
    )
  }

  if (cat === 'Marine Electronics') {
    return /\b(marine audio|boat audio|speaker|subwoofer|amplifier|stereo|receiver|tower)\b/i.test(text)
  }

  if (cat === 'Cables & Interconnects' || cat === 'Cables, Connectors & Wiring Harnesses') {
    return AUDIO_CABLE_RE.test(text) && !CAR_SECURITY_RE.test(text)
  }

  if (cat === 'Automotive Electronics') {
    return CAR_AUDIO_RE.test(text) && !CAR_SECURITY_RE.test(text)
  }

  if (cat === 'Custom Install') {
    return CUSTOM_INSTALL_AUDIO_RE.test(text)
  }

  if (cat === 'Amplifiers' || cat === 'Subwoofers' || cat === 'Speakers, Subwoofers & Accessories') {
    return SPEAKER_NAME_RE.test(text) || /\b(amp|sub|speaker|audio)\b/i.test(text)
  }

  return false
}

/** home | car | powersports — for department filters. */
export function bcAudioDepartmentKey (product) {
  if (!isBcAudioProduct(product)) return null

  const cat = normalizeBcCatalogCategory(product.category)
  const name = String(product?.name || '')
  const segment = `${cat} ${name}`.toLowerCase()

  if (cat === 'Portable Audio & Video' || BLUETOOTH_SPEAKER_RE.test(name)) {
    return 'home'
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
  return 'Authorized Audio'
}

export function bcAudioDepartmentIcon (key) {
  if (key === 'home') return '🔊'
  if (key === 'car') return '🚗'
  if (key === 'powersports') return '⚓'
  return '🛒'
}

export function filterBcAudioProducts (products) {
  if (!Array.isArray(products)) return []
  return products.filter(isBcAudioProduct)
}
