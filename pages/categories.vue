<template>
  <div class="page">
    <div class="container">
      <div class="head">
        <h1>Categories</h1>
        <p class="text-muted">Browse by interest. Every live listing is backed by proof of authenticity where required.</p>
      </div>

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

const cats = CATEGORY_CATALOG

useSeoMeta({
  title: 'Categories - The Franks Standard',
  description: 'Shop authentic collectibles, gear, and more. Every category on The Franks Standard is backed by COA or a signed guarantee.',
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
</style>
