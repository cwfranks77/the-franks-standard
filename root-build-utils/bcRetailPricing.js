/**
 * B&C retail markup rules — keep aligned with scripts/import-petra-prodlist.cjs
 */

export function resolveCategoryMarkup (category, name) {
  const cat = String(category || '').toLowerCase()
  const label = String(name || '').toLowerCase()
  if (cat.includes('marine') || label.includes('marine')) return 2.10
  if (cat.includes('car') || label.includes('car audio') || label.includes('subwoofer') || label.includes('amplifier')) return 1.55
  if (cat.includes('home') || label.includes('receiver') || label.includes('soundbar') || label.includes('theater')) return 1.70
  if (cat.includes('accessory') || label.includes('cable') || label.includes('mount') || label.includes('adapter')) return 2.50
  if (cat.includes('electronics') || cat.includes('computer') || cat.includes('workstation')) return 1.35
  return 1.55
}

export function computeRetailFromWholesale (wholesale, category, name) {
  const w = Number(wholesale)
  if (!Number.isFinite(w) || w <= 0) return null
  return Number((w * resolveCategoryMarkup(category, name)).toFixed(2))
}

export function markupPercent (wholesale, retail) {
  const w = Number(wholesale)
  const r = Number(retail)
  if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r <= 0) return null
  return Number(((r / w - 1) * 100).toFixed(1))
}

/** Customer-facing price only — never returns wholesale. */
export function resolveCustomerRetailPrice (product, overrides = {}) {
  const id = String(product?.id || '')
  const row = overrides[id]
  if (row != null && typeof row === 'object' && row.retailPrice != null) {
    const n = Number(row.retailPrice)
    if (Number.isFinite(n) && n > 0) return n
  }
  if (row != null && typeof row === 'number') {
    const n = Number(row)
    if (Number.isFinite(n) && n > 0) return n
  }
  const listed = Number(product?.retailPrice ?? product?.price)
  if (Number.isFinite(listed) && listed > 0) return listed
  return null
}

export function stripWholesaleFromProduct (product) {
  if (!product || typeof product !== 'object') return product
  const {
    _wholesale,
    wholesaleCost,
    wholesale_cost,
    wholesalePrice,
    wholesale,
    baseCost,
    ...safe
  } = product
  return safe
}

export function withCustomerRetailOnly (product, overrides = {}) {
  const retail = resolveCustomerRetailPrice(product, overrides)
  const safe = stripWholesaleFromProduct(product)
  return {
    ...safe,
    price: retail,
    retailPrice: retail,
  }
}

export const BC_HOMEPAGE_DEFAULTS = {
  ribbonLeft: '🔊 B&C PERFORMANCE AUDIO — AUTHORIZED DISTRIBUTION CENTER',
  ribbonRight: 'Sovereign Dealer Network',
  heroTitle: 'Competition Audio Inventory',
  heroLede: 'Home audio, car audio, and powersports audio — filter by department above.',
}
