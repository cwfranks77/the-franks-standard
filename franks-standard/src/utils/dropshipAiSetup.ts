import { buildStoreResult, slugifyStore, type StoreBuilderInput } from '~/utils/storeBuilder'

const PROVIDER_NAMES: Record<string, string> = {
  custom: 'My own supplier (any company)',
  doba: 'Doba',
  'inventory-source': 'Inventory Source',
  spocket: 'Spocket',
  syncee: 'Syncee',
  zendrop: 'Zendrop',
  cjdropshipping: 'CJdropshipping',
  aliexpress: 'AliExpress / overseas supplier',
  wholesale: 'Local wholesale / trade show supplier',
}

export type DropshipExperience = 'new' | 'some' | 'pro'
export type DropshipNiche =
  | 'sports-cards'
  | 'sneakers'
  | 'general'
  | 'home'
  | 'other'

export interface DropshipAiIntake {
  storeName: string
  niche: DropshipNiche
  nicheDetail: string
  experience: DropshipExperience
  wantsAutomation: boolean
  monthlyOrders: string
  supplierName: string
  contactEmail: string
}

export interface DropshipAiPlan {
  recommendedProviderKey: string
  recommendedProviderName: string
  fulfillmentMode: 'manual' | 'integrated'
  storeSlug: string
  storeBio: string
  tagline: string
  whyProvider: string
  setupSteps: string[]
  apiSteps: string[]
  catalogSteps: string[]
  listingChecklist: string[]
  automationOwnerSteps: string[]
  outreachSnippet: string
}

const NICHE_CATEGORY: Record<DropshipNiche, string> = {
  'sports-cards': 'Sports Cards & Memorabilia',
  sneakers: 'Sneakers & Streetwear',
  general: 'General Merchandise',
  home: 'General Merchandise',
  other: 'General Store',
}

export function buildDropshipAiPlan (intake: DropshipAiIntake): DropshipAiPlan {
  const name = intake.storeName.trim() || 'My Dropship Store'
  const slug = slugifyStore(name)
  const nicheLabel = intake.nicheDetail.trim() || NICHE_CATEGORY[intake.niche] || 'collectibles'

  let recommendedProviderKey = 'custom'
  let fulfillmentMode: 'manual' | 'integrated' = 'manual'
  let whyProvider =
    'Start with your own supplier so you control quality and COA — add API automation later if you want.'

  if (intake.wantsAutomation && intake.experience !== 'new') {
    recommendedProviderKey = 'doba'
    fulfillmentMode = 'integrated'
    whyProvider =
      'Doba + FLXPOINT is the best match on this platform for US catalog dropship with optional auto-dispatch when you add your own API keys.'
  } else if (intake.wantsAutomation) {
    recommendedProviderKey = 'doba'
    fulfillmentMode = 'manual'
    whyProvider =
      'Doba fits collectibles and general merch. Start manual (you place orders), then add API keys in step 4 when your account is ready.'
  } else if (intake.supplierName.trim()) {
    recommendedProviderKey = 'custom'
    whyProvider = `You named "${intake.supplierName.trim()}" — we will save that as your supplier and use manual fulfillment.`
  }

  const providerName = PROVIDER_NAMES[recommendedProviderKey] || recommendedProviderKey
  const storeInput: StoreBuilderInput = {
    name,
    description: `Dropship ${nicheLabel} — ${intake.nicheDetail || 'curated catalog'}`,
    category: NICHE_CATEGORY[intake.niche],
    style: 'dropship',
    priceMin: 15,
    priceMax: 250,
    volume: intake.experience === 'pro' ? '20-100' : '5-20',
    slug,
    city: '',
    state: '',
    country: 'US',
    focusKeywords: nicheLabel,
    extraKeywords: 'dropship, authenticated, COA',
    brandVoice: 'professional',
    targetAudience: 'buyers on The Franks Standard',
    websiteUrl: '',
    instagram: '',
    facebook: '',
  }
  const store = buildStoreResult(storeInput)

  const setupSteps = [
    `Store name: ${name} — slug ${slug} (thefranksstandard.com/store/${slug})`,
    `Pick provider: ${providerName} — ${whyProvider}`,
    intake.experience === 'new'
      ? 'Create your supplier account today (use your email, not ours) and save the login in a password manager.'
      : 'Confirm your existing supplier account can dropship to US buyers with tracking.',
    fulfillmentMode === 'integrated'
      ? 'Choose auto-dispatch and add FLXPOINT/Doba API keys in step 4 (optional until you are ready).'
      : 'Choose manual fulfillment — when a buyer pays, we email you order + SKU; you place the order with your supplier.',
    'Import catalog: Seller Hub CSV on /sell/import (CSV tab) or paste supplier CSV with Title, Price, Supplier SKU.',
    'Collectible listings need seller COA or signed guarantee before publish (when category requires).',
    'Connect Stripe payouts in Dashboard if not done yet.',
  ]

  const apiSteps =
    fulfillmentMode === 'integrated' && recommendedProviderKey === 'doba'
      ? [
          'In Doba: get FLXPOINT API key + supplier ID + warehouse ID.',
          'Paste keys in step 4 of this wizard (stored per seller, not shared).',
          'Owner: run scripts/setup-doba-automation.ps1 once for platform webhook + dispatch cron.',
          'Point FLXPOINT webhook to inventory-source-webhook on Supabase.',
        ]
      : ['Skip API for now — manual mode works without any developer keys.']

  const catalogSteps = [
    'eBay Seller Hub → Reports → Download Active listings CSV (if migrating from eBay).',
    'Or export from Doba / Inventory Source / your supplier portal.',
    'On site: Sell → Import inventory → eBay CSV (best) tab → upload → Import selected.',
    'Check dropship checkbox if CSV is from Doba with Supplier SKU column.',
  ]

  const listingChecklist = [
    'Listing mode: Dropship',
    `Supplier name + contact filled (from plan: ${providerName || intake.supplierName || 'your supplier'})`,
    'Supplier SKU on every line item (required for dispatch)',
    'Wholesale cost when known (accurate Stripe split)',
    'Use Write with AI on Sell page for descriptions',
    'Real photos when possible — avoid duplicate supplier stock text',
  ]

  const automationOwnerSteps = [
    'Supabase secrets: FLXPOINT_API_KEY, FLXPOINT_WEBHOOK_SECRET, DOBA supplier/warehouse IDs',
    'Deploy inventory-source-dispatch + inventory-source-webhook',
    'Schedule dispatch every 2–5 minutes (GitHub workflow dropship-dispatch-cron.yml)',
    'Monitor /ops/dropship for queue errors',
  ]

  const outreachSnippet =
    `Hi — I run ${name} on The Franks Standard (escrow, COA standard, lower fees). ` +
    `We dropship ${nicheLabel}. Store: thefranksstandard.com/store/${slug}`

  return {
    recommendedProviderKey,
    recommendedProviderName: providerName || intake.supplierName || 'My own supplier',
    fulfillmentMode,
    storeSlug: slug,
    storeBio: store.bio,
    tagline: store.tagline,
    whyProvider,
    setupSteps,
    apiSteps,
    catalogSteps,
    listingChecklist,
    automationOwnerSteps,
    outreachSnippet,
  }
}
