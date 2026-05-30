<template>
  <nav class="mkt-hero-nav" aria-label="Marketplace quick navigation">
    <div class="mkt-hero-cta-row">
      <NuxtLink to="/browse" class="mkt-btn mkt-btn--primary">
        Browse marketplace
      </NuxtLink>
      <NuxtLink to="/sell/start" class="mkt-btn mkt-btn--secondary">Sell</NuxtLink>
      <NuxtLink to="/sell/import" class="mkt-btn mkt-btn--secondary">Import eBay</NuxtLink>
      <NuxtLink to="/video" class="mkt-btn mkt-btn--secondary">Video inspect</NuxtLink>
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
          <img :src="d.image" :alt="''" width="64" height="48" loading="lazy" @error="onShowcaseImageError" />
        </span>
        <span class="mkt-dept-label">{{ d.shortLabel }}</span>
      </NuxtLink>
    </div>

    <div class="mkt-shortcut-grid" role="tabpanel">
      <NuxtLink
        v-for="s in activeShortcuts"
        :key="s.label"
        :to="s.to"
        class="mkt-shortcut-tile"
      >
        <img :src="s.image" :alt="''" width="40" height="32" loading="lazy" class="mkt-shortcut-img" @error="onShowcaseImageError" />
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
