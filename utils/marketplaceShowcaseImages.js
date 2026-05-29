/**
 * Real collectible photography for homepage showcase (Unsplash CDN).
 * Central source — swap to your own listing photos when ready.
 */
export function showcasePhoto (photoId, width = 800) {
  return `https://images.unsplash.com/${photoId}?w=${width}&q=82&auto=format&fit=crop`
}

/** Category → hero-quality photo */
export const CATEGORY_SHOWCASE_PHOTOS = {
  cards: showcasePhoto('photo-1606111115765-02aebe61a70d', 640),
  coins: showcasePhoto('photo-1624365168968-f283d496dafa', 640),
  watches: showcasePhoto('photo-1523170335258-f5c6d6ecc2e9', 640),
  sneakers: showcasePhoto('photo-1542291026-7eec264c27ff', 640),
  guitars: showcasePhoto('photo-1516920040974-1f47fbf54b2f', 640),
  art: showcasePhoto('photo-1579783902614-a3fb3927b6a5', 640),
  camera: showcasePhoto('photo-1526170375885-4d8ecf77b99f', 640),
  vintage: showcasePhoto('photo-1550745165-9bc0b252726f', 640),
  estate: showcasePhoto('photo-1558618666-fcd25c85cd64', 640),
  comics: showcasePhoto('photo-1612036781340-922b57262d08', 640),
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
  { image: showcasePhoto('photo-1606111115765-02aebe61a70d', 520), label: 'Slabbed cards' },
  { image: showcasePhoto('photo-1624365168968-f283d496dafa', 520), label: 'Coins' },
  { image: showcasePhoto('photo-1523170335258-f5c6d6ecc2e9', 520), label: 'Watches' },
  { image: showcasePhoto('photo-1542291026-7eec264c27ff', 520), label: 'Sneakers' },
  { image: showcasePhoto('photo-1516920040974-1f47fbf54b2f', 520), label: 'Instruments' },
  { image: showcasePhoto('photo-1526170375885-4d8ecf77b99f', 520), label: 'Cameras' },
]
