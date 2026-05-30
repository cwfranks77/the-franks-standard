<template>
  <div class="page">
    <div class="container">
      <div class="head">
        <h1>Categories</h1>
        <p class="text-muted">Browse by interest. Every live listing is backed by proof of authenticity where required.</p>
        <p class="niche-cta">
          <NuxtLink to="/collections">Niche collections &amp; limited drops →</NuxtLink>
          — curated floors vs generic eBay search.
        </p>
      </div>

      <section v-if="nicheHighlights.length" class="niche-strip">
        <h2 class="niche-strip-title">Featured niches</h2>
        <div class="niche-strip-grid">
          <NuxtLink
            v-for="n in nicheHighlights"
            :key="n.slug"
            :to="`/collections/${n.slug}`"
            class="niche-chip"
          >
            <span>{{ n.icon }}</span>
            <strong>{{ n.name }}</strong>
          </NuxtLink>
        </div>
      </section>

      <div class="grid grid-3">
        <NuxtLink
          v-for="c in cats"
          :key="c.name"
          :to="{ path: '/browse', query: { category: c.name } }"
          class="cat"
        >
          <span class="icon">{{ c.icon }}</span>
          <span class="name">{{ c.name }}</span>
          <span class="hint">Browse on marketplace</span>
        </NuxtLink>
      </div>

      <p class="text-center mt-4 text-muted">Listing something special? <NuxtLink to="/sell">Start a listing</NuxtLink></p>
    </div>
  </div>
</template>

<script setup>
import { CATEGORY_CATALOG } from '~/utils/marketplaceCategories'
import { NICHE_COLLECTIONS } from '~/utils/nicheCollections.js'

const cats = CATEGORY_CATALOG
const nicheHighlights = NICHE_COLLECTIONS

useSeoMeta({
  title: 'Categories - The Franks Standard',
  description: 'Browse collectibles and gear. Collectible categories require seller proof; The Franks Standard facilitates sales and does not guarantee authenticity.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.head { text-align: center; max-width: 640px; margin: 0 auto 40px; }
h1 { font-size: 2rem; margin-bottom: 8px; }
.cat {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 28px 16px; border: 1px solid #d7dde6; border-radius: var(--radius-lg);
  background: #fff; text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
}
.cat:hover { border-color: var(--gold); transform: translateY(-2px); color: inherit; box-shadow: 0 8px 20px rgba(17, 24, 39, 0.1); }
.icon { font-size: 2rem; margin-bottom: 10px; }
.name { font-family: 'Cinzel', serif; font-weight: 700; color: #111827; }
.hint { font-size: 0.78rem; color: #374151; font-weight: 600; margin-top: 6px; }
.niche-cta { margin-top: 12px; font-weight: 600; font-size: 0.95rem; }
.niche-strip { margin-bottom: 32px; text-align: center; }
.niche-strip-title { font-size: 1rem; font-weight: 800; margin-bottom: 12px; color: #374151; }
.niche-strip-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.niche-chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; border: 1px solid rgba(201, 168, 76, 0.45);
  border-radius: 999px; text-decoration: none; color: inherit; background: #fffbeb;
  font-size: 0.88rem;
}
.niche-chip:hover { border-color: var(--gold); }
</style>
