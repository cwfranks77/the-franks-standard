<template>
  <section class="live-now-section" aria-labelledby="live-now-title">
    <div class="container">
      <p class="eyebrow-live">Available on the site today</p>
      <h2 id="live-now-title" class="section-title text-center">What you can use right now</h2>
      <p class="section-subtitle text-center text-muted">
        Real tools — not a waitlist. Checkout uses <strong>escrow until you confirm delivery</strong>.
        We do <strong>not</strong> offer a platform money-back guarantee program yet; that is on the roadmap.
      </p>
      <div class="live-now-grid">
        <article
          v-for="(f, i) in live"
          :key="f.title"
          class="live-feature-card"
          :style="{ '--i': i }"
        >
          <span class="live-icon" aria-hidden="true">{{ f.icon }}</span>
          <h4>{{ f.title }}</h4>
          <p>{{ f.desc }}</p>
        </article>
      </div>
      <div class="coming-soon-panel">
        <h3>Coming soon (honest list)</h3>
        <ul class="coming-soon-list">
          <li v-for="c in coming" :key="c.title">
            <strong>{{ c.title }}</strong> — {{ c.desc }}
          </li>
        </ul>
        <p class="text-muted small mt-1">
          <NuxtLink to="/roadmap">See full roadmap →</NuxtLink>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { LIVE_NOW_FEATURES, COMING_SOON_FEATURES } from '~/utils/platformLiveFeatures.js'

const live = LIVE_NOW_FEATURES
const coming = COMING_SOON_FEATURES
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
.live-icon { font-size: 1.5rem; }
.mt-1 { margin-top: 12px; }
.small { font-size: 0.85rem; }
</style>
