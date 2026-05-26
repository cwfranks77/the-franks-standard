/** Category preview tiles — local niche art only (no stock photos). */
export const HOME_BROWSE_SAMPLES = [
  {
    id: 'sample-guitar',
    title: 'Vintage stage rig',
    category: 'Musical Instruments',
    image: '/img/reel-guitars.svg',
  },
  {
    id: 'sample-watch',
    title: 'Certified chronograph',
    category: 'Watches & Jewelry',
    image: '/img/reel-watches.svg',
  },
  {
    id: 'sample-cards',
    title: 'Graded slab pickup',
    category: 'Sports Cards & Memorabilia',
    image: '/img/reel-cards.svg',
  },
  {
    id: 'sample-coins',
    title: 'Slabbed silver lot',
    category: 'Coins & Currency',
    image: '/img/reel-coins.svg',
  },
  {
    id: 'sample-sneaker',
    title: 'Authenticated deadstock',
    category: 'Sneakers & Streetwear',
    image: '/img/reel-sneakers.svg',
  },
  {
    id: 'sample-art',
    title: 'Gallery estate piece',
    category: 'Art & Antiques',
    image: '/img/reel-art.svg',
  },
  {
    id: 'sample-camera',
    title: 'Film body + glass',
    category: 'Photography & Film Gear',
    image: '/img/reel-camera.svg',
  },
  {
    id: 'sample-retro',
    title: 'Sealed retro hardware',
    category: 'Vintage Electronics & Games',
    image: '/img/reel-vintage.svg',
  },
  {
    id: 'sample-estate',
    title: 'Estate desk find',
    category: 'Home & Estate Collectibles',
    image: '/img/reel-estate.svg',
  },
]

/** When a listing has no photo, pick art that matches the category. */
export const CATEGORY_FALLBACK_IMAGE = {
  'Musical Instruments': '/img/reel-guitars.svg',
  'Watches & Jewelry': '/img/reel-watches.svg',
  'Sports Cards & Memorabilia': '/img/reel-cards.svg',
  'Trading Card Games (Pokemon, MTG, etc.)': '/img/reel-cards.svg',
  'Coins & Currency': '/img/reel-coins.svg',
  'Sneakers & Streetwear': '/img/reel-sneakers.svg',
  'Art & Antiques': '/img/reel-art.svg',
  'Photography & Film Gear': '/img/reel-camera.svg',
  'Vintage Electronics & Games': '/img/reel-vintage.svg',
  'Home & Estate Collectibles': '/img/reel-estate.svg',
  'Other (describe in listing)': '/img/reel-estate.svg',
}

export function shuffleItems (list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function browseLinkForCategory (category) {
  if (!category) return '/browse'
  return `/browse?category=${encodeURIComponent(category)}`
}
