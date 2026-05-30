/**
 * Content marketing hub — articles, videos, tools (single source for /learn routes).
 * Update `contentAsOf` when refreshing competitor claims in articles.
 */

import { PRICING_PUBLIC, saleFeesMarketingLine } from '~/utils/pricingPublic.js'

export const contentAsOf = 'May 2026'

/** @typedef {{ type: 'p'|'h2'|'h3'|'ul'|'ol'|'tip'|'cta', text?: string, items?: string[], title?: string, to?: string, label?: string }} ContentBlock */

/** @typedef {{ slug: string, title: string, description: string, category: string, readMinutes: number, published: string, tags: string[], blocks: ContentBlock[], related?: string[] }} LearnArticle */

export const LEARN_CATEGORIES = [
  { id: 'guides', label: 'How-to guides' },
  { id: 'best-of', label: 'Best of & research' },
  { id: 'trust', label: 'Trust & protection' },
  { id: 'sellers', label: 'For sellers' },
]

export const LEARN_ARTICLES = /** @type {LearnArticle[]} */ ([
  {
    slug: 'import-ebay-to-franks-standard',
    title: 'How to import your eBay listings in under an hour',
    description: 'Step-by-step: export Active Listings from Seller Hub, upload CSV on Franks Standard, and publish with COA or signed guarantee.',
    category: 'guides',
    readMinutes: 6,
    published: '2026-05-01',
    tags: ['ebay', 'import', 'sellers', 'csv'],
    related: ['coa-vs-signed-guarantee', 'card-shop-fees-explained'],
    blocks: [
      { type: 'p', text: 'Moving inventory from eBay does not mean starting from zero. The Franks Standard import flow is built for card shops, coin dealers, and multi-category stores that already maintain listings on eBay.' },
      { type: 'h2', text: 'What you need before you start' },
      { type: 'ul', items: [
        'An eBay seller account with Active Listings',
        'Seller Hub access (Reports → Downloads)',
        'A free Franks Standard seller account',
        'Photos and COA/guarantee details ready for each SKU you plan to publish',
      ] },
      { type: 'h2', text: 'Step 1 — Download Active Listings from eBay' },
      { type: 'ol', items: [
        'Sign in to eBay Seller Hub → Reports → Downloads.',
        'Choose **Active Listings** (CSV).',
        'Download the file — keep column headers intact.',
      ] },
      { type: 'tip', title: 'Store sellers', text: 'If you run an eBay Store (/str/), prioritize high-trust SKUs first (graded cards, coins with COA, sealed product with provenance).' },
      { type: 'h2', text: 'Step 2 — Upload on Franks Standard' },
      { type: 'ol', items: [
        'Go to Sell → Import from eBay (/sell/import).',
        'Upload your CSV (or use saved HTML skim for research-only rows).',
        'Map titles, price, quantity, and category — review AI-suggested descriptions.',
        'Attach COA scan or select signed in-platform guarantee before publish.',
      ] },
      { type: 'h2', text: 'Step 3 — Publish and test checkout' },
      { type: 'p', text: 'Publish 3–5 listings first. Share one listing link with a trusted buyer to confirm Stripe escrow and delivery confirmation flow. Scale once payouts and messaging feel right.' },
      { type: 'cta', label: 'Open import tool', to: '/sell/import' },
    ],
  },
  {
    slug: 'coa-vs-signed-guarantee',
    title: 'COA vs signed guarantee: what buyers actually get',
    description: 'Collectible listings require seller proof — COA or signed guarantee template. The Platform facilitates and enforces; it does not guarantee authenticity.',
    category: 'trust',
    readMinutes: 5,
    published: '2026-05-01',
    tags: ['coa', 'buyers', 'authenticity'],
    related: ['authenticity-checklist-printable', 'video-inspect-before-you-buy'],
    blocks: [
      { type: 'p', text: 'General marketplaces treat authenticity as optional. On collectibles here, sellers must provide proof — we facilitate the sale and enforce policies; we do not warrant that any item is genuine.' },
      { type: 'h2', text: 'Certificate of Authenticity (COA)' },
      { type: 'p', text: 'Upload a COA image or PDF tied to the item. Buyers see it on the listing before checkout. Proven counterfeits with a valid COA path can trigger refund, seller ban, and referral for legal follow-up per our policies.' },
      { type: 'h2', text: 'Signed in-platform guarantee' },
      { type: 'p', text: 'When a third-party COA is not available, the seller signs our guarantee terms inside the listing flow. The deal stays on-platform — escrow, messaging, and dispute paths use Franks Standard records, not off-platform Venmo or personal email.' },
      { type: 'h2', text: 'Why this matters for shops' },
      { type: 'ul', items: [
        'Higher buyer confidence → fewer “is this real?” messages',
        'Clear enforcement path if something goes wrong',
        'Differentiation from anonymous C2C listings',
      ] },
      { type: 'cta', label: 'Read how buying works', to: '/how-it-works' },
    ],
  },
  {
    slug: 'best-collectibles-marketplaces-2026',
    title: 'Best marketplaces for collectibles in 2026 (honest short list)',
    description: 'Where cards, coins, watches, and memorabilia sell — fees, trust, and when a proof-first marketplace fits.',
    category: 'best-of',
    readMinutes: 8,
    published: '2026-05-15',
    tags: ['comparison', 'ebay', 'collectibles'],
    related: ['card-shop-fees-explained', 'import-ebay-to-franks-standard'],
    blocks: [
      { type: 'p', text: `No single site wins every category. This “best of” list is for sellers comparing total cost and buyer trust — figures as of ${contentAsOf}. Verify current fees on each platform’s official pages.` },
      { type: 'h2', text: 'Large general marketplaces' },
      { type: 'ul', items: [
        '**eBay** — Huge buyer pool; fees often stack into low-teens percent or more by category. Authenticity programs vary; many C2C listings have no mandatory COA.',
        '**Etsy** — Strong for handmade/vintage; less ideal for graded sports cards at scale.',
        '**Amazon** — Powerful logistics; category gating and brand rules can block small card shops.',
      ] },
      { type: 'h2', text: 'Specialty & proof-first' },
      { type: 'ul', items: [
        '**The Franks Standard** — Mandatory COA or signed guarantee, Stripe escrow, 4–5% sale fees by plan, eBay import, video inspect rooms. Built for shops leaving “fee stack” marketplaces.',
        '**Heritage, Goldin, PWCC** — Auction/consignment models for high-end pieces (different workflow than daily shop inventory).',
        '**TCGplayer / COMC** — Strong for trading cards; category-specific rules.',
      ] },
      { type: 'h2', text: 'When to add Franks Standard alongside eBay' },
      { type: 'ol', items: [
        'You want lower sale fees on inventory you can prove',
        'Buyers ask for video inspection or stronger guarantees',
        'You are tired of off-platform payment requests cutting into protection',
      ] },
      { type: 'cta', label: 'Full fee comparison chart', to: '/compare' },
    ],
  },
  {
    slug: 'card-shop-fees-explained',
    title: 'Card shop fees explained: keep more of a $500 sale',
    description: 'Illustrative math on 4–5% vs typical ~13% stacked marketplace fees — plus launch promo for new sellers.',
    category: 'sellers',
    readMinutes: 4,
    published: '2026-05-10',
    tags: ['fees', 'cards', 'sellers'],
    related: ['best-collectibles-marketplaces-2026'],
    blocks: [
      { type: 'p', text: saleFeesMarketingLine() + '.' },
      { type: 'h2', text: 'Example: $500 graded card' },
      { type: 'ul', items: [
        `Franks Standard at ${PRICING_PUBLIC.proTxPercent}% Pro plan ≈ $${(500 * PRICING_PUBLIC.proTxPercent / 100).toFixed(2)} platform fee`,
        `Launch promo ${PRICING_PUBLIC.launchTxPromoPercent}% (first 90 days for new sellers) ≈ $${(500 * PRICING_PUBLIC.launchTxPromoPercent / 100).toFixed(2)}`,
        `Illustrative “big marketplace” ~${PRICING_PUBLIC.competitorTypical} ≈ $${(500 * 0.13).toFixed(2)}+ before payment processing and listing extras`,
      ] },
      { type: 'tip', title: 'Use the calculator', text: 'Plug in your average sale price and monthly volume on our free Fee Savings Calculator — no signup required.' },
      { type: 'cta', label: 'Fee savings calculator', to: '/learn/tools/fee-calculator' },
    ],
  },
  {
    slug: 'video-inspect-before-you-buy',
    title: 'Video inspect rooms: see the card before you escrow',
    description: 'How buyers and sellers use live video on The Franks Standard to reduce surprises on high-value collectibles.',
    category: 'guides',
    readMinutes: 4,
    published: '2026-05-12',
    tags: ['video', 'buyers', 'trust'],
    related: ['coa-vs-signed-guarantee'],
    blocks: [
      { type: 'p', text: 'Photos lie by accident (glare, soft focus) and sometimes on purpose. Video inspect connects buyer and seller in a scheduled room before money moves.' },
      { type: 'h2', text: 'Typical flow' },
      { type: 'ol', items: [
        'Buyer messages the store via platform contact (no personal email in listings).',
        'Seller shares a Video room link from the listing or store page.',
        'Buyer inspects corners, surfaces, and cert slabs live.',
        'If satisfied, buyer checks out with Stripe escrow on-platform.',
      ] },
      { type: 'h2', text: 'Seller tips' },
      { type: 'ul', items: [
        'Use a neutral background and consistent lighting',
        'Show cert number and COA on camera',
        'Record inspect time in listing notes for disputes',
      ] },
      { type: 'cta', label: 'Video meetups', to: '/video' },
    ],
  },
  {
    slug: 'dropship-collectibles-without-fakes',
    title: 'Dropshipping collectibles without losing trust',
    description: 'Supplier disclosure, ship times, and why proof requirements still apply when you do not hold inventory.',
    category: 'sellers',
    readMinutes: 5,
    published: '2026-05-18',
    tags: ['dropship', 'sellers', 'trust'],
    related: ['coa-vs-signed-guarantee', 'seller-playbook'],
    blocks: [
      { type: 'p', text: 'Dropship is allowed when you are transparent — buyers still deserve COA or signed guarantee and on-platform checkout only.' },
      { type: 'h2', text: 'Rules that protect your store' },
      { type: 'ul', items: [
        'Never put supplier emails, WhatsApp, or Venmo in listings or store bio',
        'State realistic ship times; update inventory when supplier stock changes',
        'Use Dropship setup wizard to wire Stripe split and supplier fields',
      ] },
      { type: 'h2', text: 'Off-platform contact is blocked' },
      { type: 'p', text: 'Listings and store pages scan for personal emails and payment apps. Keeps disputes inside escrow where records exist.' },
      { type: 'cta', label: 'Dropship setup', to: '/sell/dropship-setup' },
    ],
  },
  {
    slug: 'seller-playbook',
    title: 'The Franks Standard Seller Playbook (free guide)',
    description: 'Printable ebook-style guide: listing checklist, fees, import, video inspect, and launch promos.',
    category: 'sellers',
    readMinutes: 12,
    published: '2026-05-01',
    tags: ['ebook', 'sellers', 'checklist'],
    related: ['import-ebay-to-franks-standard', 'card-shop-fees-explained', 'coin-counterfeit-detection-guide'],
    blocks: [
      { type: 'p', text: 'This playbook is your offline reference — share with staff at your card shop or coin counter.' },
      { type: 'h2', text: 'Chapter 1 — Why proof-first selling wins' },
      { type: 'p', text: 'Collectibles buyers want seller-backed proof. COA or signed guarantee on collectible SKUs is required — enforced listing rules, not a Platform authenticity warranty.' },
      { type: 'h2', text: 'Chapter 2 — Fees & plans' },
      { type: 'ul', items: [
        `Starter: ${PRICING_PUBLIC.starterTxPercent}% sale fee, $0/mo`,
        `Pro: ${PRICING_PUBLIC.proTxPercent}% · $${PRICING_PUBLIC.proMonthly}/mo`,
        `Store: ${PRICING_PUBLIC.storeTxPercent}% · $${PRICING_PUBLIC.storeMonthly}/mo`,
        `New sellers: ${PRICING_PUBLIC.launchTxPromoPercent}% fees for 90 days, 10 free listings`,
        'FOUNDERS10: 3 months Pro free (first 10 sellers)',
      ] },
      { type: 'h2', text: 'Chapter 3 — Listing checklist' },
      { type: 'ol', items: [
        'Title with grade, year, and cert if applicable',
        '6+ sharp photos (front, back, cert, flaws)',
        'COA upload or signed guarantee',
        'Accurate condition notes',
        'Stripe Connect connected before first sale',
      ] },
      { type: 'h2', text: 'Chapter 4 — Growth' },
      { type: 'ul', items: [
        'Import eBay CSV weekly for new SKUs',
        'Offer video inspect on items over your shop threshold',
        'Ask happy buyers for on-platform reviews',
        'Track postcard/mail campaigns with /go/postcard?ref=your-batch',
      ] },
      { type: 'cta', label: 'Start selling', to: '/sell' },
      { type: 'cta', label: 'Print authenticity checklist', to: '/learn/tools/authenticity-checklist' },
    ],
  },
  {
    slug: 'coin-counterfeit-detection-guide',
    title: 'Spot fake coins before you buy (Morgan dollars & more)',
    description:
      'Struck vs cast, the 10-point checklist, Morgan CC/S diagnostics, and why “too cheap” key dates are almost always counterfeits.',
    category: 'trust',
    readMinutes: 3,
    published: '2026-05-29',
    tags: ['coins', 'counterfeit', 'morgan', 'buyers', 'authenticity'],
    related: ['coa-vs-signed-guarantee', 'seller-playbook'],
    blocks: [
      {
        type: 'p',
        text:
          'Counterfeit Morgans, fake PCGS slabs, and cast copies flood general marketplaces. This short intro links to our free printable study guide — the same framework we use when reviewing authenticity reports.',
      },
      { type: 'h2', text: 'Three rules that catch most scams' },
      {
        type: 'ul',
        items: [
          '**Price vs comps** — key dates (1885-CC, 1889-CC, 1893-S) at generic silver prices are not real.',
          '**Struck vs cast** — micro-voids in jaw/neck recesses and dead luster point to cast metal, not Mint strike.',
          '**Verify slabs** — PCGS/NGC cert numbers must match on the grading service website; $50–$90 “MS64 CC” slabs are a known pattern.',
        ],
      },
      {
        type: 'cta',
        label: 'Open full coin study guide (printable)',
        to: '/learn/tools/coin-study-guide',
      },
      {
        type: 'cta',
        label: 'Report a listing on Franks Standard',
        to: '/how-it-works',
      },
    ],
  },
  {
    slug: 'niche-collections-vs-ebay',
    title: 'Niche collections & limited drops: why collectors leave generic search',
    description: 'Curated floors for graded cards, coins, TCG, and limited editions — with COA, escrow, and proof-first listings instead of endless eBay results.',
    category: 'best-of',
    readMinutes: 6,
    published: '2026-05-20',
    tags: ['collections', 'limited edition', 'buyers', 'ebay'],
    related: ['best-collectibles-marketplaces-2026', 'coa-vs-signed-guarantee'],
    blocks: [
      { type: 'p', text: 'Volume marketplaces bury specialty inventory. The Franks Standard promotes niche floors and limited-edition spotlights so collectors find graded slabs, coins, and sealed product with mandatory proof — not another anonymous listing.' },
      { type: 'h2', text: 'What “niche focus” means here' },
      { type: 'ul', items: [
        'Curated collection pages (graded sports cards, coins, TCG, comics, watches, sneakers)',
        'Limited-edition badges on browse and collection landers',
        'Every SKU: COA upload or signed in-platform guarantee',
        'Checkout: Stripe escrow until delivery is confirmed',
      ] },
      { type: 'h2', text: 'Limited edition without the scam vibe' },
      { type: 'p', text: 'Sellers can tag listings as limited edition or tie them to a floor-drop campaign. Buyers still get escrow, messaging, and dispute records on-platform — exclusivity does not mean “DM me on Venmo.”' },
      { type: 'h2', text: 'Promotional campaigns' },
      { type: 'p', text: 'Use collection URLs in email, postcards, and social posts: /collections/graded-sports-cards, /browse?limited=1, and UTM-tagged /go/* links from outreach tracking.' },
      { type: 'cta', label: 'Browse collections', to: '/collections' },
      { type: 'cta', label: 'List a limited drop', to: '/sell' },
    ],
  },
])

export const LEARN_ARTICLE_SLUGS = LEARN_ARTICLES.map((a) => a.slug)

export function getArticleBySlug (slug) {
  return LEARN_ARTICLES.find((a) => a.slug === slug) || null
}

export function articlesByCategory (categoryId) {
  return LEARN_ARTICLES.filter((a) => a.category === categoryId)
}

/** Video catalog — set `youtubeId` when published; empty shows “coming soon” card. */
export const LEARN_VIDEOS = [
  {
    id: 'platform-tour',
    title: 'Platform tour: browse, escrow, and seller dashboard',
    description: '60-second overview for new buyers and sellers.',
    youtubeId: '',
    duration: '1:00',
    tags: ['overview'],
  },
  {
    id: 'ebay-import-walkthrough',
    title: 'eBay CSV import walkthrough',
    description: 'Seller Hub export → upload → publish with COA.',
    youtubeId: '',
    duration: '4:00',
    tags: ['sellers', 'import'],
  },
  {
    id: 'coa-guarantee',
    title: 'How COA and signed guarantees protect buyers',
    description: 'What sellers must provide on collectible listings vs general merchandise.',
    youtubeId: '',
    duration: '3:00',
    tags: ['trust'],
  },
  {
    id: 'video-inspect-demo',
    title: 'Video inspect room demo',
    description: 'Live card inspection before checkout.',
    youtubeId: '',
    duration: '2:30',
    tags: ['video', 'buyers'],
  },
  {
    id: 'fee-comparison',
    title: 'Fee comparison: Franks Standard vs stacked marketplace fees',
    description: 'Real spreadsheet math for shop owners.',
    youtubeId: '',
    duration: '5:00',
    tags: ['sellers', 'fees'],
  },
  {
    id: 'off-platform-policy',
    title: 'Why we block Venmo and personal email in listings',
    description: 'Seller protection and dispute evidence.',
    youtubeId: '',
    duration: '2:00',
    tags: ['trust', 'policy'],
  },
]

export const LEARN_TOOLS = [
  {
    slug: 'fee-calculator',
    title: 'Fee savings calculator',
    description: 'Compare Franks Standard sale fees vs an illustrative 13% “stacked” marketplace rate.',
    icon: '💰',
  },
  {
    slug: 'listing-cost',
    title: 'Listing cost estimator',
    description: 'First 10 listings free, then per-listing fees — estimate your month.',
    icon: '📋',
  },
  {
    slug: 'authenticity-checklist',
    title: 'Authenticity checklist (printable)',
    description: 'Pre-publish COA and guarantee checklist for staff.',
    icon: '✓',
  },
  {
    slug: 'coin-study-guide',
    title: 'Coin study guide (printable)',
    description: 'Struck vs cast, Morgan diagnostics, 10-point checklist — free buyer & dealer reference.',
    icon: '🪙',
  },
]

export const CONTENT_SOCIAL = {
  youtubeChannel: '',
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
}
