/** Guides for sellers and shoppers moving from other marketplaces. */

export const PLATFORM_SOURCES = [
  {
    id: 'ebay',
    name: 'eBay',
    audience: 'seller',
    summary: 'List with the same photos and titles; checkout and buyer protection run on The Franks Standard.',
    sellerSteps: [
      'Sign in and open Import from eBay or CSV — we skim your active public eBay listings or read your export file.',
      'Review titles, prices, and photos — import as drafts or publish in one batch.',
      'Sign our in-platform guarantee (or upload COA) on each listing — required on the public floor.',
      'Update your eBay listings or About page with your new store link when you are ready to switch buyers over.',
    ],
    buyerNote:
      'If you followed a link from eBay, this shop now sells on The Franks Standard with escrow checkout and authenticity rules.',
  },
  {
    id: 'etsy',
    name: 'Etsy',
    audience: 'seller',
    summary: 'Handmade and vintage sellers keep their brand; collectible listings add seller COA or signed guarantee when required.',
    sellerSteps: [
      'Download listing CSV from Etsy Shop Manager if you use it.',
      'Register as a seller and set your store name and slug under Sell → dropship setup or your profile.',
      'Re-list top sellers first; fees and payout timing are on Pay & fees.',
    ],
    buyerNote: 'Checkout uses Stripe escrow — funds release to the seller after you confirm delivery.',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    audience: 'seller',
    summary: 'For unique inventory and collectibles — not FBA bulk; each SKU needs authenticity proof.',
    sellerSteps: [
      'Identify SKUs you own and can photograph with COA or guarantee.',
      'Apply as a store if you have catalog volume (Sellers page).',
      'Use direct sale mode unless you connect your own dropship supplier.',
    ],
    buyerNote: null,
  },
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    audience: 'both',
    summary: 'Move local or social sales to hosted checkout and order history.',
    sellerSteps: [
      'Stop taking payment in DMs — send buyers to your listing link on this site.',
      'List with photos you already use on Marketplace.',
    ],
    buyerNote: 'Pay only through the listing checkout button — not Venmo or Cash App in chat.',
  },
  {
    id: 'own-site',
    name: 'Your own website',
    audience: 'seller',
    summary: 'Keep your domain; 301 redirect product pages to listing URLs here for checkout.',
    sellerSteps: [
      'Register store slug (e.g. /store/your-brand).',
      'Redirect old product URLs to matching listings.',
      'Use our checkout for tax, escrow, and dispute flow.',
    ],
    buyerNote: null,
  },
]

export function platformById (id) {
  return PLATFORM_SOURCES.find((p) => p.id === id) || null
}

export const TRANSITION_CHECKLIST = [
  'Account created (buyer, seller, or both)',
  'Store name and public slug chosen (optional)',
  'First listing published with COA or signed guarantee',
  'Payout / Stripe Connect completed when selling',
  'Old platform listings updated or ended to avoid double-selling',
]
