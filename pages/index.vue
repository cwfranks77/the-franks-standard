<template>
  <MarketplaceHome :homepage="homepagePayload" />
</template>

<script setup>
import { DEFAULT_HOMEPAGE } from '~/utils/ownerConfigDefaults'
import { BC_BRAND } from '~/utils/bcBrand.js'

async function fetchHomepageContent () {
  try {
    return await $fetch('/api/public/site-content', { query: { keys: 'homepage' } })
  } catch {
    return { homepage: DEFAULT_HOMEPAGE }
  }
}

const { data: siteContent } = await useAsyncData('homepage-content', fetchHomepageContent, {
  default: () => ({ homepage: DEFAULT_HOMEPAGE }),
})

const homepagePayload = computed(() => ({
  ...DEFAULT_HOMEPAGE,
  ...(siteContent.value?.homepage || {}),
}))

useSeoMeta({
  title: 'The Franks Standard — Marketplace for Collectibles & Partner Stores',
  description: `Browse authenticated listings and partner dropship stores including ${BC_BRAND.full} on The Franks Standard.`,
})
</script>
