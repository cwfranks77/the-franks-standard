/** Categorized Explore menu — each item has a unique path and purpose. */

export const NAV_EXPLORE_SECTIONS = [
  {
    id: 'shop',
    label: 'Shop the floor',
    accent: 'cyan',
    items: [
      { label: 'Browse all listings', to: '/browse', desc: 'Search the live marketplace' },
      { label: 'Categories A–Z', to: '/categories', desc: 'Cards, watches, gear, and more' },
      { label: 'Video meetups', to: '/video', desc: 'Inspect before you buy' },
      { label: 'How we compare', to: '/compare', desc: 'Fees and perks vs big marketplaces' },
      { label: 'Learn & free tools', to: '/learn', desc: 'Guides, calculators, videos' },
    ],
  },
  {
    id: 'sell',
    label: 'Sell & grow',
    accent: 'gold',
    items: [
      { label: 'List an item', to: '/sell', desc: 'Create a listing with COA or guarantee' },
      { label: 'Import from eBay', to: '/sell/import', desc: 'CSV or saved HTML skim' },
      { label: 'Dropship setup', to: '/sell/dropship-setup', desc: 'Supplier + fulfillment wizard' },
      { label: 'Seller program', to: '/sellers', desc: 'Stores and pro sellers' },
      { label: 'AI Store Builder', to: '/store-builder', desc: 'Bio, SEO, templates' },
      { label: 'Seller tools', to: '/seller-tools', desc: 'Appraisals and comp links' },
      { label: 'Top sellers', to: '/top-sellers', desc: 'Excellence rewards' },
      { label: 'Pricing plans', to: '/pricing', desc: 'Starter, Pro, Store — from 4% fees' },
      { label: 'Launch offer', to: '/launch-offer', desc: 'New seller promos' },
      { label: 'Founders (FOUNDERS10)', to: '/join/founders10', desc: '3 months Pro — limited spots' },
      { label: 'Honor (HONOR26)', to: '/honor', desc: 'Military & first responders' },
    ],
  },
  {
    id: 'trust',
    label: 'Trust & checkout',
    accent: 'green',
    items: [
      { label: 'How it works', to: '/how-it-works', desc: 'Buy and sell play-by-play' },
      { label: 'Pay & fees (Stripe)', to: '/pay', desc: 'Checkout, tax, Connect' },
      { label: 'Switching guide', to: '/sellers/switch', desc: 'Move inventory from eBay' },
      { label: 'Prohibited items', to: '/prohibited-items', desc: 'What cannot be listed' },
      { label: 'Seller agreement', to: '/seller-agreement', desc: 'Seller terms' },
      { label: 'Launch roadmap', to: '/roadmap', desc: 'What is live vs coming' },
    ],
  },
  {
    id: 'company',
    label: 'Company & apps',
    accent: 'violet',
    items: [
      { label: 'Learn hub', to: '/learn', desc: 'Guides, fee tools, video tutorials' },
      { label: 'Creator partnerships', to: '/partners/creators', desc: 'Influencer & affiliate program' },
      { label: 'Social promotion', to: '/social', desc: 'Instagram, TikTok, LinkedIn playbooks' },
      { label: 'Our story', to: '/about', desc: 'Mission and founder' },
      { label: 'Open Door Policy', to: '/open-door', desc: 'Charles Franks reads feedback' },
      { label: 'Support & tech', to: '/support', desc: 'Help center' },
      { label: 'Contact', to: '/contact', desc: 'Email and phone' },
      { label: 'Download app', to: '/download', desc: 'Android & Windows' },
      { label: 'Terms of service', to: '/terms', desc: 'Legal' },
      { label: 'Privacy policy', to: '/privacy', desc: 'Data practices' },
    ],
  },
]
