/**
 * Homepage quick navigation — dense departments + role-based shortcuts.
 */
import { CATEGORY_SHOWCASE_PHOTOS } from '~/utils/marketplaceShowcaseImages.js'

const P = CATEGORY_SHOWCASE_PHOTOS

export const HOME_DEPARTMENTS = [
  { shortLabel: 'Sports cards', name: 'Sports Cards & Memorabilia', image: P.cards },
  { shortLabel: 'Coins', name: 'Coins & Currency', image: P.coins },
  { shortLabel: 'Watches', name: 'Watches & Jewelry', image: P.watches },
  { shortLabel: 'Sneakers', name: 'Sneakers & Streetwear', image: P.sneakers },
  { shortLabel: 'Guitars', name: 'Musical Instruments', image: P.guitars },
  { shortLabel: 'Art', name: 'Art & Antiques', image: P.art },
  { shortLabel: 'Cameras', name: 'Photography & Film Gear', image: P.camera },
  { shortLabel: 'Retro games', name: 'Vintage Electronics & Games', image: P.vintage },
  { shortLabel: 'Estate finds', name: 'Home & Estate Collectibles', image: P.estate },
  { shortLabel: 'TCG', name: 'Trading Card Games (Pokemon, MTG, etc.)', image: P.cards },
  { shortLabel: 'Comics', name: 'Comics & Graphic Novels', image: P.comics },
  { shortLabel: 'All categories', name: '', image: P.art, to: '/categories' },
]

export function departmentBrowseTo (dept) {
  if (dept.to) return dept.to
  if (!dept.name) return '/categories'
  return { path: '/browse', query: { category: dept.name } }
}

export const HOME_BUYER_SHORTCUTS = [
  { label: 'Search floor', hint: 'Filters & sort', to: '/browse', image: P.cards, showcaseKey: 'cards' },
  { label: 'Collections', hint: 'Curated floors', to: '/collections', image: P.coins, showcaseKey: 'coins' },
  { label: 'Verify COA', hint: 'Scan serial', to: '/verify/coa/FS-2026-000001', image: P.watches, showcaseKey: 'watches' },
  { label: 'Video inspect', hint: 'Live rooms', to: '/video', image: P.camera, showcaseKey: 'camera' },
  { label: 'Protection', hint: 'Escrow rules', to: '/protection', image: P.estate, showcaseKey: 'estate' },
  { label: 'How to buy', hint: 'Step-by-step', to: '/how-it-works', image: P.art, showcaseKey: 'art' },
  { label: 'Coin & auth tools', hint: 'Free guides', to: '/learn/tools', image: P.coins, showcaseKey: 'coins' },
]

export const HOME_SELLER_SHORTCUTS = [
  { label: 'List item', hint: 'Collectible or general', to: '/sell/start', image: P.guitars, showcaseKey: 'guitars' },
  { label: 'Import eBay', hint: 'CSV / skim', to: '/sell/import', image: P.cards, showcaseKey: 'cards' },
  { label: 'Store builder', hint: 'AI bios & SEO', to: '/store-builder', image: P.watches, showcaseKey: 'watches' },
  { label: 'Dropship', hint: 'Supplier wizard', to: '/sell/dropship-setup', image: P.sneakers, showcaseKey: 'sneakers' },
  { label: 'Pricing', hint: '4–5% fees', to: '/pricing', image: P.coins, showcaseKey: 'coins' },
  { label: 'Top sellers', hint: 'Volume rewards', to: '/top-sellers', image: P.art, showcaseKey: 'art' },
  { label: 'Seller hub', hint: 'Stores & pros', to: '/sellers', image: P.estate, showcaseKey: 'estate' },
  { label: 'Dashboard', hint: 'Orders & listings', to: '/dashboard', image: P.camera, showcaseKey: 'camera' },
]

export function imageForCategory (categoryName) {
  const map = {
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
  return map[categoryName] || P.estate
}
