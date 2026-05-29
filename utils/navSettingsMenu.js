/**
 * Header Settings dropdown — account, seller setup, policies, and support.
 */

export const NAV_SETTINGS_SECTIONS = [
  {
    id: 'account',
    label: 'Account',
    accent: 'cyan',
    items: [
      { label: 'Sign in', to: '/auth/login', desc: 'Existing members' },
      { label: 'Join free', to: '/auth/register', desc: 'Create your account' },
      { label: 'Dashboard', to: '/dashboard', desc: 'Orders, listings, profile' },
      { label: 'Download app', to: '/download', desc: 'Android & Windows' },
    ],
  },
  {
    id: 'seller-setup',
    label: 'Seller setup',
    accent: 'gold',
    items: [
      { label: 'List an item', to: '/sell', desc: 'COA or signed guarantee required' },
      { label: 'Import from eBay', to: '/sell/import', desc: 'CSV or saved HTML skim' },
      { label: 'Dropship setup', to: '/sell/dropship-setup', desc: 'Supplier & fulfillment wizard' },
      { label: 'AI Store Builder', to: '/store-builder', desc: 'Bio, SEO, templates' },
      { label: 'Seller tools', to: '/seller-tools', desc: 'Appraisals and comp links' },
      { label: 'Pricing plans', to: '/pricing', desc: 'Starter, Pro, Store — from 4% fees' },
      { label: 'Switching guide', to: '/sellers/switch', desc: 'Move inventory from eBay' },
      { label: 'Seller program', to: '/sellers', desc: 'Stores and pro sellers' },
    ],
  },
  {
    id: 'policies',
    label: 'Policies & checkout',
    accent: 'green',
    items: [
      { label: 'How it works', to: '/how-it-works', desc: 'Buy and sell play-by-play' },
      { label: 'Protection & escrow', to: '/protection', desc: 'Refunds, disputes, enforcement' },
      { label: 'Pay & fees (Stripe)', to: '/pay', desc: 'Checkout, tax, Connect' },
      { label: 'Marketplace policies', to: '/marketplace-policy', desc: 'Forced refund, freeze, bans' },
      { label: 'Seller agreement', to: '/seller-agreement', desc: 'Digital signature before listing' },
      { label: 'Prohibited items', to: '/prohibited-items', desc: 'What cannot be listed' },
      { label: 'Terms of service', to: '/terms', desc: 'Platform terms' },
      { label: 'Privacy policy', to: '/privacy', desc: 'Data practices' },
    ],
  },
  {
    id: 'help',
    label: 'Help & company',
    accent: 'violet',
    items: [
      { label: 'Support & tech', to: '/support', desc: 'Help center' },
      { label: 'Open Door Policy', to: '/open-door', desc: 'Founder reads feedback' },
      { label: 'Contact', to: '/contact', desc: 'Phone and email' },
      { label: 'Our story', to: '/about', desc: 'Mission and founder' },
      { label: 'Launch roadmap', to: '/roadmap', desc: 'What is live today' },
      { label: 'Compare marketplaces', to: '/compare', desc: 'Fees and perks vs big apps' },
    ],
  },
]
