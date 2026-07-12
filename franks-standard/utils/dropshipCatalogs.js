/**
 * Dropship store registry + catalog arrays for homepage grid processing.
 * B&C Performance Audio is the live partner store; others are opening soon.
 */

import { BC_BRAND } from '~/utils/bcBrand.js'

export const SHOP_STORES = [
  {
    id: 'bc-performance-audio',
    name: BC_BRAND.full,
    slug: 'bc-performance-audio',
    path: '/bc-audio',
    /** Set NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL for a standalone marketing site (opens in new tab). */
    externalUrlEnv: 'NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL',
    tagline: 'Competition-grade subwoofers, amps & staging — dropship fulfillment',
    accent: '#d32f2f',
    status: 'live',
    dropship: true,
  },
  {
    id: 'brandy-sporting',
    name: "Brandy's Sporting Goods",
    slug: 'brandysportinggoods',
    path: '/store/brandysportinggoods',
    tagline: 'Outdoor, fitness & sporting gear — coming soon',
    accent: '#146eb4',
    status: 'coming-soon',
    comingSoon: true,
    dropship: true,
  },
  {
    id: 'store-directory',
    name: 'All partner stores',
    slug: 'stores',
    path: '/stores',
    tagline: 'Browse every storefront on the marketplace',
    accent: '#7a8190',
    status: 'directory',
    dropship: false,
  },
]

export function isShopStoreComingSoon (store) {
  if (!store) return false
  if (store.comingSoon || store.status === 'coming-soon') return true
  return false
}

/** B&C Performance Audio — live dropship catalog (mirrors /shop inventory) */
export const BC_AUDIO_CATALOG = [
  {
    id: 'prod-sub-12',
    storeId: 'bc-performance-audio',
    brand: 'Kicker',
    name: 'Solobaric L7S 12-Inch Subwoofer',
    tagline: 'Square Cone Technology for Extreme Bass Output',
    retailPrice: 349.99,
    wholesaleCost: 210.0,
    category: 'Subwoofers',
    badge: 'Hot Seller',
    image: '/img/hero-showcase-v2.svg',
    specs: ['1500W Peak Power', 'Dual 4-Ohm Voice Coil', 'Signature Double Blue Stitching'],
  },
  {
    id: 'prod-amp-1200',
    storeId: 'bc-performance-audio',
    brand: 'Rockford Fosgate',
    name: 'Punch P1000X1BD Mono Amplifier',
    tagline: 'Class-BD Constant Power Optimization Matrix',
    retailPrice: 429.99,
    wholesaleCost: 265.0,
    category: 'Amplifiers',
    badge: 'Top Rated',
    image: '/img/hero-showcase-v2.svg',
    specs: ['1000 Watts RMS @ 1-Ohm', 'Punch EQ Differential Control', 'Cast Aluminum Stealth Heatsink'],
  },
]

/**
 * Flatten catalog arrays from one or more stores into grid-ready rows.
 * @param {Array<{ storeId: string, items?: object[] } | object[]>} sources
 */
export function processCatalogArrays (sources) {
  const rows = []
  for (const source of sources) {
    if (Array.isArray(source)) {
      for (const item of source) {
        if (item?.id) rows.push(normalizeCatalogItem(item))
      }
      continue
    }
    const items = source.items || source.catalog || []
    const storeId = source.storeId || source.id
    for (const item of items) {
      rows.push(normalizeCatalogItem({ ...item, storeId: item.storeId || storeId }))
    }
  }
  return rows
}

function normalizeCatalogItem (item) {
  const store = SHOP_STORES.find((s) => s.id === item.storeId) || SHOP_STORES[0]
  return {
    ...item,
    storeName: store.name,
    storePath: store.path,
    accent: store.accent,
    formattedPrice: typeof item.retailPrice === 'number'
      ? item.retailPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : item.retailPrice,
  }
}

/** All dropship catalogs combined for homepage grid */
export function getHomeDropshipCatalogs () {
  return processCatalogArrays([BC_AUDIO_CATALOG])
}
