import { BC_BRAND } from '~/utils/bcBrand.js'

export const SHOP_STORES = [
  {
    id: 'bc-performance-audio',
    name: BC_BRAND.full,
    tagline: 'Competition car audio — authorized distribution',
    path: '/bc-audio',
    accent: '#d32f2f',
  },
  {
    id: 'store-directory',
    name: 'The Franks Standard',
    tagline: 'Multi-vendor marketplace',
    path: '/stores',
    accent: '#7c4dff',
  },
]

export function processCatalogArrays (catalogs) {
  const list = Array.isArray(catalogs) ? catalogs : []
  const rows = []
  for (const block of list) {
    const products = block?.products || block?.items || (Array.isArray(block) ? block : [])
    for (const p of products) {
      if (!p || typeof p !== 'object') continue
      rows.push({
        id: String(p.id || p.sku || p.vendorSku || p.code || p.name || ''),
        name: String(p.name || p.title || 'Product'),
        brand: String(p.brand || p.manufacturer || ''),
        category: String(p.category || p.shelf || 'Audio'),
        price: p.retailPrice ?? p.price,
        retailPrice: p.retailPrice ?? p.price,
        image: p.image || p.imageUrl || p.img,
        sku: p.sku || p.vendorSku,
      })
    }
  }
  return rows.filter((r) => r.id)
}
