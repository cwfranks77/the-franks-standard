/**
 * Social media promotion — platform focus, formats, hashtags, UGC/contests.
 * Aligns with utils/socialBrandCopy.cjs and assets/SOCIAL_MEDIA_ADS.md.
 */

import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'
import {
  SECURITY_DIFFERENTIATORS,
  securityBulletsForSocial,
  REDDIT_COMMUNITY_TARGETS,
  BLOG_OUTREACH_TARGETS,
  buildRedditValuePost,
  buildBlogArticleOutline,
  securityStackOneLiner,
} from '~/utils/securityDifferentiators.js'

export const SITE_URL = 'https://thefranksstandard.com'

export {
  SECURITY_DIFFERENTIATORS,
  REDDIT_COMMUNITY_TARGETS,
  BLOG_OUTREACH_TARGETS,
  buildRedditValuePost,
  buildBlogArticleOutline,
  securityStackOneLiner,
}

/** Focus on 2–3 platforms (don't dilute). */
export const SOCIAL_PLATFORM_FOCUS = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📸',
    audience: 'Card breaks, shop staff, millennial/Gen Z collectors',
    priority: 'primary',
    formats: ['Reels (15–60s)', 'Stories (polls + link sticker)', 'Carousels (fee comparison)', 'Shop highlights'],
    postingCadence: '4–5×/week Reels + daily Stories during launch',
    links: [
      { label: 'Learn hub', url: `${SITE_URL}/learn` },
      { label: 'Fee calculator', url: `${SITE_URL}/learn/tools/fee-calculator` },
      { label: 'Sell', url: `${SITE_URL}/sell/start` },
    ],
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    audience: 'Younger buyers/sellers, break content, "marketplace drama" education',
    priority: 'primary',
    formats: ['Shorts (<60s)', 'Green-screen explainers', 'Before/after import from eBay', 'POV: buyer asks "is it real?"'],
    postingCadence: '1–2×/day Shorts for 14 days, then 3–5×/week',
    links: [
      { label: 'Tracked postcard CTA', url: `${SITE_URL}/go/postcard` },
      { label: 'Import guide', url: `${SITE_URL}/learn/import-ebay-to-franks-standard` },
    ],
  },
  {
    id: 'reddit',
    label: 'Reddit & forums',
    icon: '🔶',
    audience: 'Hobby subs, flippers, eBay sellers, founders (value-first posts)',
    priority: 'community',
    formats: ['Educational text post (no link in title)', 'AMA in comments', 'Fee/COA infographic', 'Cross-post to Indie Hackers / PH'],
    postingCadence: '2–3 helpful comments/week per sub · 1 value post/month per sub max',
    links: [
      { label: 'Community playbook', url: `${SITE_URL}/social/community` },
      { label: 'Protection summary', url: `${SITE_URL}/protection` },
      { label: 'Marketplace policies', url: `${SITE_URL}/marketplace-policy` },
    ],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    audience: 'Shop owners, coin/card dealers, B2B collectibles, serious resellers',
    priority: 'primary',
    formats: ['Text posts + document carousels', 'Founder story', 'Fee math for $10k/mo shops', 'Case study: eBay import'],
    postingCadence: '2–3×/week — quality over volume',
    links: [
      { label: 'Compare fees', url: `${SITE_URL}/compare` },
      { label: 'Store partner', url: `${SITE_URL}/join/store-partner` },
      { label: 'Partners program', url: `${SITE_URL}/partners` },
    ],
  },
]

export const HASHTAG_PACKS = {
  core: ['#TheFranksStandard', '#Collectibles', '#COA', '#AuthenticityMatters'],
  cards: ['#SportsCards', '#CardBreak', '#TradingCards', '#PSA', '#BGS', '#TheHobby'],
  coins: ['#CoinCollecting', '#Numismatics', '#PCGS', '#NGC'],
  seller: ['#Reseller', '#SideHustle', '#eBaySeller', '#SmallBusiness'],
  launch: ['#NewMarketplace', '#SellerTips', '#LowFees'],
  trending: ['#MarketplaceTips', '#CollectorsCommunity', '#TrustYourSeller'],
  security: ['#TrustBothSides', '#EscrowCheckout', '#AntiCounterfeit', '#ProofBeforePublish'],
}

export const FORMAT_SPECS = {
  instagram_reel: { ratio: '9:16', maxSec: 90, tip: 'Hook in 2s · on-screen text · CTA in caption + link sticker' },
  instagram_story: { ratio: '9:16', maxSec: 15, tip: 'Poll sticker + link to /learn/tools/fee-calculator' },
  tiktok: { ratio: '9:16', maxSec: 60, tip: 'Trending sound optional · show escrow/COA on screen' },
  youtube_short: { ratio: '9:16', maxSec: 60, tip: 'Cross-post TikTok edits · end card with thefranksstandard.com' },
  linkedin_post: { ratio: '1.91:1 or document', maxSec: null, tip: 'Lead with shop economics · no hype emojis overload' },
}

/** UGC, contests, polls — engagement templates */
export const ENGAGEMENT_PLAYBOOK = [
  {
    id: 'ugc-coa',
    type: 'UGC',
    title: 'Show your COA Sunday',
    description: 'Sellers post a Reel/Short of their slab + COA scan. Repost best entries to @thefranksstandard Stories (with permission).',
    rules: [
      'Must be your own inventory listed or about to list on Franks Standard',
      'Tag @thefranksstandard + hashtag #FranksCOA',
      'No off-platform payment requests in comments',
    ],
    prize: 'Feature on Stories + 1 month Pro for winner (manual pick)',
  },
  {
    id: 'poll-fees',
    type: 'Poll',
    title: 'Fee stack poll (Story)',
    question: 'What hurts more on a $500 sale?',
    options: ['~13% stacked fees elsewhere', `~${PRICING_PUBLIC.proTxPercent}% on Franks Standard Pro`],
    followUp: 'Link sticker → fee calculator',
  },
  {
    id: 'contest-founders',
    type: 'Contest',
    title: 'FOUNDERS10 seller spotlight',
    description: 'First 10 sellers who list with COA get 3 months Pro — document publicly while spots remain.',
    rules: [
      'Sign up at thefranksstandard.com/join/founders10',
      'Publish 1 listing with COA or signed guarantee',
      'Comment "listed" on announcement post — we verify on-platform',
    ],
    disclaimer: 'While spots last · one per person · no purchase necessary to browse',
  },
  {
    id: 'quiz-authentic',
    type: 'Interactive',
    title: 'Real or fake? carousel',
    description: '3-slide carousel: two items, ask audience which has COA on Franks Standard. Slide 3 = answer + sell CTA.',
    cta: `${SITE_URL}/how-it-works`,
  },
]

const CAPTION_TEMPLATES = {
  instagram: {
    reel: `POV: buyers stop asking "is this real?" 🏛️

Collectible listings on The Franks Standard need seller COA or signed guarantee — we facilitate; we don't guarantee authenticity. Escrow checkout. {{fees}} sale fees by plan.

Import from eBay → list in minutes.
{{cta}}

{{hashtags}}`,
    story: `Poll time 👇 — which fee stack would you pick on a $300 card?

Tap link for free fee calculator ⬆️
{{cta}}`,
    carousel: `Slide 1: "Other marketplaces" fee stack ~{{competitor}}
Slide 2: Franks Standard {{fees}} + proof required
Slide 3: Try the calculator — link in bio

{{cta}}
{{hashtags}}`,
  },
  tiktok: {
    short: `Stop eating 13% in fees on cards you already proved were real 📉

We built a marketplace where:
✅ Seller proof on collectibles
✅ Stripe escrow
✅ {{fees}} seller fees

{{cta}}
{{hashtags}}`,
  },
  linkedin: {
    post: `Card shop owners: authenticity and margin usually don't move together.

The Franks Standard requires seller proof on collectible SKUs (marketplace facilitator, not Platform authentication) — sale fees run {{fees}} by plan ({{launch}} for new sellers), not a stacked ~{{competitor}}.

If you already list on eBay, you can import Active Listings CSV and test the floor without abandoning your current channel.

{{cta}}

#collectibles #sportscards #marketplace #entrepreneurship`,
  },
  reddit: {
    education: buildRedditValuePost({ variant: 'education' }),
    founder: buildRedditValuePost({ variant: 'founder', subreddit: 'sportscards' }),
  },
}

const SECURITY_CAPTION_BLOCK = `Security stack (what sets us apart):
{{securityBullets}}

Full enforcement: {{policyUrl}}
Protection overview: {{protectionUrl}}`

export function hashtagString (packKeys = ['core', 'cards', 'launch']) {
  const tags = new Set()
  for (const key of packKeys) {
    for (const t of HASHTAG_PACKS[key] || []) tags.add(t)
  }
  return [...tags].slice(0, 12).join(' ')
}

export function buildSocialCaption ({ platform = 'instagram', format = 'reel', topic = 'fees', ctaPath = '/sell/start' }) {
  const fees = `${PRICING_PUBLIC.txRangeLabel} (${PRICING_PUBLIC.launchTxPromoPercent}% launch promo 90 days)`
  const competitor = PRICING_PUBLIC.competitorTypical
  const launch = `${PRICING_PUBLIC.launchTxPromoPercent}% for 90 days`
  const cta = `${SITE_URL}${ctaPath.startsWith('/') ? ctaPath : `/${ctaPath}`}`
  const plat = CAPTION_TEMPLATES[platform] || CAPTION_TEMPLATES.instagram
  let template = plat[format] || plat.reel || plat.post || plat.short
  if (!template) template = CAPTION_TEMPLATES.instagram.reel

  const packs =
    topic === 'security'
      ? ['core', 'security', 'trending']
      : topic === 'coa'
        ? ['core', 'cards', 'security']
        : topic === 'coins'
          ? ['core', 'coins']
          : ['core', 'cards', 'seller', 'launch']
  const hashtags = hashtagString(packs)

  if (topic === 'security' && platform !== 'reddit') {
    const securityBlock = SECURITY_CAPTION_BLOCK
      .replace('{{securityBullets}}', securityBulletsForSocial(5))
      .replace('{{policyUrl}}', `${SITE_URL}/marketplace-policy`)
      .replace('{{protectionUrl}}', `${SITE_URL}/protection`)
    template = `${template}\n\n${securityBlock}`
  }

  if (platform === 'reddit') {
    template = CAPTION_TEMPLATES.reddit[format] || CAPTION_TEMPLATES.reddit.education
    return template.trim()
  }

  return template
    .replace(/\{\{fees\}\}/g, fees)
    .replace(/\{\{competitor\}\}/g, competitor)
    .replace(/\{\{launch\}\}/g, launch)
    .replace(/\{\{cta\}\}/g, cta)
    .replace(/\{\{hashtags\}\}/g, hashtags)
    .trim()
}

export const REEL_SCRIPT_IDEAS = [
  { hook: 'I imported 40 eBay listings in 22 minutes', body: 'Screen record Seller Hub CSV → /sell/import → publish with COA', cta: '/sell/import' },
  { hook: 'Buyers asked "is it real?" 50 times — so we changed marketplaces', body: 'Explain COA requirement + escrow in 30s', cta: '/how-it-works' },
  { hook: 'Fee math on a $1,000 card sale', body: 'Green screen calculator vs 13% stacked', cta: '/learn/tools/fee-calculator' },
  { hook: 'Video inspect before you pay', body: 'Show /video room on a high-value SKU', cta: '/video' },
  { hook: 'What happens if a seller refuses a refund?', body: 'Walk through escrow → policy → forced refund → account freeze (on-screen bullets)', cta: '/marketplace-policy' },
  { hook: 'Scan this COA before you pay', body: 'Screen record /verify/coa + listing match', cta: '/protection' },
  { hook: 'We make sellers sign policies before listing', body: 'Show SellerPolicyAgreement + digital signature', cta: '/seller-agreement' },
]

export const SECURITY_SOCIAL_CARDS = SECURITY_DIFFERENTIATORS.map((f) => ({
  title: f.title,
  hook: f.socialHook,
  link: f.link,
}))

export const AUTOMATION_COMMANDS = [
  { cmd: 'npm run post:social', desc: 'Post to Telegram, Facebook Page, X (env keys required)' },
  { cmd: 'npm run post:social:honor -- --x', desc: 'HONOR26 campaign variant' },
  { cmd: 'npm run x:rebrand', desc: 'Update X profile name, bio, URL, photo' },
]
