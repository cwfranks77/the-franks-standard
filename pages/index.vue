<template>
  <div class="marketplace-landing marketplace-dark">
    <div class="site-ribbon" role="status" aria-label="Site highlights">
      <div class="container site-ribbon-inner">
        <span class="ribbon-txt">{{ RIBBON_LINE_PROOF }}</span>
        <span class="ribbon-dot" aria-hidden="true" />
        <NuxtLink :to="AUTH_EDUCATION_HUB_PATH" class="ribbon-txt ribbon-txt--link">
          {{ RIBBON_LINE_EDUCATION }} →
        </NuxtLink>
        <span class="ribbon-dot" aria-hidden="true" />
        <span class="ribbon-txt">{{ RIBBON_LINE_ESCROW }}</span>
        <span class="ribbon-dot" aria-hidden="true" />
        <span class="ribbon-txt">4–5% seller fees · FOUNDERS10: 3 mo Pro free</span>
      </div>
    </div>

    <EbayMarketHeader
      :on-home="true"
      :is-owner="isOwner"
      @brand-click="onBrandOrLogoClick"
    />

    <div class="site-trust" aria-label="Why buyers and sellers use this marketplace">
      <div class="container trust-chip-row">
        <NuxtLink to="/how-it-works" class="trust-chip">Escrow · buyer confirms delivery</NuxtLink>
        <NuxtLink to="/learn/tools" class="trust-chip">Coin &amp; authenticity tools</NuxtLink>
        <NuxtLink to="/sell/import" class="trust-chip">Import from eBay</NuxtLink>
        <NuxtLink to="/store-builder" class="trust-chip">AI Store Builder</NuxtLink>
        <NuxtLink to="/video" class="trust-chip">Video inspect</NuxtLink>
        <NuxtLink to="/join/founders10" class="trust-chip">FOUNDERS10 · 3 mo Pro</NuxtLink>
      </div>
    </div>

    <main class="marketplace-landing__main">
      <MarketplaceHome :homepage="homepagePayload" />
    </main>

    <MarketplaceLandingFooter />

    <OperatorUnlockModal
      :open="opModalOpen"
      :phrase="opPhrase"
      :error="opError"
      :submitting="opSubmitting"
      :key-configured="keyConfigured"
      :is-dev="isDev"
      @update:phrase="opPhrase = $event"
      @close="closeOpModal"
      @submit="submitOpModal"
    />

    <NuxtLink v-if="isOwner" to="/sell/start" class="owner-sell-fab" title="Create a listing (free)">
      <span class="fab-plus">+</span>
      <span class="fab-label">Sell</span>
    </NuxtLink>
  </div>
</template>

<script setup>
import { DEFAULT_HOMEPAGE } from '~/utils/ownerConfigDefaults'
import { BC_BRAND } from '~/utils/bcBrand.js'
import {
  AUTH_EDUCATION_HUB_PATH,
  RIBBON_LINE_EDUCATION,
  RIBBON_LINE_ESCROW,
  RIBBON_LINE_PROOF,
} from '~/utils/authenticityEducation.js'

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

const { isOwner } = useOwnerMode()
const {
  isDev,
  opModalOpen,
  opPhrase,
  opError,
  opSubmitting,
  keyConfigured,
  onBrandOrLogoClick,
  closeOpModal,
  submitOpModal,
} = useOpsLogoKnock()
</script>

<style scoped>
.marketplace-landing {
  min-height: 100vh;
  background: #0a0a0c;
  color: #f5f5f7;
}
.marketplace-landing__main {
  display: block;
}
.site-trust {
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.owner-sell-fab {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd814 0%, #ffb020 100%);
  color: #0a0a0c;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 4px 24px rgba(255, 216, 20, 0.35);
  text-decoration: none;
}
.owner-sell-fab:hover {
  transform: translateY(-2px);
  color: #0a0a0c;
}
.fab-plus { font-size: 1.3rem; font-weight: 900; line-height: 1; }
</style>
