<template>
  <section class="showcase-reel" aria-label="Collectibles on the floor">
    <div class="showcase-reel-head container">
      <p class="showcase-reel-eyebrow">Live floor energy</p>
      <h2 class="showcase-reel-title">Real categories. Real inventory. Proof on every handoff.</h2>
      <p class="showcase-reel-lead text-muted">
        A new standard for how we buy, sell, and trade — scroll the floor, then dive into what you collect.
      </p>
    </div>

    <div class="showcase-reel-track-wrap" aria-hidden="true">
      <div class="showcase-reel-track showcase-reel-track--a">
        <NuxtLink
          v-for="(item, i) in reelDoubled"
          :key="`a-${item.id}-${i}`"
          :to="browseFor(item)"
          class="showcase-reel-card"
        >
          <img :src="item.image" :alt="item.title" width="280" height="200" loading="lazy" />
          <span class="showcase-reel-card-meta">
            <span class="showcase-reel-tag">{{ item.tag }}</span>
            <strong>{{ item.title }}</strong>
          </span>
        </NuxtLink>
      </div>
      <div class="showcase-reel-track showcase-reel-track--b">
        <NuxtLink
          v-for="(item, i) in reelDoubledReverse"
          :key="`b-${item.id}-${i}`"
          :to="browseFor(item)"
          class="showcase-reel-card"
        >
          <img :src="item.image" :alt="item.title" width="280" height="200" loading="lazy" />
          <span class="showcase-reel-card-meta">
            <span class="showcase-reel-tag">{{ item.tag }}</span>
            <strong>{{ item.title }}</strong>
          </span>
        </NuxtLink>
      </div>
    </div>

    <div class="container showcase-reel-cta">
      <NuxtLink to="/browse" class="mkt-btn mkt-btn--primary">Browse the floor</NuxtLink>
      <NuxtLink to="/sell/start" class="mkt-btn mkt-btn--secondary">List an item</NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { SHOWCASE_REEL_ITEMS } from '~/utils/marketplaceShowcaseImages.js'

const reelDoubled = [...SHOWCASE_REEL_ITEMS, ...SHOWCASE_REEL_ITEMS]
const reelDoubledReverse = [...[...SHOWCASE_REEL_ITEMS].reverse(), ...[...SHOWCASE_REEL_ITEMS].reverse()]

function browseFor (item) {
  if (!item.category) return '/browse'
  return { path: '/browse', query: { category: item.category } }
}
</script>
