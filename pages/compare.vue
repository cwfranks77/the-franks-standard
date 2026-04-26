<template>
  <div class="compare-page">
    <section class="hero-compact">
      <div class="container">
        <p class="eyebrow">Why it is different</p>
        <h1>Not another clone of the big marketplaces</h1>
        <p class="lead text-muted">
          eBay, Amazon, and other giants optimize for everything being listed — volume first. The Franks Standard
          is built for buyers and sellers who will not move high-value or collectible inventory without
          <strong>proof, accountability, and protection</strong>.
        </p>
        <NuxtLink to="/auth/register" class="btn btn-primary btn-sm mt-2">Create a free account</NuxtLink>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">At a glance</h2>
        <p class="text-muted mb-2">An honest positioning row: the Standard is a specialty model, not a one-size product.</p>
        <div class="matrix-wrap">
          <table class="matrix">
            <thead>
              <tr>
                <th scope="col" class="topic">Topic</th>
                <th scope="col" class="tfs-col">The Franks Standard</th>
                <th scope="col">eBay and similar C2C</th>
                <th scope="col">Amazon and retail-first</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.label">
                <th scope="row" class="row-label">{{ row.label }}</th>
                <td><span class="tfs-cell">{{ row.tfs }}</span></td>
                <td>{{ row.ebay }}</td>
                <td>{{ row.amazon }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="foot-note text-muted mt-2">
          Amazon is built for new retail scale; eBay is a broad bazaar. The Franks Standard limits participation to what can be backed
          with documentation — so the catalog stays authentic-first.
        </p>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container">
        <h2 class="section-title">What only lives here (for now)</h2>
        <ul class="unique">
          <li>Certificate of Authenticity or a signed in-platform guarantee is required to list, not an optional badge.</li>
          <li>Disputes are seen through a counterfeit lens first — a ban follows proven fraud, not a slap on the wrist.</li>
          <li>Escrow and confirmation flows are designed for items where condition and provenance are the product.</li>
          <li>Category mix is curated around gear, music, numismatics, and collectibles with real recourse, not one-click commodity SKUs.</li>
        </ul>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="section-title">Get on the list</h2>
        <p class="section-subtitle text-muted">Free to join. Built for the real side of the hobby economy.</p>
        <div class="hero-actions mt-3">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Join the Standard</NuxtLink>
          <NuxtLink to="/how-it-works" class="btn btn-outline btn-lg">Read how it works</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const rows = [
  { label: 'Listing gate', tfs: 'COA or signed platform guarantee to publish', ebay: 'Open listing for most items', amazon: 'Retail/brand and SKUs' },
  { label: 'Trust model', tfs: 'Auth-first; bans for proven fakes', ebay: 'Varies; heavy catalog', amazon: 'Prime trust is logistics, not provenance' },
  { label: 'Best for', tfs: 'High-trust collectibles and vetted resellers', ebay: 'Broad variety and volume', amazon: 'Fast commodity shipping' },
  { label: 'Disputes', tfs: 'Escrow hold until you confirm, fraud-first', ebay: 'Case system with mixed outcomes', amazon: 'A-to-z style retail policies' },
  { label: 'Scope', tfs: 'Niche, curated, authenticity-led', ebay: 'Everything market', amazon: 'First-party and marketplace retail' },
]

useSeoMeta({
  title: 'eBay, Amazon, and the Standard — The Franks Standard',
  description: 'How The Franks Standard is different: authenticity, COA, and accountability versus broad marketplaces.',
})
</script>

<style scoped>
.compare-page { overflow-x: hidden; }
.hero-compact { padding: 64px 0 24px; background: radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.1) 0%, transparent 50%); }
.eyebrow {
  font-size: 0.75rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px;
}
.lead { font-size: 1.08rem; line-height: 1.7; max-width: 720px; }
.lead strong { color: var(--stone-200); }
.section { padding: 64px 0; }
.matrix-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--radius-lg); border: 1px solid var(--stone-800); }
.matrix { width: 100%; min-width: 700px; border-collapse: separate; border-spacing: 0; }
.matrix th, .matrix td {
  padding: 14px 16px; font-size: 0.88rem; line-height: 1.45; text-align: left; vertical-align: top;
  border-bottom: 1px solid var(--stone-800); color: var(--stone-300);
}
.matrix thead th {
  background: var(--stone-900); color: var(--stone-200); font-family: 'Cinzel', serif; font-size: 0.88rem;
}
.topic { width: 20%; }
.tfs-col { color: var(--gold); }
.row-label { color: var(--stone-200); font-weight: 600; }
.tfs-cell { color: var(--stone-100); }
.foot-note { font-size: 0.86rem; max-width: 900px; }
@media (max-width: 900px) {
  .matrix { min-width: 640px; }
  .matrix-wrap { margin: 0 -4px; }
}
.section-dark { background: rgba(0, 0, 0, 0.18); }
.unique { max-width: 800px; margin: 0; padding-left: 1.1rem; color: var(--stone-300); line-height: 1.65; }
.unique li { margin-bottom: 10px; }
.cta-section { background: radial-gradient(ellipse at 50% 100%, rgba(201, 168, 76, 0.1) 0%, transparent 55%); }
</style>
