/**
 * Fallback owner CMS defaults when Supabase tables are not migrated yet.
 */
import { BC_AUDIO_CATALOG, SHOP_STORES } from '~/utils/dropshipCatalogs.js'
import { BC_BRAND } from '~/utils/bcBrand.js'
import {
  FACILITATOR_ONE_LINER,
  HERO_LEDE,
  HERO_RIBBON,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  HERO_TITLE_SUB,
} from '~/utils/marketplaceFacilitatorCopy.js'

export const DEFAULT_HOMEPAGE = {
  heroRibbon: HERO_RIBBON,
  heroTitleLine1: HERO_TITLE_LINE_1,
  heroTitleLine2: HERO_TITLE_LINE_2,
  heroTitleSub: HERO_TITLE_SUB,
  heroLede: HERO_LEDE,
  facilitatorOneLiner: FACILITATOR_ONE_LINER,
  featuredStoreTitle: BC_BRAND.full,
  featuredStoreDesc: 'Competition subwoofers & amplifiers — automated dropship checkout with split-payment.',
  trustBlocks: [
    { title: 'Escrow protection', desc: 'Buyer confirms delivery before funds release.' },
    { title: 'COA & authenticity', desc: 'Seller-backed proof tools on collectible listings.' },
    { title: 'Dropship ready', desc: `Partner channels like ${BC_BRAND.full} ship from wholesale.` },
  ],
}

export const DEFAULT_ADS = {
  platforms: [
    {
      id: 'x',
      platform: 'X (Twitter)',
      format: 'Profile + pin tweet',
      text: `The Franks Standard — proof-first collectibles. COA · escrow · 4–5% fees · ${BC_BRAND.full} dropship partner.`,
      image: 'public/franks-pavilion.png',
      tip: 'Change @handle in X settings.',
    },
    {
      id: 'meta',
      platform: 'Meta (Facebook / Instagram)',
      format: 'Single image ad',
      text: 'Buy collectibles with seller proof on file. Escrow checkout on The Franks Standard.',
      image: 'public/franks-pavilion.png',
      tip: 'Use 1080×1080 square creative.',
    },
    {
      id: 'google',
      platform: 'Google Search',
      format: 'Responsive search ad',
      text: 'Collectibles Marketplace | Seller Proof & Escrow | The Franks Standard',
      image: 'N/A',
      tip: 'Link to /browse and /sell.',
    },
  ],
}

export function defaultDropshipStore () {
  const bc = SHOP_STORES.find((s) => s.id === 'bc-performance-audio')
  return {
    id: 'bc-performance-audio',
    slug: 'bc-performance-audio',
    name: BC_BRAND.full,
    tagline: BC_BRAND.tagline,
    accent: bc?.accent || '#d32f2f',
    is_live: true,
    hero_json: {
      eyebrow: 'Dropship partner store · The Franks Standard',
      slogan: BC_BRAND.tagline,
    },
  }
}

export function defaultDropshipCatalog () {
  return BC_AUDIO_CATALOG.map((item, index) => ({
    store_id: 'bc-performance-audio',
    item_id: item.id,
    brand: item.brand,
    name: item.name,
    tagline: item.tagline,
    retail_price: item.retailPrice,
    wholesale_cost: item.wholesaleCost,
    category: item.category,
    badge: item.badge || '',
    image: item.image || '/img/hero-showcase-v2.svg',
    specs: item.specs || [],
    sort_order: index,
    is_active: true,
  }))
}

export function catalogRowToGridItem (row, store) {
  const retail = Number(row.retail_price ?? row.retailPrice ?? 0)
  return {
    id: row.item_id || row.id,
    storeId: row.store_id || store?.id,
    brand: row.brand,
    name: row.name,
    tagline: row.tagline,
    retailPrice: retail,
    wholesaleCost: Number(row.wholesale_cost ?? row.wholesaleCost ?? 0),
    category: row.category,
    badge: row.badge,
    image: row.image,
    specs: Array.isArray(row.specs) ? row.specs : [],
    storeName: store?.name || BC_BRAND.full,
    storePath: '/shop',
    accent: store?.accent || '#d32f2f',
    formattedPrice: retail.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  }
}
