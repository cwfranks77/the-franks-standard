<template>
  <div class="compare-page">
    <section class="hero-compact">
      <div class="container">
        <p class="eyebrow">Compare fees &amp; perks</p>
        <h1>How The Franks Standard compares</h1>
        <p class="lead text-muted">
          Lower sale fees, built-in proof requirements, escrow, video calls, and import tools — designed for
          collectibles and high-trust resale. See how we stack up against large general marketplaces
          <strong>on the features we actually offer</strong>.
        </p>
        <div class="hero-actions mt-2">
          <NuxtLink to="/pricing" class="btn btn-primary btn-sm">See our pricing</NuxtLink>
          <NuxtLink to="/sell/import" class="btn btn-outline btn-sm">Import from eBay</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section disclaimer-section">
      <div class="container narrow-legal">
        <div class="disclaimer-card" role="note">
          <h2 class="disclaimer-title">{{ disclaimer.title }}</h2>
          <p v-for="(p, i) in disclaimer.paragraphs" :key="i" class="disclaimer-p">{{ p }}</p>
          <p class="disclaimer-asof text-muted">
            Comparison summarized as of <strong>{{ comparisonAsOf }}</strong>.
            Official fee pages:
            <template v-for="(s, idx) in sources" :key="s.name">
              <a :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.name }}</a><span v-if="idx < sources.length - 1"> · </span>
            </template>
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Fees &amp; pricing (illustrative)</h2>
        <p class="text-muted mb-2">
          Our sale fees run {{ txRange }} by plan — often below typical ~{{ competitorTypical }} all-in rates on broad marketplaces.
          Competitor columns are <em>ranges</em> from public seller fee pages, not quotes.
        </p>
        <ComparisonMatrix
          :columns="platformColumns"
          :rows="feeRows"
          row-key="label"
        />
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Perks &amp; tools</h2>
        <p class="text-muted mb-2">What sellers and buyers get beyond “list and hope.”</p>
        <ComparisonMatrix
          :columns="platformColumns"
          :rows="perksRows"
          row-key="label"
        />
        <p class="foot-note text-muted mt-2">
          {{ launchPerks }} · <NuxtLink to="/launch-offer">Launch offer details</NuxtLink>
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Trust &amp; protection</h2>
        <p class="text-muted mb-2">How accountability works — without claiming other platforms never protect buyers.</p>
        <ComparisonMatrix
          :columns="platformColumns"
          :rows="trustRows"
          row-key="label"
        />
      </div>
    </section>

    <section class="section section-dark">
      <div class="container">
        <h2 class="section-title">Why sellers switch here</h2>
        <ul class="unique">
          <li><strong>Lower fees:</strong> {{ txRange }} sale fees vs typical {{ competitorTypical }} elsewhere — keep more margin on the same sale price.</li>
          <li><strong>Seller proof on collectibles:</strong> COA or signed guarantee required for collectible categories — enforced listing rules, not a Platform authenticity warranty.</li>
          <li><strong>Escrow checkout:</strong> funds release after the buyer confirms the item — aligned with high-value collectibles.</li>
          <li><strong>Easy move-in:</strong> skim eBay or upload CSV at <NuxtLink to="/sell/import">Import inventory</NuxtLink>.</li>
          <li><strong>Video verification:</strong> built-in calls from listings — inspect before you commit.</li>
          <li><strong>Founding promos:</strong> <NuxtLink to="/join/founders10">FOUNDERS10</NuxtLink> (first 10 sellers, 3 months Pro) and <NuxtLink to="/honor">HONOR26</NuxtLink> for military/FR — see <NuxtLink to="/pricing">Pricing</NuxtLink> for terms.</li>
        </ul>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="section-title">Try the difference</h2>
        <p class="section-subtitle text-muted">Free to join. Built for collectors, stores, and serious resellers.</p>
        <div class="hero-actions mt-3">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create free account</NuxtLink>
          <NuxtLink to="/sellers/switch" class="btn btn-outline btn-lg">Switching guide</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  comparisonAsOf,
  comparisonDisclaimer,
  competitorSources,
  feeComparisonRows,
  perksComparisonRows,
  trustComparisonRows,
  launchPerksLine,
} from '~/utils/marketplaceComparison.js'
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

const disclaimer = comparisonDisclaimer
const sources = competitorSources
const feeRows = feeComparisonRows
const perksRows = perksComparisonRows
const trustRows = trustComparisonRows
const launchPerks = launchPerksLine
const txRange = PRICING_PUBLIC.txRangeLabel
const competitorTypical = PRICING_PUBLIC.competitorTypical

const platformColumns = [
  { key: 'tfs', label: 'The Franks Standard', highlight: true },
  { key: 'ebay', label: 'eBay (illustrative)' },
  { key: 'etsy', label: 'Etsy (illustrative)' },
  { key: 'amazon', label: 'Amazon 3P (illustrative)' },
]

useSeoMeta({
  title: 'Compare fees & perks — The Franks Standard vs eBay & others',
  description:
    'Illustrative comparison of fees, escrow, COA requirements, and seller tools. Not affiliated with eBay, Etsy, or Amazon. Verify fees on each platform.',
  ogTitle: 'How we compare — The Franks Standard',
})
</script>

<style scoped>
.compare-page { overflow-x: hidden; }
.hero-compact {
  padding: 64px 0 24px;
  background: radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.1) 0%, transparent 50%);
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start; }
.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 8px;
}
.lead { font-size: 1.08rem; line-height: 1.7; max-width: 720px; }
.lead strong { color: #111827; }
.section { padding: 56px 0; }
.section-alt { background: rgba(0, 0, 0, 0.04); }
.narrow-legal { max-width: 820px; }
.disclaimer-card {
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid #d7dde6;
  background: #f9fafb;
}
.disclaimer-title { font-size: 1rem; color: #111827; margin-bottom: 0.75rem; }
.disclaimer-p { font-size: 0.88rem; line-height: 1.6; color: #4b5563; margin: 0 0 0.65rem; }
.disclaimer-asof { font-size: 0.82rem; margin: 0.75rem 0 0; line-height: 1.5; }
.disclaimer-asof a { color: var(--gold); text-decoration: underline; }
.foot-note { font-size: 0.86rem; max-width: 900px; }
.section-dark { background: rgba(0, 0, 0, 0.18); }
.unique {
  max-width: 800px;
  margin: 0;
  padding-left: 1.1rem;
  color: #e5e7eb;
  line-height: 1.65;
  font-weight: 600;
}
.unique li { margin-bottom: 10px; }
.unique a { color: var(--gold); }
.cta-section {
  background: radial-gradient(ellipse at 50% 100%, rgba(201, 168, 76, 0.1) 0%, transparent 55%);
}
</style>
