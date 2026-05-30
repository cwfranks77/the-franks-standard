/**
 * Category art for homepage showcase tiles — bundled SVGs (no external CDN).
 * Swap paths to your own listing photos when ready.
 */
export const CATEGORY_SHOWCASE_PHOTOS = {
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

/** Neutral fallback if a tile image fails at runtime */
export const SHOWCASE_IMAGE_FALLBACK = '/img/hero-showcase-v2.svg'

export function onShowcaseImageError (event) {
  const el = event?.target
  if (!el || el.dataset?.showcaseFallback) return
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
  { id: 'reel-1', title: 'Graded slabs', tag: 'Sports cards', image: CATEGORY_SHOWCASE_PHOTOS.cards, category: 'Sports Cards & Memorabilia' },
  { id: 'reel-2', title: 'Silver & gold', tag: 'Coins', image: CATEGORY_SHOWCASE_PHOTOS.coins, category: 'Coins & Currency' },
  { id: 'reel-3', title: 'Chronographs', tag: 'Watches', image: CATEGORY_SHOWCASE_PHOTOS.watches, category: 'Watches & Jewelry' },
  { id: 'reel-4', title: 'Deadstock heat', tag: 'Sneakers', image: CATEGORY_SHOWCASE_PHOTOS.sneakers, category: 'Sneakers & Streetwear' },
  { id: 'reel-5', title: 'Stage legends', tag: 'Guitars', image: CATEGORY_SHOWCASE_PHOTOS.guitars, category: 'Musical Instruments' },
  { id: 'reel-6', title: 'Gallery pieces', tag: 'Art', image: CATEGORY_SHOWCASE_PHOTOS.art, category: 'Art & Antiques' },
  { id: 'reel-7', title: 'Film & glass', tag: 'Cameras', image: CATEGORY_SHOWCASE_PHOTOS.camera, category: 'Photography & Film Gear' },
  { id: 'reel-8', title: 'Retro hardware', tag: 'Games', image: CATEGORY_SHOWCASE_PHOTOS.vintage, category: 'Vintage Electronics & Games' },
  { id: 'reel-9', title: 'Estate finds', tag: 'Collectibles', image: CATEGORY_SHOWCASE_PHOTOS.estate, category: 'Home & Estate Collectibles' },
  { id: 'reel-10', title: 'Key issues', tag: 'Comics', image: CATEGORY_SHOWCASE_PHOTOS.comics, category: 'Comics & Graphic Novels' },
]

/** Hero mosaic — proof-of-life collage */
export const HERO_MOSAIC_PHOTOS = [
  { image: CATEGORY_SHOWCASE_PHOTOS.cards, label: 'Slabbed cards' },
  { image: CATEGORY_SHOWCASE_PHOTOS.coins, label: 'Coins' },
  { image: CATEGORY_SHOWCASE_PHOTOS.watches, label: 'Watches' },
  { image: CATEGORY_SHOWCASE_PHOTOS.sneakers, label: 'Sneakers' },
  { image: CATEGORY_SHOWCASE_PHOTOS.guitars, label: 'Instruments' },
  { image: CATEGORY_SHOWCASE_PHOTOS.camera, label: 'Cameras' },
]
