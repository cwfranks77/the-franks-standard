/**
 * Niche focus & limited collections — differentiated from generic eBay browse.
 */

import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

export const SITE_URL = 'https://thefranksstandard.com'

/** Curated niches we promote (not all 30+ categories). */
export const NICHE_COLLECTIONS = [
  {
    slug: 'graded-sports-cards',
    name: 'Graded Sports Cards',
    icon: '🏆',
    category: 'Sports Cards & Memorabilia',
    tagline: 'PSA, BGS, SGC — every slab with COA or signed guarantee, not anonymous C2C.',
    ebayAngle: 'eBay has volume; we have mandatory proof + escrow on every card listing.',
    buyerHook: 'Collectors who are tired of "is this real?" threads before they bid.',
  },
  {
    slug: 'coins-currency',
    name: 'Coins & Currency',
    icon: '🪙',
    category: 'Coins & Currency',
    tagline: 'Numismatics with documentation — graded coins, bullion, certified currency.',
    ebayAngle: 'Specialty buyers want provenance, not a blurry photo and hope.',
    buyerHook: 'Serious stackers and registry collectors.',
  },
  {
    slug: 'tcg-sealed',
    name: 'TCG & Sealed Product',
    icon: '🃏',
    category: 'Trading Card Games (Pokemon, MTG, etc.)',
    tagline: 'Sealed boxes and graded singles with condition notes buyers can trust.',
    ebayAngle: 'Fight reseals and authenticity drama with proof-first listings.',
    buyerHook: 'Players and sealed investors.',
  },
  {
    slug: 'comics-key-issues',
    name: 'Comics & Key Issues',
    icon: '📚',
    category: 'Comics & Graphic Novels',
    tagline: 'Slabs, signatures, and key issues — exclusivity without the flea-market gamble.',
    ebayAngle: 'Highlight rare keys eBay buries in endless search results.',
    buyerHook: 'Key issue hunters and slab collectors.',
  },
  {
    slug: 'vintage-watches',
    name: 'Watches & Jewelry',
    icon: '⌚',
    category: 'Watches & Jewelry',
    tagline: 'Timepieces and certified gems — high-trust category, platform-enforced guarantees.',
    ebayAngle: 'Authentication disputes are expensive; we require proof up front.',
    buyerHook: 'Watch collectors who want video inspect + escrow.',
  },
  {
    slug: 'sneakers-streetwear',
    name: 'Sneakers & Streetwear',
    icon: '👟',
    category: 'Sneakers & Streetwear',
    tagline: 'Limited drops and authenticated kicks — exclusivity meets secure checkout.',
    ebayAngle: 'Limited pairs deserve limited drama, not 13% fees and DM scams.',
    buyerHook: 'Hype wear buyers and boutique resellers.',
  },
]

/** Scheduled / thematic limited drops (marketing campaigns). */
export const LIMITED_DROPS = [
  {
    slug: 'floor-drop-psa-week',
    label: 'Floor Drop: PSA Slab Week',
    subtitle: 'Limited spotlight on graded sports cards',
    icon: '🏆',
    categories: ['Sports Cards & Memorabilia'],
    endsLabel: 'While listings last',
    promoLine: `COA required · Stripe escrow · ${PRICING_PUBLIC.txRangeLabel} fees`,
    ctaPath: '/sell',
  },
  {
    slug: 'floor-drop-coin-collectors',
    label: 'Floor Drop: Coin Collectors',
    subtitle: 'Numismatics with proof, not guesswork',
    icon: '🪙',
    categories: ['Coins & Currency'],
    endsLabel: 'Ongoing niche focus',
    promoLine: 'Video inspect available on high-value lots',
    ctaPath: '/sell',
  },
  {
    slug: 'floor-drop-sealed-tcg',
    label: 'Floor Drop: Sealed TCG',
    subtitle: 'Booster boxes & sealed product',
    icon: '📦',
    categories: ['Trading Card Games (Pokemon, MTG, etc.)'],
    endsLabel: 'New sellers welcome',
    promoLine: 'Import your eBay sealed inventory in one CSV',
    ctaPath: '/sell/import',
  },
]

export function getNicheBySlug (slug) {
  return NICHE_COLLECTIONS.find((n) => n.slug === slug) || null
}

export function getLimitedDropBySlug (slug) {
  return LIMITED_DROPS.find((d) => d.slug === slug) || null
}

/** Detect limited-edition intent from listing row (DB flag or title). */
export function isLimitedEditionListing (row = {}) {
  if (row.is_limited_edition === true) return true
  const label = String(row.collection_label || row.limited_edition_label || '').trim()
  if (label) return true
  const t = `${row.title || ''} ${row.description || ''}`.toLowerCase()
  return /\blimited edition\b|\b1\s*of\s*\d+\b|\bexclusive drop\b|\bfloor drop\b|\bnumbered\s*\/\s*\d+/.test(t)
}

const LIMITED_RE = /\b(limited edition|1 of \d+|exclusive drop|floor drop)\b/i

export function limitedBadgeLabel (row = {}) {
  if (row.collection_label) return row.collection_label
  if (row.limited_edition_label) return row.limited_edition_label
  const m = String(row.title || '').match(LIMITED_RE)
  if (m) return 'Limited'
  if (row.is_limited_edition) return 'Limited edition'
  return ''
}

export function collectionBrowseQuery (niche) {
  return { path: '/browse', query: { category: niche.category } }
}

export function limitedBrowseQuery (extra = {}) {
  return { path: '/browse', query: { limited: '1', ...extra } }
}

export function promoCampaignCopy (niche) {
  return [
    `${niche.name} on The Franks Standard`,
    niche.tagline,
    '',
    `Why not just eBay? ${niche.ebayAngle}`,
    '',
    'Every item: COA or signed in-platform guarantee.',
    'Checkout: Stripe escrow — paid when buyer confirms delivery.',
    `Fees: ${PRICING_PUBLIC.txRangeLabel} by plan (${PRICING_PUBLIC.launchTxPromoPercent}% launch promo).`,
    '',
    `Browse: ${SITE_URL}/collections/${niche.slug}`,
    `Sell: ${SITE_URL}/sell`,
  ].join('\n')
}

export const COLLECTION_SLUG_OPTIONS = [
  { value: '', label: 'No collection tag' },
  ...NICHE_COLLECTIONS.map((n) => ({ value: n.slug, label: n.name })),
  ...LIMITED_DROPS.map((d) => ({ value: d.slug, label: d.label })),
]
