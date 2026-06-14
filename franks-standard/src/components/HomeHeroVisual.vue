<template>
  <div class="hero-visual" aria-hidden="true">
    <div class="hero-visual-main">
      <img
        :src="featured.image"
        :alt="featured.label"
        width="520"
        height="420"
        fetchpriority="high"
        class="hero-visual-hero-img"
        data-showcase-key="cards"
        @error="onShowcaseImageError"
      />
      <span class="hero-visual-badge">COA · Escrow · Verify</span>
    </div>
    <div class="hero-visual-scroll">
      <div class="hero-visual-scroll-inner">
        <div
          v-for="(p, i) in scrollDoubled"
          :key="`${p.label}-${i}`"
          class="hero-visual-thumb"
        >
          <img
            :src="p.image"
            :alt="p.label"
            width="120"
            height="96"
            loading="lazy"
            :data-showcase-key="p.showcaseKey || ''"
            @error="onShowcaseImageError"
          />
          <span>{{ p.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HERO_MOSAIC_PHOTOS, onShowcaseImageError } from '~/utils/marketplaceShowcaseImages.js'

const featured = HERO_MOSAIC_PHOTOS[0]
const scrollDoubled = [...HERO_MOSAIC_PHOTOS, ...HERO_MOSAIC_PHOTOS]
</script>
