import wholesaleMap from './petraWholesaleBySku.json' with { type: 'json' }

const map = wholesaleMap as Record<string, number>

function pickWholesale (key: unknown): number | null {
  if (key == null || key === '') return null
  const raw = String(key).trim()
  for (const k of [raw, raw.toUpperCase(), raw.toLowerCase()]) {
    const hit = map[k]
    if (hit != null) {
      const n = Number(hit)
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return null
}

export function lookupPetraWholesaleCost (productSku: unknown, productId?: unknown): number | null {
  return pickWholesale(productSku) ?? pickWholesale(productId)
}

export function resolveBcCheckoutWholesale (body: Record<string, unknown>): number | null {
  const fromMap = lookupPetraWholesaleCost(body.productSku ?? body.productId, body.productId)
  if (fromMap != null) return fromMap
  const legacy = body.wholesaleCost
  if (legacy != null && legacy !== '') {
    const n = Number(legacy)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}
