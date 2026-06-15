import wholesaleMap from '../../../../../data/petra-wholesale-by-sku.json'

function pickWholesale (key) {
  if (key == null || key === '') return null
  const raw = String(key).trim()
  const tries = [raw, raw.toUpperCase(), raw.toLowerCase()]
  for (const k of tries) {
    const hit = wholesaleMap[k]
    if (hit != null) {
      const n = Number(hit)
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return null
}

/** Server-only Petra dealer cost by SKU or catalog id — never expose to browsers. */
export function lookupPetraWholesaleCost (productSku, productId) {
  return pickWholesale(productSku) ?? pickWholesale(productId)
}

export function resolveBcCheckoutWholesale (body) {
  const sku = body?.productSku ?? body?.productId
  const id = body?.productId
  const fromMap = lookupPetraWholesaleCost(sku, id)
  if (fromMap != null) return fromMap
  const legacy = body?.wholesaleCost
  if (legacy != null && legacy !== '') {
    const n = Number(legacy)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}
