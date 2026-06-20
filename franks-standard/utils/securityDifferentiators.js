/**
 * Security & trust differentiators — use on /social, Reddit, blogs, ads.
 * Binding rules: /marketplace-policy · marketing summary: /protection
 */
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

export const SITE_URL = 'https://thefranksstandard.com'

/** What sets Franks apart — short bullets for social cards */
export const SECURITY_DIFFERENTIATORS = [
  {
    id: 'coa-office',
    icon: '🏢',
    title: 'Floor office COA',
    short: 'Each Franks COA serial (FS-YYYY-NNNNNN) binds to one listing — not a blank certificate.',
    link: '/verify/coa/FS-2026-000001',
    socialHook: 'Scan the serial before you pay — registry must match the listing.',
  },
  {
    id: 'proof-gate',
    icon: '📋',
    title: 'Proof before publish',
    short: 'Uploaded COA or Franks COA serial required on collectibles — listings cannot go live without proof.',
    link: '/how-it-works',
    socialHook: 'We blocked “DM me on Venmo” — escrow stays on-platform.',
  },
  {
    id: 'escrow',
    icon: '🔒',
    title: 'Stripe escrow',
    short: 'Funds held until buyer confirms delivery — disputes use platform records.',
    link: '/protection',
    socialHook: 'Pay on-platform, inspect, then confirm — not wire or Cash App.',
  },
  {
    id: 'authenticity-scan',
    icon: '🛡️',
    title: 'Listing authenticity scan',
    short: 'Automated scan flags disclaimers, off-platform payments, and risky wording before publish.',
    link: '/learn/tools/authenticity-checklist',
    socialHook: 'The listing form blocks “no guarantee of authenticity” language.',
  },
  {
    id: 'coin-study-guide',
    icon: '🪙',
    title: 'Free coin study guide',
    short: 'Struck vs cast, Morgan diagnostics, and the 10-point checklist — printable for buyers and shops.',
    link: '/learn/tools/coin-study-guide',
    socialHook: 'Key-date Morgans at generic silver prices? Assume fake until weight, edge, and comps say otherwise.',
  },
  {
    id: 'report-enforce',
    icon: '🚫',
    title: 'Report → ops → enforce',
    short: 'Buyers report concerns; proven counterfeits → ban, delist, COA revoked.',
    link: '/marketplace-policy',
    socialHook: 'Zero tolerance for proven fakes — honest sellers are not lumped with scammers.',
  },
  {
    id: 'forced-refund',
    icon: '⚖️',
    title: 'Forced refund (seller at fault)',
    short: 'If seller refuses a valid refund, ops can Stripe-refund buyer per policy.',
    link: '/marketplace-policy',
    socialHook: 'Seller-at-fault refunds are in writing — not “good luck in PayPal.”',
  },
  {
    id: 'account-freeze',
    icon: '🧊',
    title: 'Account freeze + platform debt',
    short: 'After forced refund, seller account can freeze (no buy/sell/list/ship) until debt repaid.',
    link: '/marketplace-policy',
    socialHook: 'Enforcement has teeth — freeze list is public in Marketplace Policies.',
  },
  {
    id: 'policy-signature',
    icon: '✍️',
    title: 'Seller policy digital signature',
    short: 'Every seller signs the full policy bundle (terms, marketplace policy, seller agreement) before listing.',
    link: '/seller-agreement',
    socialHook: 'Electronic signature on escrow, refunds, freeze, and ban rules — before first SKU.',
  },
  {
    id: 'video-inspect',
    icon: '📹',
    title: 'Video inspect rooms',
    short: 'Live video rooms to inspect high-value items before escrow checkout.',
    link: '/video',
    socialHook: 'See the slab on camera before you lock escrow.',
  },
  {
    id: 'fees',
    icon: '📉',
    title: 'Lower fees + serious buyers',
    short: `${PRICING_PUBLIC.txRangeLabel} sale fees by plan — buyers come for proof, not endless “is it real?”`,
    link: '/pricing',
    socialHook: `Half the stacked fee math of big marketplaces (${PRICING_PUBLIC.competitorTypical} typical).`,
  },
]

/** One-liner stack for bios and tweet threads */
export function securityStackOneLiner () {
  return 'COA tied to listing · verify serial · escrow · authenticity scan · forced refund + freeze · signed seller policies · video inspect'
}

/** Bullet block for captions (max n items) */
export function securityBulletsForSocial (max = 5) {
  return SECURITY_DIFFERENTIATORS.slice(0, max)
    .map((f) => `✅ ${f.title} — ${f.short}`)
    .join('\n')
}

/** Reddit — value-first posts (read rules; no drive-by links) */
export const REDDIT_COMMUNITY_TARGETS = [
  {
    subreddit: 'sportscards',
    members: '~500k+',
    fit: 'Graded cards, breaks, hobby trust',
    rulesNote: 'Check sidebar — many subs require karma + no pure self-promo. Lead with education.',
    postAngles: ['Fee math on a $500 raw vs graded sale', 'How we require COA before publish', 'AMA: building proof-first marketplace'],
    utm: `${SITE_URL}/browse?utm_source=reddit&utm_medium=community&utm_campaign=sportscards`,
  },
  {
    subreddit: 'Coins',
    members: '~200k+',
    fit: 'PCGS/NGC, numismatics',
    rulesNote: 'No spam — share authentication checklist or counterfeit red flags first.',
    postAngles: ['COA serial tied to one listing office', 'Escrow until delivery confirm'],
    utm: `${SITE_URL}/collections?utm_source=reddit&utm_medium=community&utm_campaign=coins`,
  },
  {
    subreddit: 'Flipping',
    members: '~400k+',
    fit: 'Resellers, margin math',
    rulesNote: 'Show spreadsheet / calculator — link only if asked in comments.',
    postAngles: ['13% fee stack vs 4–5% with proof requirement', 'eBay CSV import walkthrough'],
    utm: `${SITE_URL}/learn/tools/fee-calculator?utm_source=reddit&utm_medium=community&utm_campaign=flipping`,
  },
  {
    subreddit: 'EbaySeller',
    members: '~50k+',
    fit: 'Multi-channel sellers',
    rulesNote: 'Help-first posts win — “I built import + COA gate” not “sign up now”.',
    postAngles: ['Seller Hub CSV → Franks without abandoning eBay', 'Off-platform payment blocking'],
    utm: `${SITE_URL}/sell/import?utm_source=reddit&utm_medium=community&utm_campaign=ebayseller`,
  },
  {
    subreddit: 'Entrepreneur',
    members: '~1M+',
    fit: 'Founder story, marketplace mechanics',
    rulesNote: 'Thursday feedback threads — pitch in comments when relevant.',
    postAngles: ['Trust both sides: escrow for buyers, proof for sellers', 'Policy-as-code: freeze + forced refund'],
    utm: `${SITE_URL}/about?utm_source=reddit&utm_medium=community&utm_campaign=entrepreneur`,
  },
  {
    subreddit: 'SideProject',
    members: '~200k+',
    fit: 'Launch narrative, tech stack',
    rulesNote: 'Monthly promotion thread — use for launch post.',
    postAngles: ['Show HN-style: what we shipped this month', 'Security addons that set us apart'],
    utm: `${SITE_URL}/social?utm_source=reddit&utm_medium=community&utm_campaign=sideproject`,
  },
]

/** Blogging & communities beyond Reddit */
export const BLOG_OUTREACH_TARGETS = [
  {
    id: 'medium',
    name: 'Medium',
    url: 'https://medium.com/new-story',
    type: 'Long-form',
    angle: '“Why every collectibles listing needs a floor office COA” — link protection page once at end.',
    cadence: '1 article / month',
  },
  {
    id: 'substack',
    name: 'Substack',
    url: 'https://substack.com',
    type: 'Newsletter',
    angle: 'Weekly “Proof-first seller” tips — fee calc, import, authenticity checklist.',
    cadence: 'Weekly after 3 posts banked',
  },
  {
    id: 'indiehackers',
    name: 'Indie Hackers',
    url: 'https://www.indiehackers.com/post/new',
    type: 'Founder community',
    angle: 'Milestone posts: escrow live, forced refund policy, seller signatures.',
    cadence: 'Biweekly milestones',
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    url: 'https://www.producthunt.com/posts/new',
    type: 'Launch',
    angle: 'Launch day: tagline “Proof before publish” + gallery of verify COA + escrow flow.',
    cadence: 'One launch + major updates',
  },
  {
    id: 'hackernews',
    name: 'Hacker News (Show HN)',
    url: 'https://news.ycombinator.com/submit',
    type: 'Tech audience',
    angle: 'Show HN: marketplace with policy-signed sellers and ops forced-refund pipeline.',
    cadence: 'Once when stable — expect tough comments, reply honestly',
  },
  {
    id: 'devto',
    name: 'DEV Community',
    url: 'https://dev.to/new',
    type: 'Technical',
    angle: 'How we built listing scan + COA serial registry (no secrets).',
    cadence: 'Optional — if you post engineering content',
  },
  {
    id: 'blowout',
    name: 'Blowout Cards Forums',
    url: 'https://www.blowoutforums.com',
    type: 'Hobby forum',
    angle: 'Signature: shop owner — help threads only; vendor forum if available.',
    cadence: 'Daily helpful replies, 1 vendor intro after 30 helpful posts',
  },
  {
    id: 'linkedin-articles',
    name: 'LinkedIn Articles',
    url: 'https://www.linkedin.com/article/new',
    type: 'B2B',
    angle: 'Card shop economics + enforcement policy transparency.',
    cadence: '2×/month cross-post from LinkedIn feed',
  },
]

export function buildRedditValuePost ({ variant = 'education', subreddit = 'sportscards' }) {
  const base = {
    education: `I keep seeing "is this real?" threads — so I wrote up how a **proof-before-publish** floor works (not a sales pitch):

• COA or signed guarantee required before a listing goes live
• Franks COA serial = one listing office (verify at ${SITE_URL}/verify/coa)
• Stripe escrow until delivery confirmed
• Listing scan blocks "no guarantee" / off-platform payment language
• Written enforcement: seller-at-fault refunds, account freeze if seller refuses

Full rules (binding): ${SITE_URL}/marketplace-policy
Buyer/seller summary: ${SITE_URL}/protection

Happy to answer questions in comments — what would you want to see from a marketplace on trust?`,
    founder: `[Founder note] We launched a collectibles marketplace where **security is the product**:

${securityBulletsForSocial(4)}

Not trying to spam — sharing because r/${subreddit} talks about fakes and fees a lot. If mods want me to remove links, I will.

Discussion: what enforcement would actually make you trust a new platform?`,
    ama: `AMA: Building a proof-first collectibles marketplace (COA gate, escrow, forced refund policy)

I'm Charles — founder of The Franks Standard. We require authenticity proof on every SKU, run Stripe escrow, and published enforcement (freeze, platform debt, bans) in our Marketplace Policies.

Ask me anything about:
- COA serial tied to listings
- Why we block Venmo/PayPal in descriptions
- Seller digital signature on policies before first listing
- Fee math vs typical ~13% stacks

I'll be here ~2 hours. Site: ${SITE_URL} (policies: /marketplace-policy)`,
  }
  return base[variant] || base.education
}

export function buildBlogArticleOutline ({ topic = 'coa' }) {
  const outlines = {
    coa: {
      title: 'The floor office COA: why one serial should mean one listing',
      sections: ['Problem: blank COAs and bait-and-switch photos', 'FS-YYYY-NNNNNN registry', 'Verify before escrow', 'CTA: /verify/coa'],
      cta: `${SITE_URL}/learn/coa-vs-signed-guarantee`,
    },
    enforcement: {
      title: 'What happens when a seller refuses a valid refund',
      sections: ['Escrow first', 'Seller-at-fault table', 'Forced refund', 'Account freeze + platform debt', 'CTA: /marketplace-policy'],
      cta: `${SITE_URL}/marketplace-policy`,
    },
    security: {
      title: '10 security features that set a collectibles marketplace apart',
      sections: SECURITY_DIFFERENTIATORS.map((f) => f.title),
      cta: `${SITE_URL}/protection`,
    },
  }
  return outlines[topic] || outlines.security
}
