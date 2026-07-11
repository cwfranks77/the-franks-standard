/**
 * Brandy's Sporting Goods — sporting/outdoor SKUs from Petra prodlist feed.
 */

export const BRANDY_SPORTING_CATEGORIES = new Set([
  'Outdoor Recreation',
  'Fitness Technology & Equipment',
  'Drinkware',
])

const SPORTING_NAME_RE =
  /\b(cooler|tent|sleeping bag|hiking|camping|fishing|kayak|canoe|paddle|bike|bicycle|athletic|sport|golf|hunting|archery|exercise|fitness|dumbbell|yoga|backpack|hydration|water bottle|tumbler|binocular|scope|horn|air horn|lantern|flashlight|headlamp|grill|tailgate|weights|treadmill|tracker|smartwatch|watch)\b/i

const NON_SPORTING_RE =
  /\b(laptop|printer|router|drill|wrench|refrigerator|microwave|vacuum|lawn mower|car alarm|remote start|hdmi|keyboard|barcode|scanner)\b/i

export function normalizeBrandyCategory (category) {
  return String(category || '').replace(/^"+|"+$/g, '').trim()
}

function productText (product) {
  return `${product?.name || ''} ${product?.description || ''}`.trim()
}

/** True when row belongs on Brandy's Sporting Goods storefront. */
export function isBrandySportingProduct (product) {
  if (!product) return false
  const cat = normalizeBrandyCategory(product.category)
  const text = productText(product)
  if (NON_SPORTING_RE.test(text)) return false

  if (BRANDY_SPORTING_CATEGORIES.has(cat)) {
    if (cat === 'Drinkware') {
      return /\b(bottle|tumbler|cooler|hydration|mug|flask|jug)\b/i.test(text)
    }
    if (cat === 'Fitness Technology & Equipment') {
      return /\b(fitness|tracker|watch|exercise|bike|treadmill|weight|yoga|sport)\b/i.test(text)
    }
    return SPORTING_NAME_RE.test(text) || cat === 'Outdoor Recreation'
  }

  return SPORTING_NAME_RE.test(text)
}

export function filterBrandySportingProducts (products) {
  if (!Array.isArray(products)) return []
  return products.filter(isBrandySportingProduct)
}
