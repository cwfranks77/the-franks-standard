<template>
  <section class="list-path-chooser" aria-labelledby="list-path-heading">
    <p class="eyebrow">List an item</p>
    <h2 id="list-path-heading">What are you selling?</h2>
    <p class="lead">
      Pick the path that matches your item. Collectibles and antiques always require COA or seller guarantee — no exceptions. General merchandise is only for retail categories (electronics, tools, apparel, etc.).
    </p>

    <div class="choice-grid">
      <button type="button" class="choice-card choice-card--general" @click="chooseGeneral">
        <span class="choice-icon" aria-hidden="true">📦</span>
        <span class="choice-title">Non-collectible</span>
        <span class="choice-desc">Retail only: electronics, tools, apparel, appliances — not cards, coins, art, antiques, or memorabilia.</span>
        <span class="choice-cta">Continue to list an item →</span>
      </button>

      <button type="button" class="choice-card choice-card--collectible" @click="chooseCollectible">
        <span class="choice-icon" aria-hidden="true">🏛️</span>
        <span class="choice-title">Collectible</span>
        <span class="choice-desc">Cards, coins, watches, art, antiques, memorabilia, and similar items that need COA or seller guarantee.</span>
        <span class="choice-cta">Continue to COA / proof step →</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { generalListingRoute, LIST_ITEM_COA_PATH } from '~/utils/listItemRoutes.js'

const router = useRouter()

function chooseGeneral () {
  router.push(generalListingRoute())
}

function chooseCollectible () {
  router.push(`${LIST_ITEM_COA_PATH}/`)
}
</script>

<style scoped>
.list-path-chooser {
  margin-bottom: 28px;
  padding: 24px 20px;
  border-radius: var(--radius-lg);
  border: 2px solid #e5e7eb;
  background: #fff;
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
  margin: 0 0 8px;
}
.list-path-chooser h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  margin: 0 0 10px;
  color: #111827;
}
.lead {
  font-weight: 600;
  line-height: 1.6;
  color: #374151;
  margin: 0 0 20px;
}
.choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.choice-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 20px 18px;
  border-radius: 14px;
  border: 2px solid #d7dde6;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  font-family: inherit;
  color: inherit;
}
.choice-card:hover {
  border-color: #f7ca00;
  background: #fff8d9;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.choice-card--collectible {
  border-color: rgba(201, 168, 76, 0.45);
}
.choice-card--collectible:hover {
  background: #fff8d9;
}
.choice-icon { font-size: 2rem; margin-bottom: 8px; }
.choice-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 6px;
}
.choice-desc {
  flex: 1;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #4b5563;
  font-weight: 600;
  margin-bottom: 12px;
}
.choice-cta {
  font-size: 0.85rem;
  font-weight: 800;
  color: #146eb4;
}
</style>
