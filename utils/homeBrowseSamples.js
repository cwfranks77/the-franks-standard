/** Fallback marketplace photos when few/no live listings (Unsplash, crop-safe). */
export const HOME_BROWSE_SAMPLES = [
  {
    id: 'sample-watch',
    title: 'Steel chronograph',
    category: 'Watches',
    price: 1250,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-guitar',
    title: 'Stage electric',
    category: 'Musical instruments',
    price: 890,
    image: 'https://images.unsplash.com/photo-1516924962504-8b5545432ca2?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-sneaker',
    title: 'Deadstock runners',
    category: 'Sneakers',
    price: 220,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-vinyl',
    title: 'Original press vinyl',
    category: 'Music & media',
    price: 45,
    image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-camera',
    title: 'Film camera body',
    category: 'Cameras & optics',
    price: 340,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-art',
    title: 'Gallery canvas',
    category: 'Art & antiques',
    price: 680,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b89a?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-coins',
    title: 'Slabbed silver',
    category: 'Coins & currency',
    price: 175,
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=600&fit=crop&q=80',
  },
  {
    id: 'sample-phone',
    title: 'Vintage crank phone',
    category: 'Collectibles',
    price: 95,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=80',
  },
]

export function shuffleItems (list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}