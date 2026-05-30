/** Category preview tiles — real photography for floor preview. */
import { CATEGORY_SHOWCASE_PHOTOS } from '~/utils/marketplaceShowcaseImages.js'

const P = CATEGORY_SHOWCASE_PHOTOS

export const HOME_BROWSE_SAMPLES = [
  { id: 'sample-guitar', title: 'Vintage stage rig', category: 'Musical Instruments', image: P.guitars, showcaseKey: 'guitars' },
  { id: 'sample-watch', title: 'Certified chronograph', category: 'Watches & Jewelry', image: P.watches, showcaseKey: 'watches' },
  { id: 'sample-cards', title: 'Graded slab pickup', category: 'Sports Cards & Memorabilia', image: P.cards, showcaseKey: 'cards' },
  { id: 'sample-coins', title: 'Slabbed silver lot', category: 'Coins & Currency', image: P.coins, showcaseKey: 'coins' },
  { id: 'sample-sneaker', title: 'Authenticated deadstock', category: 'Sneakers & Streetwear', image: P.sneakers, showcaseKey: 'sneakers' },
  { id: 'sample-art', title: 'Gallery estate piece', category: 'Art & Antiques', image: P.art, showcaseKey: 'art' },
  { id: 'sample-camera', title: 'Film body + glass', category: 'Photography & Film Gear', image: P.camera, showcaseKey: 'camera' },
  { id: 'sample-retro', title: 'Sealed retro hardware', category: 'Vintage Electronics & Games', image: P.vintage, showcaseKey: 'vintage' },
  { id: 'sample-estate', title: 'Estate desk find', category: 'Home & Estate Collectibles', image: P.estate, showcaseKey: 'estate' },
]

/** When a listing has no photo, pick art that matches the category. */
export const CATEGORY_FALLBACK_IMAGE = {
  'Musical Instruments': P.guitars,
  'Watches & Jewelry': P.watches,
  'Sports Cards & Memorabilia': P.cards,
  'Trading Card Games (Pokemon, MTG, etc.)': P.cards,
  'Coins & Currency': P.coins,
  'Sneakers & Streetwear': P.sneakers,
  'Art & Antiques': P.art,
  'Photography & Film Gear': P.camera,
  'Vintage Electronics & Games': P.vintage,
  'Home & Estate Collectibles': P.estate,
  'Comics & Graphic Novels': P.comics,
  'Other (describe in listing)': P.estate,
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
