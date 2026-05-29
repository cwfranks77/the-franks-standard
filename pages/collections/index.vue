<template>
  <div class="collections-page">
    <section class="coll-hero">
      <div class="container">
        <p class="eyebrow">Collections</p>
        <h1>Niche floors &amp; limited drops</h1>
        <p class="lead text-muted">
          We are not another endless bazaar. Curated categories with <strong>mandatory proof</strong>,
          <strong>Stripe escrow</strong>, and limited-edition spotlights you will not find lost in generic search.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/browse?limited=1" class="btn btn-primary btn-sm">Limited editions live</NuxtLink>
          <NuxtLink to="/categories" class="btn btn-outline btn-sm">All categories</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Limited drops</h2>
        <p class="text-muted mb-2">Campaign spotlights — sellers tag listings as limited edition; buyers get exclusivity with secure checkout.</p>
        <div class="coll-grid">
          <NuxtLink
            v-for="d in LIMITED_DROPS"
            :key="d.slug"
            :to="`/collections/${d.slug}`"
            class="coll-card limited"
          >
            <span class="coll-icon">{{ d.icon }}</span>
            <span class="limited-pill">Limited drop</span>
            <h3>{{ d.label }}</h3>
            <p>{{ d.subtitle }}</p>
            <p class="promo-line">{{ d.promoLine }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Niche categories (vs generic eBay browse)</h2>
        <div class="coll-grid">
          <NuxtLink
            v-for="n in NICHE_COLLECTIONS"
            :key="n.slug"
            :to="`/collections/${n.slug}`"
            class="coll-card"
          >
            <span class="coll-icon">{{ n.icon }}</span>
            <h3>{{ n.name }}</h3>
            <p>{{ n.tagline }}</p>
            <span class="browse-hint">Explore niche →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container trust-band">
        <h2>Exclusivity + secure transactions</h2>
        <ul>
          <li><strong>Proof required</strong> — COA upload or signed in-platform guarantee on every listing</li>
          <li><strong>Escrow checkout</strong> — Stripe; seller paid after buyer confirms delivery</li>
          <li><strong>Lower fees</strong> — {{ txRange }} sale fees by plan, not ~{{ competitor }} stacked on big marketplaces</li>
          <li><strong>Video inspect</strong> — high-value niches can use live inspection before payment</li>
        </ul>
        <NuxtLink to="/how-it-works" class="btn btn-outline btn-sm">How buying works</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { LIMITED_DROPS, NICHE_COLLECTIONS } from '~/utils/nicheCollections.js'
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

const txRange = PRICING_PUBLIC.txRangeLabel
const competitor = PRICING_PUBLIC.competitorTypical

useSeoMeta({
  title: 'Niche collections & limited drops | The Franks Standard',
  description: 'Curated collectibles niches and limited-edition floors — COA, escrow, and proof-first listings unlike generic marketplace search.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.coll-hero { padding: 48px 0 28px; background: linear-gradient(180deg, #f8f9fb, #fff); }
.coll-hero h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.2rem); }
.lead { max-width: 42rem; line-height: 1.65; font-weight: 600; }
.eyebrow { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #92400e; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.section { padding: 36px 0; }
.section-alt { background: #f8f9fb; }
.coll-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}
.coll-card {
  display: block;
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.coll-card:hover { border-color: rgba(201, 168, 76, 0.55); box-shadow: 0 8px 24px rgba(17, 24, 39, 0.08); }
.coll-card.limited { border-color: rgba(180, 83, 9, 0.35); background: linear-gradient(180deg, #fffbeb, #fff); }
.coll-icon { font-size: 1.75rem; display: block; margin-bottom: 8px; }
.limited-pill {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #92400e;
  background: rgba(251, 191, 36, 0.25);
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.coll-card h3 { font-size: 1.05rem; font-weight: 800; margin: 0 0 8px; color: #111827; }
.coll-card p { font-size: 0.9rem; font-weight: 600; color: #4b5563; line-height: 1.5; margin: 0; }
.promo-line { margin-top: 10px; font-size: 0.82rem; color: #047857; }
.browse-hint { display: block; margin-top: 12px; font-size: 0.82rem; font-weight: 700; color: #146eb4; }
.trust-band {
  max-width: 40rem;
  padding: 24px;
  background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: 12px;
}
.trust-band h2 { font-size: 1.2rem; margin-bottom: 12px; }
.trust-band ul { padding-left: 1.2rem; line-height: 1.6; font-weight: 600; color: #374151; }
</style>
