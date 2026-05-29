<template>
  <section class="live-now-section" aria-labelledby="live-now-title">
    <div class="container">
      <p class="eyebrow-live">Available on the site today</p>
      <h2 id="live-now-title" class="section-title text-center">What you can use right now</h2>
      <p class="section-subtitle text-center text-muted">
        Real tools on the site today. Tap a tab to see buyers, sellers, security, and perks —
        every card links to a live page.
      </p>

      <div class="live-tabs" role="tablist" aria-label="Live features by audience">
        <button
          v-for="t in tabs"
          :id="`live-tab-${t.id}`"
          :key="t.id"
          type="button"
          role="tab"
          class="live-tab"
          :class="{ active: activeTab === t.id }"
          :aria-selected="activeTab === t.id"
          :aria-controls="`live-panel-${t.id}`"
          @click="activeTab = t.id"
        >
          <span class="live-tab-icon" aria-hidden="true">{{ t.icon }}</span>
          {{ t.label }}
        </button>
      </div>

      <div
        v-for="t in tabs"
        :id="`live-panel-${t.id}`"
        :key="`panel-${t.id}`"
        role="tabpanel"
        class="live-tab-panel"
        :class="{ active: activeTab === t.id }"
        :aria-labelledby="`live-tab-${t.id}`"
        :hidden="activeTab !== t.id"
      >
        <div class="live-now-grid">
          <NuxtLink
            v-for="(f, i) in featuresForTab(t.id)"
            :key="f.title"
            :to="f.to"
            class="live-feature-card live-feature-link"
            :style="{ '--i': i }"
          >
            <span class="live-icon" aria-hidden="true">{{ f.icon }}</span>
            <h4>{{ f.title }}</h4>
            <p>{{ f.desc }}</p>
            <span class="live-card-cta">{{ f.cta }} →</span>
          </NuxtLink>
        </div>
      </div>

      <p class="live-now-foot text-center text-muted small">
        <NuxtLink to="/protection">Protection &amp; escrow</NuxtLink>
        ·
        <NuxtLink to="/marketplace-policy">Marketplace policies</NuxtLink>
        ·
        <NuxtLink to="/how-it-works">How it works</NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import {
  LIVE_NOW_TABS,
  LIVE_NOW_BY_TAB,
} from '~/utils/platformLiveFeatures.js'

const tabs = LIVE_NOW_TABS
const activeTab = ref('buyers')

function featuresForTab (id) {
  return LIVE_NOW_BY_TAB[id] || []
}
</script>

<style scoped>
.eyebrow-live {
  text-align: center;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--trust-green);
  font-weight: 800;
  margin-bottom: 8px;
}
.live-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 24px 0 20px;
}
.live-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  font-size: 0.88rem;
  font-weight: 800;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.15s;
}
.live-tab:hover {
  border-color: #c9a84c;
  color: #111827;
}
.live-tab.active {
  border-color: #c9a84c;
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.18), rgba(0, 224, 255, 0.08));
  color: #0f172a;
  box-shadow: 0 4px 14px rgba(201, 168, 76, 0.2);
}
.live-tab-icon { font-size: 1rem; }
.live-tab-panel {
  display: none;
  animation: panel-in 0.25s ease;
}
.live-tab-panel.active {
  display: block;
}
@keyframes panel-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.live-feature-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.live-feature-link:hover {
  border-color: rgba(201, 168, 76, 0.65);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}
.live-feature-link:focus-visible {
  outline: 2px solid #146eb4;
  outline-offset: 2px;
}
.live-card-cta {
  display: inline-block;
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #146eb4;
}
.live-icon { font-size: 1.5rem; }
.live-now-foot { margin-top: 28px; }
.live-now-foot a { font-weight: 700; color: #146eb4; }
.small { font-size: 0.85rem; }
@media (prefers-reduced-motion: reduce) {
  .live-tab-panel { animation: none; }
}
</style>
