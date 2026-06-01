/**
 * Public marketplace comparison data for /compare and /pricing.
 * Keep claims factual, qualified, and linked to official fee pages.
 * Update `comparisonAsOf` when refreshing competitor figures.
 */
import { PRICING_PUBLIC, launchPromoFeeLine } from '~/utils/pricingPublic.js'

export const comparisonAsOf = 'May 2026'

export const comparisonDisclaimer = {
  title: 'Important — read before you rely on this chart',
  paragraphs: [
    'This page is an illustrative comparison for shoppers and sellers researching options. It is not legal, tax, or financial advice.',
    'eBay, Etsy, Amazon, and other names are trademarks of their respective owners. The Franks Standard is not affiliated with, endorsed by, or sponsored by those companies.',
    'Competitor fees, features, and policies change by category, country, seller tier, and date. Ranges below are summarized from each platform’s public seller documentation — verify current terms on their official sites before you list.',
    'Where we describe our platform, we state what we require or offer on The Franks Standard. Where we describe others, we use qualified language (“often,” “varies,” “optional”) rather than absolutes.',
  ],
}

/** Official fee / policy pages (for footnotes). */
export const competitorSources = [
  { name: 'eBay', url: 'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822' },
  { name: 'Etsy', url: 'https://www.etsy.com/legal/fees/' },
  { name: 'Amazon (third-party selling)', url: 'https://sell.amazon.com/pricing' },
]

const tfsTx = `${PRICING_PUBLIC.txRangeLabel} by plan (${PRICING_PUBLIC.launchTxPromoPercent}% launch promo for new sellers’ first 90 days)`

/** Fees & subscriptions — illustrative ranges only. */
export const feeComparisonRows = [
  {
    label: 'Sale / transaction fee (typical)',
    tfs: tfsTx,
    ebay: 'Category-based final value fee; many C2C categories often ~12.9%–15%+ before extras (see eBay fee page)',
    etsy: 'Often ~6.5% transaction + payment processing (~3%+) + $0.20 per listing renewal',
    amazon: 'Referral fee often ~8%–15%+ by category; optional FBA and subscription costs',
  },
  {
    label: 'Monthly store subscription',
    tfs: `$0 Starter · Pro $${PRICING_PUBLIC.proMonthly}/mo · Store $${PRICING_PUBLIC.storeMonthly}/mo`,
    ebay: 'Optional eBay Store subscriptions (tiered)',
    etsy: 'Optional Etsy Plus / Pattern add-ons',
    amazon: 'Professional plan commonly ~$39.99/mo (varies by region)',
  },
  {
    label: 'Listing fee to publish',
    tfs: 'First 10 listings free (Starter); unlimited on paid plans',
    ebay: 'Often free monthly allotments; insertion fees may apply over limits',
    etsy: '$0.20 per listing (4-month renewal cycle)',
    amazon: 'Per-item listing fees may apply on some plans',
  },
  {
    label: 'Payment processing',
    tfs: 'Included in sale fee via Stripe Connect flow',
    ebay: 'Managed payments fees included in seller fee structure',
    etsy: 'Payment processing fee on top of transaction fee',
    amazon: 'Included in referral / selling fee structure',
  },
  {
    label: 'Dispute / mediation fee',
    tfs: 'Included — no per-case platform mediation charge',
    ebay: 'Case-based resolution; fee policies vary',
    etsy: 'Case system; policies vary',
    amazon: 'A-to-z / claim processes; policies vary',
  },
]

/** Product features — what buyers and sellers get. */
export const perksComparisonRows = [
  {
    label: 'COA or seller guarantee to list',
    tfs: 'Required (COA upload or signed in-platform guarantee)',
    ebay: 'Not required platform-wide; optional authenticity programs on select categories',
    etsy: 'Not required platform-wide; shop policies vary',
    amazon: 'Brand / category requirements vary; not a collectibles COA model',
  },
  {
    label: 'Escrow until buyer confirms',
    tfs: 'Yes — Stripe hold until buyer confirms item matches listing',
    ebay: 'Buyer protection via cases/refunds; not the same escrow model',
    etsy: 'Purchase protection via case system',
    amazon: 'A-to-z Guarantee / return policies vary by listing',
  },
  {
    label: 'Video call before purchase',
    tfs: 'Built in — start a call from a listing',
    ebay: 'Not a standard built-in marketplace feature',
    etsy: 'Not a standard built-in marketplace feature',
    amazon: 'Not a standard built-in marketplace feature',
  },
  {
    label: 'Import from eBay / CSV',
    tfs: 'Yes — /sell/import skim or CSV',
    ebay: 'N/A (native platform)',
    etsy: 'CSV / partner tools vary',
    amazon: 'Bulk / feed tools for sellers',
  },
  {
    label: 'Dropship seller tools',
    tfs: 'Supported with seller setup dashboard',
    ebay: 'Allowed; seller responsible for fulfillment',
    etsy: 'Allowed with policy compliance',
    amazon: 'FBA / dropship rules strictly enforced',
  },
  {
    label: 'Collectibles-first browse',
    tfs: 'Curated categories (cards, gear, coins, instruments, etc.)',
    ebay: 'General marketplace — all categories',
    etsy: 'Handmade / vintage / craft focus',
    amazon: 'Retail-scale catalog',
  },
  {
    label: 'Human support line',
    tfs: '(877) 837-0527 + email + in-site help',
    ebay: 'Help center / phone options vary by issue',
    etsy: 'Help center',
    amazon: 'Seller / buyer support portals',
  },
]

/** Trust & accountability — qualified wording. */
export const trustComparisonRows = [
  {
    label: 'Listing proof gate',
    tfs: 'COA or signed guarantee required to publish',
    ebay: 'Self-attested listings; optional paid auth in some categories',
    etsy: 'Shop policies and community standards',
    amazon: 'Category and brand gating varies',
  },
  {
    label: 'Proven counterfeit response',
    tfs: 'Permanent ban policy for proven fraud; buyer refund path',
    ebay: 'Policies and strikes vary by case',
    etsy: 'Policies and account actions vary',
    amazon: 'Account health metrics and appeals',
  },
  {
    label: 'Buyer pays platform fee on top of price',
    tfs: 'No buyer platform fee (sales tax at checkout where applicable)',
    ebay: 'Buyer pays item + tax/shipping; no separate “platform fee” line',
    etsy: 'Similar — tax/shipping at checkout',
    amazon: 'Similar — tax/shipping at checkout',
  },
]

export const launchPerksLine = launchPromoFeeLine()
