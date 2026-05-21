<template>
  <div class="compare-page">
    <section class="hero-compact">
      <div class="container">
        <p class="eyebrow">Why it is different</p>
        <h1>Not another clone of the big marketplaces</h1>
        <p class="lead text-muted">
          Large general marketplaces optimize for everything being listed — volume first. The Franks Standard
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
                <th scope="col">Typical C2C marketplace</th>
                <th scope="col">Typical retail marketplace</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.label">
                <th scope="row" class="row-label">{{ row.label }}</th>
                <td><span class="tfs-cell">{{ row.tfs }}</span></td>
                <td>{{ row.otherC2c }}</td>
                <td>{{ row.retailMarket }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="foot-note text-muted mt-2">
          Retail giants are built for new-in-box scale; broad C2C sites are built for volume. The Franks Standard limits participation to what can be backed
          with documentation — so the catalog stays authentic-first.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Fraud protection — step by step</h2>
        <p class="text-muted mb-2">How each platform handles fakes, disputes, and seller accountability.</p>
        <div class="matrix-wrap">
          <table class="matrix fraud-table">
            <thead>
              <tr>
                <th scope="col" class="topic">Protection step</th>
                <th scope="col" class="tfs-col">The Franks Standard</th>
                <th scope="col">Typical C2C marketplace</th>
                <th scope="col">Typical retail marketplace</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in fraudRows" :key="r.step">
                <th scope="row" class="row-label">{{ r.step }}</th>
                <td><span class="tfs-cell">{{ r.tfs }}</span></td>
                <td>{{ r.otherC2c }}</td>
                <td>{{ r.retailMarket }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container">
        <h2 class="section-title">What only lives here</h2>
        <ul class="unique">
          <li>Certificate of Authenticity or a signed in-platform guarantee is required to list, not an optional badge.</li>
          <li>Disputes are seen through a counterfeit lens first — a ban follows proven fraud, not a slap on the wrist.</li>
          <li>Escrow and confirmation flows are designed for items where condition and provenance are the product.</li>
          <li>Category mix is curated around gear, music, numismatics, and collectibles with real recourse, not one-click commodity SKUs.</li>
          <li>Video calls built in — verify an item face-to-face before buying. No other marketplace offers this.</li>
          <li>AI customer service with phone, chat, and email — not a generic help center maze.</li>
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
const fraudRows = [
  { step: 'Before listing', tfs: 'COA or signed guarantee required — no proof, no publish', otherC2c: 'No verification — anyone can list anything', retailMarket: 'Brand registry optional — most sellers skip it' },
  { step: 'Verification method', tfs: 'COA upload or legally-binding in-platform guarantee with seller\'s real name', otherC2c: 'Optional paid authenticity programs on select categories only', retailMarket: 'No built-in authenticity check for third-party sellers' },
  { step: 'Payment protection', tfs: 'Escrow hold — funds stay locked until buyer confirms item matches listing', otherC2c: 'Managed payments — refund via case system after dispute', retailMarket: 'Buyer guarantee — refund possible but seller may keep strike' },
  { step: 'Dispute process', tfs: 'Fraud-first review: photos, COA check, video call option — resolved in days', otherC2c: 'Case opened → seller responds → platform decides (can take weeks)', retailMarket: 'Claim → automated decision → appeal process' },
  { step: 'Fake item found', tfs: 'Permanent ban for seller, full refund for buyer, potential legal referral', otherC2c: 'Strike system — seller can relist after warning', retailMarket: 'Account warning or temporary suspension — reinstatement possible' },
  { step: 'Repeat offenders', tfs: 'Cannot return — ban is permanent, no appeals for proven fakes', otherC2c: 'May lose selling privileges after multiple strikes', retailMarket: 'Account suspended but new seller accounts possible' },
  { step: 'Buyer recourse', tfs: 'Escrow refund + video call + direct seller contact + 1-800-TFS-HELP', otherC2c: 'Money-back claim (limited window)', retailMarket: 'Return claim (shipping often buyer\'s cost)' },
]

const rows = [
  { label: 'Listing gate', tfs: 'COA or signed platform guarantee to publish', otherC2c: 'Open listing for most items', retailMarket: 'Retail/brand and SKUs' },
  { label: 'Trust model', tfs: 'Auth-first; bans for proven fakes', otherC2c: 'Varies; heavy catalog', retailMarket: 'Shipping speed trust, not provenance' },
  { label: 'Best for', tfs: 'High-trust collectibles and vetted resellers', otherC2c: 'Broad variety and volume', retailMarket: 'Fast commodity shipping' },
  { label: 'Disputes', tfs: 'Escrow hold until you confirm, fraud-first', otherC2c: 'Case system with mixed outcomes', retailMarket: 'Retail-style return policies' },
  { label: 'Scope', tfs: 'Niche, curated, authenticity-led', otherC2c: 'Everything market', retailMarket: 'First-party and marketplace retail' },
]

useSeoMeta({
  title: 'How we compare — The Franks Standard',
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
.lead strong { color: #111827; }
.section { padding: 64px 0; }
.matrix-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--radius-lg); border: 1px solid var(--stone-800); }
.matrix { width: 100%; min-width: 700px; border-collapse: separate; border-spacing: 0; }
.matrix th, .matrix td {
  padding: 14px 16px; font-size: 0.88rem; line-height: 1.45; text-align: left; vertical-align: top;
  border-bottom: 1px solid #d7dde6; color: #374151;
}
.matrix thead th {
  background: #181d25; color: #f3f4f6; font-family: 'Cinzel', serif; font-size: 0.88rem;
}
.topic { width: 20%; }
.tfs-col { color: var(--gold); }
.row-label { color: #111827; font-weight: 700; }
.tfs-cell { color: #0d8a43; font-weight: 700; }
.foot-note { font-size: 0.86rem; max-width: 900px; }
@media (max-width: 900px) {
  .matrix { min-width: 640px; }
  .matrix-wrap { margin: 0 -4px; }
}
.fraud-table .tfs-cell { color: var(--trust-green); }
.fraud-table td:nth-child(3), .fraud-table td:nth-child(4) { color: #6b7280; font-size: 0.85rem; }
.section-dark { background: rgba(0, 0, 0, 0.18); }
.unique { max-width: 800px; margin: 0; padding-left: 1.1rem; color: #e5e7eb; line-height: 1.65; font-weight: 600; }
.unique li { margin-bottom: 10px; }
.cta-section { background: radial-gradient(ellipse at 50% 100%, rgba(201, 168, 76, 0.1) 0%, transparent 55%); }
</style>
