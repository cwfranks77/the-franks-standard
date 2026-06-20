import { sanitizeStoreOrListingText } from '~/utils/descriptionSanitize'
import { categoryRequiresCoa } from '~/utils/marketplaceCategories'
import {
  buildStoreResult,
  buildStoreSeoPack,
  type StoreBuilderInput,
  type StoreBuildResult,
  type StoreSeoPack,
} from '~/utils/storeBuilder'

export type StoreBuilderPack = { store: StoreBuildResult; seo: StoreSeoPack }

export type StoreSectionId =
  | 'tagline'
  | 'bio'
  | 'sampleTitles'
  | 'descriptionTemplate'
  | 'pricingTip'
  | 'dropshipTip'
  | 'metaTitle'
  | 'metaDescription'
  | 'keywords'
  | 'listingTitleFormulas'
  | 'htmlMetaBlock'
  | 'jsonLd'
  | 'indexNowTip'
  | 'launchSteps'
  | `searchChecklist:${number}`

function sanitizePack (input: StoreBuilderInput, pack: StoreBuilderPack): StoreBuilderPack {
  const cat = input.category
  const title = input.name
  const store: StoreBuildResult = {
    ...pack.store,
    tagline: sanitizeStoreOrListingText(pack.store.tagline, cat, title),
    bio: sanitizeStoreOrListingText(pack.store.bio, cat, title),
    sampleTitles: pack.store.sampleTitles.map((t) => sanitizeStoreOrListingText(t, cat, t)),
    descriptionTemplate: sanitizeStoreOrListingText(pack.store.descriptionTemplate, cat, title),
    pricingTip: sanitizeStoreOrListingText(pack.store.pricingTip, cat, title),
    dropshipTip: sanitizeStoreOrListingText(pack.store.dropshipTip, cat, title),
    launchSteps: pack.store.launchSteps.map((s) => sanitizeStoreOrListingText(s, cat, title)),
  }
  const seo: StoreSeoPack = {
    ...pack.seo,
    metaTitle: sanitizeStoreOrListingText(pack.seo.metaTitle, cat, title),
    metaDescription: sanitizeStoreOrListingText(pack.seo.metaDescription, cat, title),
    keywords: categoryRequiresCoa(input.category)
      ? pack.seo.keywords
      : pack.seo.keywords.filter((k) => {
          const lower = k.toLowerCase()
          return lower !== 'coa' && lower !== 'authenticated'
        }),
    ogDescription: sanitizeStoreOrListingText(pack.seo.ogDescription, cat, title),
    listingTitleFormulas: pack.seo.listingTitleFormulas.map((f) => sanitizeStoreOrListingText(f, cat, title)),
    googlePreview: {
      ...pack.seo.googlePreview,
      description: sanitizeStoreOrListingText(pack.seo.googlePreview.description, cat, title),
    },
    bingPreview: {
      ...pack.seo.bingPreview,
      description: sanitizeStoreOrListingText(pack.seo.bingPreview.description, cat, title),
    },
    indexNowTip: sanitizeStoreOrListingText(pack.seo.indexNowTip, cat, title),
    searchChecklist: pack.seo.searchChecklist.map((block) => ({
      ...block,
      steps: block.steps.map((step) => sanitizeStoreOrListingText(step, cat, title)),
    })),
  }
  return { store, seo }
}

export function rewriteStoreBuilderPack (input: StoreBuilderInput): StoreBuilderPack {
  const built = buildStoreResult(input)
  const seo = buildStoreSeoPack(input, built)
  return sanitizePack(input, { store: built, seo })
}

function lines (items: string[]): string {
  return items.filter(Boolean).join('\n')
}

/** Fresh AI rewrite for one preview section (local rules — no API charges). */
export function rewriteStoreSection (section: StoreSectionId, input: StoreBuilderInput): string {
  const pack = rewriteStoreBuilderPack(input)

  if (section.startsWith('searchChecklist:')) {
    const idx = Number(section.split(':')[1])
    const block = pack.seo.searchChecklist[idx]
    return block ? lines(block.steps) : ''
  }

  switch (section) {
    case 'tagline':
      return pack.store.tagline
    case 'bio':
      return pack.store.bio
    case 'sampleTitles':
      return lines(pack.store.sampleTitles)
    case 'descriptionTemplate':
      return pack.store.descriptionTemplate
    case 'pricingTip':
      return pack.store.pricingTip
    case 'dropshipTip':
      return pack.store.dropshipTip
    case 'metaTitle':
      return pack.seo.metaTitle
    case 'metaDescription':
      return pack.seo.metaDescription
    case 'keywords':
      return pack.seo.keywords.join(', ')
    case 'listingTitleFormulas':
      return lines(pack.seo.listingTitleFormulas)
    case 'htmlMetaBlock':
      return pack.seo.htmlMetaBlock
    case 'jsonLd':
      return pack.seo.jsonLd
    case 'indexNowTip':
      return pack.seo.indexNowTip
    case 'launchSteps':
      return lines(pack.store.launchSteps)
    default:
      return ''
  }
}
