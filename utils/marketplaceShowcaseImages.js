/**
 * Category photography for homepage showcase tiles.
 * Uses Unsplash CDN (free to hotlink). SVGs kept as offline/error fallback only.
 */

const unsplash = (photoId, w = 800, h = 520) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

/** Bundled SVG fallbacks when CDN is blocked or slow */
export const CATEGORY_SHOWCASE_SVG = {
  cards: '/img/reel-cards.svg',
  coins: '/img/reel-coins.svg',
  watches: '/img/reel-watches.svg',
  sneakers: '/img/reel-sneakers.svg',
  guitars: '/img/reel-guitars.svg',
  art: '/img/reel-art.svg',
  camera: '/img/reel-camera.svg',
  vintage: '/img/reel-vintage.svg',
  estate: '/img/reel-estate.svg',
  comics: '/img/reel-cards.svg',
}

/** Real photography — category-appropriate */
export const CATEGORY_SHOWCASE_PHOTOS = {
  cards: unsplash('1579952363873-27f960bca3bb'),
  coins: unsplash('1610375353800-c6ae7e8c3d60'),
  watches: unsplash('1523275335684-37898b6baf30'),
  sneakers: unsplash('1542291026-7eec264c27ff'),
  guitars: unsplash('1516924962500-2b4b54b6feb6'),
  art: unsplash('1578301978018-4d0a2b657ca7'),
  camera: unsplash('1516035069371-29a1b244cc32'),
  vintage: unsplash('1550745165-9bc0b252726f'),
  estate: unsplash('1582719478250-c89cae4dc85b'),
  comics: unsplash('1612036781343-3365e05e6e42'),
}

/** Neutral fallback if a tile image fails at runtime */
export const SHOWCASE_IMAGE_FALLBACK = unsplash('1610701596007-094a7e0f1f2c', 800, 520)

export function onShowcaseImageError (event) {
  const el = event?.target
  if (!el || el.dataset?.showcaseFallback) return
  const key = el.dataset?.showcaseKey
  if (key && CATEGORY_SHOWCASE_SVG[key]) {
    el.dataset.showcaseFallback = 'svg'
    el.src = CATEGORY_SHOWCASE_SVG[key]
    return
  }
  el.dataset.showcaseFallback = '1'
  el.src = SHOWCASE_IMAGE_FALLBACK
}

/** Listing grid cards — category-aware fallback when Supabase/CDN URL fails */
export function onListingImageError (event) {
  const el = event?.target
  if (!el || el.dataset?.listingFallback) return
  el.dataset.listingFallback = '1'
  const category = el.dataset?.category || ''
  el.src = categoryFallbackImage(category)
}

const CATEGORY_NAME_TO_KEY = {
  'Musical Instruments': 'guitars',
  'Watches & Jewelry': 'watches',
  'Sports Cards & Memorabilia': 'cards',
  'Trading Card Games (Pokemon, MTG, etc.)': 'cards',
  'Coins & Currency': 'coins',
  'Sneakers & Streetwear': 'sneakers',
  'Art & Antiques': 'art',
  'Photography & Film Gear': 'camera',
  'Vintage Electronics & Games': 'vintage',
  'Home & Estate Collectibles': 'estate',
  'Comics & Graphic Novels': 'comics',
}

export function categoryFallbackImage (categoryName) {
  const key = CATEGORY_NAME_TO_KEY[categoryName]
  return (key && CATEGORY_SHOWCASE_PHOTOS[key]) || SHOWCASE_IMAGE_FALLBACK
}

/** Featured “floor” moments for scrolling reel */
export const SHOWCASE_REEL_ITEMS = [
  { id: 'reel-1', title: 'Graded slabs', tag: 'Sports cards', image: CATEGORY_SHOWCASE_PHOTOS.cards, showcaseKey: 'cards', category: 'Sports Cards & Memorabilia' },
  { id: 'reel-2', title: 'Silver & gold', tag: 'Coins', image: CATEGORY_SHOWCASE_PHOTOS.coins, showcaseKey: 'coins', category: 'Coins & Currency' },
  { id: 'reel-3', title: 'Chronographs', tag: 'Watches', image: CATEGORY_SHOWCASE_PHOTOS.watches, showcaseKey: 'watches', category: 'Watches & Jewelry' },
  { id: 'reel-4', title: 'Deadstock heat', tag: 'Sneakers', image: CATEGORY_SHOWCASE_PHOTOS.sneakers, showcaseKey: 'sneakers', category: 'Sneakers & Streetwear' },
  { id: 'reel-5', title: 'Stage legends', tag: 'Guitars', image: CATEGORY_SHOWCASE_PHOTOS.guitars, showcaseKey: 'guitars', category: 'Musical Instruments' },
  { id: 'reel-6', title: 'Gallery pieces', tag: 'Art', image: CATEGORY_SHOWCASE_PHOTOS.art, showcaseKey: 'art', category: 'Art & Antiques' },
  { id: 'reel-7', title: 'Film & glass', tag: 'Cameras', image: CATEGORY_SHOWCASE_PHOTOS.camera, showcaseKey: 'camera', category: 'Photography & Film Gear' },
  { id: 'reel-8', title: 'Retro hardware', tag: 'Games', image: CATEGORY_SHOWCASE_PHOTOS.vintage, showcaseKey: 'vintage', category: 'Vintage Electronics & Games' },
  { id: 'reel-9', title: 'Estate finds', tag: 'Collectibles', image: CATEGORY_SHOWCASE_PHOTOS.estate, showcaseKey: 'estate', category: 'Home & Estate Collectibles' },
  { id: 'reel-10', title: 'Key issues', tag: 'Comics', image: CATEGORY_SHOWCASE_PHOTOS.comics, showcaseKey: 'comics', category: 'Comics & Graphic Novels' },
]

/** Hero mosaic — proof-of-life collage */
export const HERO_MOSAIC_PHOTOS = [
  { image: CATEGORY_SHOWCASE_PHOTOS.cards, showcaseKey: 'cards', label: 'Slabbed cards' },
  { image: CATEGORY_SHOWCASE_PHOTOS.coins, showcaseKey: 'coins', label: 'Coins' },
  { image: CATEGORY_SHOWCASE_PHOTOS.watches, showcaseKey: 'watches', label: 'Watches' },
  { image: CATEGORY_SHOWCASE_PHOTOS.sneakers, showcaseKey: 'sneakers', label: 'Sneakers' },
  { image: CATEGORY_SHOWCASE_PHOTOS.guitars, showcaseKey: 'guitars', label: 'Instruments' },
  { image: CATEGORY_SHOWCASE_PHOTOS.camera, showcaseKey: 'camera', label: 'Cameras' },
]

/** Thumbnail for live-feature / shortcut cards by feature title */
const FEATURE_TITLE_TO_KEY = {
  'Browse & buy': 'cards',
  'Escrow checkout': 'watches',
  'Verify COA serial': 'coins',
  'Video inspect rooms': 'camera',
  'Collections': 'art',
  'Report concerns': 'estate',
  'Coin authentication guide': 'coins',
  'Sell & list': 'guitars',
  'eBay import': 'cards',
  'AI store builder': 'art',
  'Dropship setup': 'sneakers',
  'Low sale fees': 'coins',
  'Seller reviews': 'watches',
  'Seller proof on collectibles': 'cards',
  'Floor office COA': 'coins',
  'Stripe escrow': 'watches',
  'Authenticity education': 'coins',
  'Listing authenticity scan': 'camera',
  'Forced refund policy': 'estate',
  'Account freeze enforcement': 'estate',
  'Seller policy signature': 'art',
  FOUNDERS10: 'guitars',
  HONOR26: 'watches',
  'Seller Excellence': 'cards',
  'Launch fee promo': 'coins',
  'Store partner program': 'estate',
  'Open Door + Help': 'art',
}

export function featureShowcaseImage (title) {
  const key = FEATURE_TITLE_TO_KEY[title]
  return (key && CATEGORY_SHOWCASE_PHOTOS[key]) || CATEGORY_SHOWCASE_PHOTOS.cards
}
