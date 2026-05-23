/** Fallback marketplace tiles — local niche art first, no prices on samples. */
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
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=640&fit=crop&q=85&auto=format',
  },
  {
    id: 'sample-art',
    title: 'Gallery estate piece',
    category: 'Art & Antiques',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b89a?w=640&h=640&fit=crop&q=85&auto=format',
  },
  {
    id: 'sample-camera',
    title: 'Film body + glass',
    category: 'Photography & Film Gear',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=640&h=640&fit=crop&q=85&auto=format',
  },
  {
    id: 'sample-retro',
    title: 'Sealed retro hardware',
    category: 'Vintage Electronics & Games',
    image: 'https://images.unsplash.com/photo-1486401899862-58a69294a4d7?w=640&h=640&fit=crop&q=85&auto=format',
  },
]

/** When a live listing has no photo yet, pick art that matches the category. */
export const CATEGORY_FALLBACK_IMAGE = {
  'Musical Instruments': '/img/reel-guitars.svg',
  'Watches & Jewelry': '/img/reel-watches.svg',
  'Sports Cards & Memorabilia': '/img/reel-cards.svg',
  'Trading Card Games (Pokemon, MTG, etc.)': '/img/reel-cards.svg',
  'Coins & Currency': '/img/reel-coins.svg',
  'Sneakers & Streetwear': HOME_BROWSE_SAMPLES.find((s) => s.id === 'sample-sneaker').image,
  'Art & Antiques': HOME_BROWSE_SAMPLES.find((s) => s.id === 'sample-art').image,
  'Photography & Film Gear': HOME_BROWSE_SAMPLES.find((s) => s.id === 'sample-camera').image,
  'Vintage Electronics & Games': HOME_BROWSE_SAMPLES.find((s) => s.id === 'sample-retro').image,
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
