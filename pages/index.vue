<template>
  <MarketplaceHome
    :homepage="homepagePayload"
    :bc-catalog-items="bcCatalogItems"
  />
</template>

<script setup>
import { DEFAULT_HOMEPAGE } from '~/utils/ownerConfigDefaults'
import { BC_BRAND } from '~/utils/bcBrand.js'
import { BC_AUDIO_CATALOG, processCatalogArrays } from '~/utils/dropshipCatalogs.js'

const staticBcItems = processCatalogArrays([BC_AUDIO_CATALOG])

async function fetchHomepageContent () {
  try {
    return await $fetch('/api/public/site-content', { query: { keys: 'homepage' } })
  } catch {
    return { homepage: DEFAULT_HOMEPAGE }
  }
}

async function fetchBcCatalog () {
  try {
    const data = await $fetch('/api/public/dropship-catalog', {
      query: { storeId: 'bc-performance-audio' },
    })
    return data?.items?.length ? data.items : staticBcItems
  } catch {
    return staticBcItems
  }
}

const { data: siteContent } = await useAsyncData('homepage-content', fetchHomepageContent, {
  default: () => ({ homepage: DEFAULT_HOMEPAGE }),
})

const { data: bcCatalogData } = await useAsyncData('homepage-bc-catalog', fetchBcCatalog, {
  default: () => staticBcItems,
})

const homepagePayload = computed(() => ({
  ...DEFAULT_HOMEPAGE,
  ...(siteContent.value?.homepage || {}),
}))

const bcCatalogItems = computed(() => bcCatalogData.value || staticBcItems)

useSeoMeta({
  title: 'The Franks Standard — Marketplace for Collectibles & Partner Stores',
  description: `Browse authenticated listings and partner dropship stores including ${BC_BRAND.full} on The Franks Standard.`,
})
</script>
