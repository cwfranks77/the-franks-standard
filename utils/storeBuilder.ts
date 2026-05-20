import { STORE_CATEGORY_TAGLINES, type ListingCategory } from '~/utils/marketplaceCategories'

export type StoreStyle = 'direct' | 'dropship' | 'both'
export type BrandVoice = 'professional' | 'friendly' | 'luxury' | 'collector' | 'value'

export interface StoreBuilderInput {
  name: string
  description: string
  category: string
  style: StoreStyle
  priceMin: number | null
  priceMax: number | null
  volume: string
  slug: string
  city: string
  state: string
  country: string
  focusKeywords: string
  extraKeywords: string
  brandVoice: BrandVoice
  targetAudience: string
  websiteUrl: string
  instagram: string
  facebook: string
}

export interface StoreBuildResult {
  storeName: string
  tagline: string
  bio: string
  sampleTitles: string[]
  descriptionTemplate: string
  pricingTip: string
  launchSteps: string[]
  dropshipTip: string
}

export interface SerpPreview {
  title: string
  url: string
  description: string
}

export interface StoreSeoPack {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  canonicalHint: string
  googlePreview: SerpPreview
  bingPreview: SerpPreview
  jsonLd: string
  htmlMetaBlock: string
  listingTitleFormulas: string[]
  searchChecklist: { engine: string; steps: string[] }[]
  indexNowTip: string
  sitemapUrls: string[]
}

const SITE = 'https://thefranksstandard.com'

const SAMPLE_TITLES: Partial<Record<string, string[]>> = {
  'Sports Cards & Memorabilia': [
    '2023 Topps Chrome Refractor — PSA 10 Gem Mint',
    'Vintage 1986 Fleer Michael Jordan Rookie — BGS 8.5',
    'Game-Used Jersey Patch Card — Serial #/25 — COA Included',
  ],
  'Sneakers & Streetwear': [
    'Nike Air Jordan 1 Retro High OG "Chicago" — DS Size 10',
    'Supreme Box Logo Hoodie FW23 — Deadstock with Tags',
    'Yeezy Boost 350 V2 "Zebra" — Authenticated, Size 11',
  ],
  'General Merchandise': [
    'Premium Gift Set — New in Box — Fast Ship',
    'Home & Kitchen Bundle — Excellent Condition — As Described',
    'Branded Apparel Lot — Mixed Sizes — Clear Photos',
  ],
  'General Store': [
    'Customer Favorite Bundle — Curated Variety Pack',
    'New Arrival — Multi-Category Deal — Shop-Wide Quality',
    'Best Seller Restock — General Store Pick — Tracked Shipping',
  ],
}

const VOICE_PHRASES: Record<BrandVoice, string> = {
  professional: 'trusted, proof-backed, and straightforward',
  friendly: 'welcoming, clear, and easy to shop',
  luxury: 'curated, premium, and authenticity-forward',
  collector: 'serious-grade, documented, and collector-first',
  value: 'fair-priced, transparent, and honest condition notes',
}

export function slugifyStore (name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'my-store'
}

function truncate (text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}

function parseKeywords (focus: string, extra: string, category: string, city: string): string[] {
  const raw = [focus, extra, category, city, 'The Franks Standard', 'authenticated', 'COA']
    .join(',')
    .split(/[,;|]+/)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(raw)].slice(0, 12)
}

export function buildStoreResult (s: StoreBuilderInput): StoreBuildResult {
  const name = s.name.trim() || 'My Store'
  const cat = s.category || 'collectibles'
  const isDropship = s.style === 'dropship' || s.style === 'both'
  const priceRange = s.priceMin && s.priceMax ? `$${s.priceMin}–$${s.priceMax}` : 'varied'
  const voice = VOICE_PHRASES[s.brandVoice] || VOICE_PHRASES.professional
  const taglines = STORE_CATEGORY_TAGLINES
  const catKey = s.category as ListingCategory

  const defaultTitles = [
    `${cat} Premium Item — Authenticated with COA`,
    `Rare ${cat} Find — Excellent Condition — Verified`,
    `${cat} Collection Piece — Proof of Authenticity Included`,
  ]

  const locationLine = [s.city, s.state].filter(Boolean).join(', ')
  const audience = s.targetAudience.trim() ? ` We serve ${s.targetAudience.trim()}.` : ''

  return {
    storeName: name,
    tagline: taglines[catKey] || `Authenticated ${cat.toLowerCase()} from a trusted seller on The Franks Standard.`,
    bio: `Welcome to ${name}${locationLine ? ` (${locationLine})` : ''}. We specialize in ${s.description.trim() || cat.toLowerCase()} — ${voice}. Every item includes a Certificate of Authenticity or our signed in-platform guarantee.${audience} ${isDropship ? 'We work with verified suppliers for direct-to-door shipping.' : ''} Typical price range: ${priceRange}. Browse with confidence on The Franks Standard.`,
    sampleTitles: SAMPLE_TITLES[s.category] || defaultTitles,
    descriptionTemplate: `[Item Name] — [Condition: New/Like New/Excellent/Good]

Authenticity: [COA from (grading company) / Franks Standard Guarantee]
Condition: [wear, completeness, packaging]
Includes: [everything in the box/package]

Shipping: ${isDropship ? 'Ships from our verified supplier.' : 'Ships within 2 business days — insured and tracked.'}
Returns: Escrow on The Franks Standard — buyer confirms before payout.

Keywords to weave in: ${s.focusKeywords.trim() || cat}

Questions? Message us or start a Video call from the listing.`,
    pricingTip: `For ${cat.toLowerCase()} (${priceRange}): check sold comps on eBay, StockX, or Chrono24. Price 5–10% below big platforms — our 5% fee beats 13%+ elsewhere. Use Pro for featured placement. Put your top keyword (“${s.focusKeywords.split(',')[0]?.trim() || cat}”) in the first 40 characters of each listing title for Google and Bing.`,
    launchSteps: [
      `Set your store name to “${name}” and upload a clear logo or photo`,
      `Publish 3+ listings with your focus keyword in each title`,
      `Complete the SEO pack below and paste meta tags anywhere you control (site, link-in-bio, press)`,
      `Submit ${SITE}/sitemap.xml to Google Search Console and Bing Webmaster Tools`,
      `Share your Franks Standard seller link on Instagram${s.instagram ? ` (${s.instagram})` : ''} and Facebook`,
      `Ask happy buyers to leave detailed reviews mentioning product type and condition`,
      isDropship ? 'Document supplier COAs before listing dropship SKUs' : 'Ship within your stated handling time every order',
      'Monitor Dashboard for views — refresh titles monthly using the formulas in your SEO pack',
    ],
    dropshipTip: isDropship
      ? 'Dropship on Franks Standard: vet suppliers, get COAs before listing, set honest ship times, keep supplier emails, and order a sample when possible. Search engines rank listings with unique photos and specific titles — not generic supplier copy.'
      : '',
  }
}

export function buildStoreSeoPack (s: StoreBuilderInput, store: StoreBuildResult): StoreSeoPack {
  const slug = s.slug.trim() || slugifyStore(s.name)
  const storePath = `/browse?store=${encodeURIComponent(slug)}`
  const canonicalHint = `${SITE}${storePath}`
  const kw = parseKeywords(s.focusKeywords, s.extraKeywords, s.category, s.city)
  const primaryKw = kw[0] || s.category || 'authenticated collectibles'
  const location = [s.city, s.state, s.country].filter(Boolean).join(', ')

  const metaTitle = truncate(
    `${s.name.trim() || 'Store'} | ${primaryKw}${location ? ` | ${s.city}` : ''} | Franks Standard`,
    60,
  )
  const metaDescription = truncate(
    `Shop ${s.name.trim()} on The Franks Standard — ${primaryKw}. ${store.tagline} COA or signed guarantee on listings.${location ? ` Based in ${location}.` : ''}`,
    160,
  )

  const googlePreview: SerpPreview = {
    title: metaTitle,
    url: canonicalHint,
    description: metaDescription,
  }
  const bingPreview: SerpPreview = {
    title: metaTitle,
    url: canonicalHint.replace('https://', ''),
    description: metaDescription,
  }

  const jsonLd = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: s.name.trim(),
      description: store.bio.slice(0, 300),
      url: canonicalHint,
      image: `${SITE}/franks-pavilion.png`,
      priceRange: s.priceMin && s.priceMax ? `$${s.priceMin}-$${s.priceMax}` : undefined,
      address: location
        ? { '@type': 'PostalAddress', addressLocality: s.city || undefined, addressRegion: s.state || undefined, addressCountry: s.country || 'US' }
        : undefined,
      sameAs: [s.websiteUrl, s.instagram, s.facebook].filter((u) => u && u.startsWith('http')),
      keywords: kw.join(', '),
      parentOrganization: { '@type': 'Organization', name: 'The Franks Standard', url: SITE },
    },
    null,
    2,
  )

  const htmlMetaBlock = `<!-- Paste where you control HTML (seller site, landing page, link tools) -->
<title>${metaTitle}</title>
<meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}" />
<meta name="keywords" content="${kw.join(', ')}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${canonicalHint}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${store.storeName} | The Franks Standard" />
<meta property="og:description" content="${metaDescription.replace(/"/g, '&quot;')}" />
<meta property="og:url" content="${canonicalHint}" />
<meta property="og:image" content="${SITE}/franks-pavilion.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${store.storeName}" />
<meta name="twitter:description" content="${metaDescription.replace(/"/g, '&quot;')}" />`

  const listingTitleFormulas = [
    `[Brand] [Product] — [Grade/Condition] — ${primaryKw} — COA`,
    `Buy ${primaryKw} — [Specific item] — ${s.name.trim()} — Authenticated`,
    `[Year/Set] [Player/Model] — ${s.category} — Ships Fast — Franks Standard`,
    `Rare ${primaryKw} — [Detail] — Verified Seller — ${location || 'USA'}`,
  ]

  const searchChecklist = [
    {
      engine: 'Google',
      steps: [
        'Open Google Search Console: https://search.google.com/search-console',
        `Add property: ${SITE} (domain or URL prefix)`,
        'Verify ownership (HTML tag or DNS — use your domain host)',
        `Submit sitemap: ${SITE}/sitemap.xml`,
        'Use URL Inspection on your browse/listing URLs after you publish',
        'Request indexing for new listings when inventory changes',
      ],
    },
    {
      engine: 'Bing (+ Yahoo / DuckDuckGo via Bing index)',
      steps: [
        'Open Bing Webmaster Tools: https://www.bing.com/webmasters',
        `Import from Google Search Console or add ${SITE} manually`,
        `Submit sitemap: ${SITE}/sitemap.xml`,
        'Enable IndexNow in Bing for faster updates (optional API key)',
        'Check URL coverage weekly for crawl errors',
      ],
    },
    {
      engine: 'All search engines (on-page)',
      steps: [
        `Use this meta title (${metaTitle.length}/60 chars) on every page you control`,
        `Use this meta description (${metaDescription.length}/160 chars) — unique per main landing page`,
        'Put focus keyword in first 40 characters of each listing title',
        'Write 150+ word unique descriptions — avoid duplicate supplier text',
        'Use 3+ original photos per listing (search engines favor unique media)',
        `Link to ${SITE}/browse from Instagram, Facebook, and your website`,
      ],
    },
  ]

  return {
    metaTitle,
    metaDescription,
    keywords: kw,
    ogTitle: `${store.storeName} | The Franks Standard`,
    ogDescription: metaDescription,
    canonicalHint,
    googlePreview,
    bingPreview,
    jsonLd,
    htmlMetaBlock,
    listingTitleFormulas,
    searchChecklist,
    indexNowTip: `Bing IndexNow: after publishing new listings, ping Bing with your URLs (Webmaster Tools → IndexNow). Listing URLs on Franks Standard follow ${SITE}/listing/[id] — request indexing in GSC/Bing when live.`,
    sitemapUrls: [SITE, `${SITE}/browse`, `${SITE}/sell`, `${SITE}/store-builder`, `${SITE}/sitemap.xml`],
  }
}

export function formatFullStoreExport (store: StoreBuildResult, seo: StoreSeoPack): string {
  return [
    `=== ${store.storeName} ===`,
    `Tagline: ${store.tagline}`,
    '',
    '--- Bio ---',
    store.bio,
    '',
    '--- SEO title ---',
    seo.metaTitle,
    '',
    '--- SEO description ---',
    seo.metaDescription,
    '',
    '--- Keywords ---',
    seo.keywords.join(', '),
    '',
    '--- Sample listing titles ---',
    ...store.sampleTitles.map((t) => `• ${t}`),
    '',
    '--- Listing title formulas ---',
    ...seo.listingTitleFormulas.map((t) => `• ${t}`),
    '',
    '--- Description template ---',
    store.descriptionTemplate,
    '',
    '--- HTML meta block ---',
    seo.htmlMetaBlock,
    '',
    '--- JSON-LD ---',
    seo.jsonLd,
    '',
    '--- Launch steps ---',
    ...store.launchSteps.map((step, i) => `${i + 1}. ${step}`),
    '',
    '--- Get on Google ---',
    ...seo.searchChecklist[0].steps.map((step) => `• ${step}`),
    '',
    '--- Get on Bing ---',
    ...seo.searchChecklist[1].steps.map((step) => `• ${step}`),
  ].join('\n')
}
