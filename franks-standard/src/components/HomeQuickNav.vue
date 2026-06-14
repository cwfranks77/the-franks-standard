<template>
  <nav class="mkt-hero-nav" aria-label="Marketplace quick navigation">
    <div class="mkt-hero-cta-row">
      <NuxtLink to="/browse" class="mkt-btn mkt-btn--primary mkt-btn--lg">
        Browse marketplace
      </NuxtLink>
      <NuxtLink to="/sell/start" class="mkt-btn mkt-btn--secondary mkt-btn--lg">Sell</NuxtLink>
      <NuxtLink to="/sell/import" class="mkt-btn mkt-btn--secondary mkt-btn--lg">Import eBay</NuxtLink>
      <NuxtLink to="/video" class="mkt-btn mkt-btn--secondary mkt-btn--lg">Video inspect</NuxtLink>
    </div>

    <div class="mkt-role-tabs" role="tablist" aria-label="Shop or sell">
      <button
        type="button"
        role="tab"
        class="mkt-role-tab"
        :class="{ active: role === 'buyer' }"
        :aria-selected="role === 'buyer'"
        @click="role = 'buyer'"
      >
        Shop (buyer)
      </button>
      <button
        type="button"
        role="tab"
        class="mkt-role-tab"
        :class="{ active: role === 'seller' }"
        :aria-selected="role === 'seller'"
        @click="role = 'seller'"
      >
        Sell (seller tools)
      </button>
    </div>

    <div class="mkt-dept-scroll" aria-label="Shop by category">
      <NuxtLink
        v-for="d in HOME_DEPARTMENTS"
        :key="d.shortLabel"
        :to="departmentBrowseTo(d)"
        class="mkt-dept-tile"
      >
        <span class="mkt-dept-img-wrap">
          <img
            :src="d.image"
            :alt="d.shortLabel"
            width="100"
            height="72"
            loading="lazy"
            :data-showcase-key="deptShowcaseKey(d)"
            @error="onShowcaseImageError"
          />
        </span>
        <span class="mkt-dept-label">{{ d.shortLabel }}</span>
      </NuxtLink>
    </div>

    <div class="mkt-shortcut-grid" role="tabpanel">
      <NuxtLink
        v-for="s in activeShortcuts"
        :key="s.label"
        :to="s.to"
        class="mkt-shortcut-tile mkt-shortcut-tile--photo"
      >
        <span class="mkt-shortcut-photo">
          <img
            :src="s.image"
            :alt="s.label"
            width="280"
            height="160"
            loading="lazy"
            :data-showcase-key="s.showcaseKey || ''"
            @error="onShowcaseImageError"
          />
        </span>
        <span class="mkt-shortcut-text">
          <strong>{{ s.label }}</strong>
          <em>{{ s.hint }}</em>
        </span>
      </NuxtLink>
    </div>
    <p class="mkt-hero-hint text-muted">
      Full categorized lists are in the header under <strong>Features</strong> and <strong>Settings</strong>.
    </p>
  </nav>
</template>

<script setup>
import {
  HOME_DEPARTMENTS,
  HOME_BUYER_SHORTCUTS,
  HOME_SELLER_SHORTCUTS,
  departmentBrowseTo,
} from '~/utils/homeQuickLinks.js'
import { onShowcaseImageError } from '~/utils/marketplaceShowcaseImages.js'

const DEPT_KEY = {
  'Sports cards': 'cards',
  Coins: 'coins',
  Watches: 'watches',
  Sneakers: 'sneakers',
  Guitars: 'guitars',
  Art: 'art',
  Cameras: 'camera',
  'Retro games': 'vintage',
  'Estate finds': 'estate',
  TCG: 'cards',
  Comics: 'comics',
  'All categories': 'art',
}

function deptShowcaseKey (dept) {
  return DEPT_KEY[dept.shortLabel] || ''
}

const role = ref('buyer')
const activeShortcuts = computed(() =>
  role.value === 'seller' ? HOME_SELLER_SHORTCUTS : HOME_BUYER_SHORTCUTS,
)
</script>

<style scoped>
.mkt-hero-hint {
  margin: 10px 0 0;
  font-size: 0.82rem;
  font-weight: 700;
  max-width: 520px;
  color: #000000;
}
.mkt-hero-hint strong {
  color: #000000;
}
</style>
