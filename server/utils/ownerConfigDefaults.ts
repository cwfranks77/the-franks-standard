/** Server-side owner CMS defaults (no ~/ aliases — safe for Nitro). */

const BC_FULL = 'B&C Performance Audio'
const BC_TAGLINE = 'Unmatched Power. Crystal Clarity. Competition Grade Sound.'

const BC_CATALOG = [
  {
    id: 'prod-sub-12',
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

export const DEFAULT_HOMEPAGE = {
  heroRibbon: 'Marketplace facilitator · seller-backed proof on collectibles',
  heroTitleLine1: 'If it is here,',
  heroTitleLine2: 'the seller put proof on file.',
  heroTitleSub: 'We screen and enforce — we do not certify or guarantee authenticity.',
  heroLede:
    'The Franks Standard LLC is a marketplace facilitator, not the seller of listed items and not a guarantor of genuineness.',
  facilitatorOneLiner:
    'Marketplace facilitator only — sellers back collectible listings; we do not warrant or represent any item as authentic.',
  featuredStoreTitle: BC_FULL,
  featuredStoreDesc: 'Competition subwoofers & amplifiers — automated dropship checkout with split-payment.',
  trustBlocks: [
    { title: 'Escrow protection', desc: 'Buyer confirms delivery before funds release.' },
    { title: 'COA & authenticity', desc: 'Seller-backed proof tools on collectible listings.' },
    { title: 'Dropship ready', desc: `Partner channels like ${BC_FULL} ship from wholesale.` },
  ],
}

export const DEFAULT_ADS = {
  platforms: [
    {
      id: 'x',
      platform: 'X (Twitter)',
      format: 'Profile + pin tweet',
      text: `The Franks Standard — proof-first collectibles. COA · escrow · 4–5% fees · ${BC_FULL} dropship partner.`,
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
  return {
    id: 'bc-performance-audio',
    slug: 'bc-performance-audio',
    name: BC_FULL,
    tagline: BC_TAGLINE,
    accent: '#d32f2f',
    is_live: true,
    hero_json: {
      eyebrow: 'Dropship partner store · The Franks Standard',
      slogan: BC_TAGLINE,
    },
  }
}

export function defaultDropshipCatalog () {
  return BC_CATALOG.map((item, index) => ({
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

export function catalogRowToGridItem (row: Record<string, unknown>, store?: Record<string, unknown>) {
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
    storeName: store?.name || BC_FULL,
    storePath: '/shop',
    accent: store?.accent || '#d32f2f',
    formattedPrice: retail.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  }
}
