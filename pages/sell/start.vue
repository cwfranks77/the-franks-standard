<template>
  <div class="list-start-page">
    <div class="container" style="padding: 48px 16px 80px; max-width: 720px;">
      <p class="eyebrow">List an item</p>
      <h1>What are you selling?</h1>
      <p class="lead">
        Pick the path that matches your item. Collectibles need authenticity proof first; general merchandise goes straight to the listing form.
      </p>

      <div class="choice-grid">
        <NuxtLink :to="generalSellTo" class="choice-card choice-card--general">
          <span class="choice-icon" aria-hidden="true">📦</span>
          <h2>Non-collectible</h2>
          <p>Sporting goods, electronics, tools, apparel, and other general merchandise.</p>
          <span class="choice-cta">Continue to list an item →</span>
        </NuxtLink>

        <NuxtLink :to="LIST_ITEM_COA_PATH" class="choice-card choice-card--collectible">
          <span class="choice-icon" aria-hidden="true">🏛️</span>
          <h2>Collectible</h2>
          <p>Cards, coins, watches, art, antiques, memorabilia, and similar items that need COA or seller guarantee.</p>
          <span class="choice-cta">Continue to COA / proof step →</span>
        </NuxtLink>
      </div>

      <p class="text-muted small foot-note">
        Not sure?
        <NuxtLink to="/categories">Browse categories</NuxtLink>
        ·
        <NuxtLink to="/how-it-works">How listing proof works</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { LIST_ITEM_COA_PATH, SELL_FORM_PATH } from '~/utils/listItemRoutes.js'

const generalSellTo = { path: SELL_FORM_PATH, query: { kind: 'general' } }

useSeoMeta({
  title: 'List an item | The Franks Standard',
  description: 'Choose collectible (COA required) or non-collectible general merchandise listing.',
})
</script>

<style scoped>
.list-start-page h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  margin-bottom: 12px;
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
}
.lead {
  font-weight: 600;
  line-height: 1.6;
  color: #111827;
  margin-bottom: 28px;
}
.choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.choice-card {
  display: flex;
  flex-direction: column;
  padding: 22px 20px;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  background: #fff;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.choice-card:hover {
  border-color: var(--gold, #c9a84c);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.choice-card--collectible {
  border-color: rgba(201, 168, 76, 0.45);
  background: linear-gradient(135deg, #fff 0%, rgba(201, 168, 76, 0.08) 100%);
}
.choice-icon { font-size: 2rem; margin-bottom: 10px; }
.choice-card h2 {
  font-size: 1.15rem;
  margin: 0 0 8px;
  color: #111827;
}
.choice-card p {
  flex: 1;
  margin: 0 0 14px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #374151;
  font-weight: 600;
}
.choice-cta {
  font-size: 0.85rem;
  font-weight: 800;
  color: #146eb4;
}
.foot-note { margin-top: 24px; }
</style>
