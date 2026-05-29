/** Live features for homepage tabs — only what is on the site today. */

export const LIVE_NOW_TABS = [
  { id: 'buyers', label: 'Buyers', icon: '🛒' },
  { id: 'sellers', label: 'Sellers', icon: '🏪' },
  { id: 'security', label: 'Security', icon: '🛡️' },
  { id: 'perks', label: 'Perks & rewards', icon: '🎁' },
]

/** @type {Record<string, { icon: string, title: string, desc: string, to: string, cta: string }[]>} */
export const LIVE_NOW_BY_TAB = {
  buyers: [
    { icon: '🛒', title: 'Browse & buy', desc: 'Categories, search, Buy Now, and auctions on supported listings.', to: '/browse', cta: 'Browse floor' },
    { icon: '🔒', title: 'Escrow checkout', desc: 'Stripe holds payment until you confirm the item arrived as described.', to: '/protection', cta: 'How protection works' },
    { icon: '📜', title: 'Verify COA serial', desc: 'Scan FS-YYYY-NNNNNN at /verify/coa before you pay on a high-value item.', to: '/verify/coa/FS-2026-000001', cta: 'Try verify page' },
    { icon: '📹', title: 'Video inspect rooms', desc: 'See the item live in-browser before you lock escrow.', to: '/video', cta: 'Open video' },
    { icon: '📂', title: 'Collections', desc: 'Curated floors for graded cards, coins, and limited drops.', to: '/collections', cta: 'Collections' },
    { icon: '🚩', title: 'Report concerns', desc: 'Flag authenticity issues on a listing — ops enforces per policy.', to: '/how-it-works', cta: 'Buyer playbook' },
  ],
  sellers: [
    { icon: '🏪', title: 'Sell & list', desc: 'Photos, COA upload, and publish — policy signature required first.', to: '/sell', cta: 'Start selling' },
    { icon: '📥', title: 'eBay import', desc: 'Seller Hub CSV or skim flow at /sell/import.', to: '/sell/import', cta: 'Import inventory' },
    { icon: '🤖', title: 'AI store builder', desc: 'Bios, SEO, and listing templates in minutes.', to: '/store-builder', cta: 'Store builder' },
    { icon: '📦', title: 'Dropship setup', desc: 'Wizard for supplier, fulfillment, and optional automation.', to: '/sell/dropship-setup', cta: 'Dropship wizard' },
    { icon: '💵', title: 'Low sale fees', desc: '4–5% by plan (3% launch promo) vs typical ~13%+ stacked elsewhere.', to: '/pricing', cta: 'See pricing' },
    { icon: '⭐', title: 'Seller reviews', desc: 'Ratings and Top Sellers leaderboard — volume matters.', to: '/top-sellers', cta: 'Top sellers' },
  ],
  security: [
    { icon: '📜', title: 'COA or signed guarantee', desc: 'Required before any listing goes public.', to: '/how-it-works', cta: 'How proof works' },
    { icon: '🏢', title: 'Floor office COA', desc: 'Franks serial tied to one listing — not a blank certificate.', to: '/verify/coa/FS-2026-000001', cta: 'Verify serial' },
    { icon: '🔒', title: 'Stripe escrow', desc: 'Funds held until buyer confirms — disputes use platform records.', to: '/pay', cta: 'Pay & escrow' },
    { icon: '🛡️', title: 'Listing authenticity scan', desc: 'Blocks off-platform pay apps and “no guarantee” wording at publish.', to: '/learn/tools/authenticity-checklist', cta: 'Checklist' },
    { icon: '⚖️', title: 'Forced refund policy', desc: 'Seller-at-fault refunds written in Marketplace Policies.', to: '/marketplace-policy', cta: 'Full policy' },
    { icon: '🧊', title: 'Account freeze enforcement', desc: 'Refuse valid refund → freeze + platform debt until repaid.', to: '/marketplace-policy', cta: 'Enforcement rules' },
    { icon: '✍️', title: 'Seller policy signature', desc: 'Digital sign terms + marketplace policy before first listing.', to: '/seller-agreement', cta: 'Seller agreement' },
  ],
  perks: [
    { icon: '🎁', title: 'FOUNDERS10', desc: 'First 10 sellers: 3 months Pro free — unlimited listings.', to: '/join/founders10', cta: 'Claim spot' },
    { icon: '🎖️', title: 'HONOR26', desc: 'Military & first responders: 6 months Pro free when you sell.', to: '/honor', cta: 'Honor program' },
    { icon: '🏆', title: 'Seller Excellence', desc: 'Every 6 months: #1 gets 0% platform fees for 30 days + spotlight.', to: '/top-sellers', cta: 'Leaderboard' },
    { icon: '📉', title: 'Launch fee promo', desc: '3% transaction fee for new sellers’ first 90 days.', to: '/launch-offer', cta: 'Launch offer' },
    { icon: '🤝', title: 'Store partner program', desc: 'Shops onboarding with proof-first inventory.', to: '/join/store-partner', cta: 'Store partner' },
    { icon: '💬', title: 'Open Door + Help', desc: 'Founder reads feedback; AI help on fees, COA, tech.', to: '/open-door', cta: 'Open Door' },
  ],
}

/** Flat list for smoke tests / legacy */
export const LIVE_NOW_FEATURES = Object.values(LIVE_NOW_BY_TAB).flat()

/** Internal / roadmap only — do not show on public homepage. */
export const COMING_SOON_FEATURES = [
  { title: 'In-app messaging', desc: 'Buyer ↔ seller threads on-platform only.' },
  { title: 'Wishlists & price alerts', desc: 'Save items and get notified on drops.' },
  { title: 'Full order-tracking hub', desc: 'Shipment timeline dashboard for every order.' },
]
