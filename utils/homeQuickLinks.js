/**
 * Homepage quick navigation — dense departments + role-based shortcuts.
 */
import { CATEGORY_FALLBACK_IMAGE } from '~/utils/homeBrowseSamples.js'

export const HOME_DEPARTMENTS = [
  { shortLabel: 'Sports cards', name: 'Sports Cards & Memorabilia', image: '/img/reel-cards.svg' },
  { shortLabel: 'Coins', name: 'Coins & Currency', image: '/img/reel-coins.svg' },
  { shortLabel: 'Watches', name: 'Watches & Jewelry', image: '/img/reel-watches.svg' },
  { shortLabel: 'Sneakers', name: 'Sneakers & Streetwear', image: '/img/reel-sneakers.svg' },
  { shortLabel: 'Guitars', name: 'Musical Instruments', image: '/img/reel-guitars.svg' },
  { shortLabel: 'Art', name: 'Art & Antiques', image: '/img/reel-art.svg' },
  { shortLabel: 'Cameras', name: 'Photography & Film Gear', image: '/img/reel-camera.svg' },
  { shortLabel: 'Retro games', name: 'Vintage Electronics & Games', image: '/img/reel-vintage.svg' },
  { shortLabel: 'Estate finds', name: 'Home & Estate Collectibles', image: '/img/reel-estate.svg' },
  { shortLabel: 'TCG', name: 'Trading Card Games (Pokemon, MTG, etc.)', image: '/img/reel-cards.svg' },
  { shortLabel: 'Comics', name: 'Comics & Graphic Novels', image: '/img/reel-art.svg' },
  { shortLabel: 'All categories', name: '', image: '/img/reel-cards.svg', to: '/categories' },
]

export function departmentBrowseTo (dept) {
  if (dept.to) return dept.to
  if (!dept.name) return '/categories'
  return { path: '/browse', query: { category: dept.name } }
}

export const HOME_BUYER_SHORTCUTS = [
  { label: 'Search floor', hint: 'Filters & sort', to: '/browse', image: '/img/reel-cards.svg' },
  { label: 'Collections', hint: 'Curated floors', to: '/collections', image: '/img/reel-coins.svg' },
  { label: 'Verify COA', hint: 'Scan serial', to: '/verify/coa/FS-2026-000001', image: '/img/reel-watches.svg' },
  { label: 'Video inspect', hint: 'Live rooms', to: '/video', image: '/img/reel-camera.svg' },
  { label: 'Protection', hint: 'Escrow rules', to: '/protection', image: '/img/reel-estate.svg' },
  { label: 'How to buy', hint: 'Step-by-step', to: '/how-it-works', image: '/img/reel-art.svg' },
]

export const HOME_SELLER_SHORTCUTS = [
  { label: 'List item', hint: 'COA required', to: '/sell', image: '/img/reel-guitars.svg' },
  { label: 'Import eBay', hint: 'CSV / skim', to: '/sell/import', image: '/img/reel-cards.svg' },
  { label: 'Store builder', hint: 'AI bios & SEO', to: '/store-builder', image: '/img/reel-watches.svg' },
  { label: 'Dropship', hint: 'Supplier wizard', to: '/sell/dropship-setup', image: '/img/reel-sneakers.svg' },
  { label: 'Pricing', hint: '4–5% fees', to: '/pricing', image: '/img/reel-coins.svg' },
  { label: 'Top sellers', hint: 'Volume rewards', to: '/top-sellers', image: '/img/reel-art.svg' },
  { label: 'Seller hub', hint: 'Stores & pros', to: '/sellers', image: '/img/reel-estate.svg' },
  { label: 'Dashboard', hint: 'Orders & listings', to: '/dashboard', image: '/img/reel-camera.svg' },
]

export function imageForCategory (categoryName) {
  return CATEGORY_FALLBACK_IMAGE[categoryName] || '/img/reel-estate.svg'
}
