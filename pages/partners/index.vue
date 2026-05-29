<template>
  <div class="partners-page">
    <section class="partners-hero">
      <div class="container">
        <p class="eyebrow">Partnerships</p>
        <h1>Influencers, affiliates &amp; co-marketing</h1>
        <p class="lead text-muted">
          Work with nano- and micro-creators in sports cards, coins, comics, and collectibles —
          tracked links, clear FTC disclosure, and perks when your audience lists on The Franks Standard.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/partners/creators" class="btn btn-primary">Creator program</NuxtLink>
          <NuxtLink to="/contact" class="btn btn-outline">Partner with us</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">How collaborations work</h2>
        <div class="partner-grid">
          <article class="partner-card">
            <h3>Tracked affiliate links</h3>
            <p>Each creator gets <code>thefranksstandard.com/r/your-handle</code>. Signups store their handle so we can count referrals and pay bounties.</p>
          </article>
          <article class="partner-card">
            <h3>Co-marketing</h3>
            <p>Spotlight drops, store features, and “best of” posts on our <NuxtLink to="/learn">Learn hub</NuxtLink> for micro creators with aligned audiences.</p>
          </article>
          <article class="partner-card">
            <h3>Promo codes</h3>
            <p><code>CREATOR</code> + <code>FOUNDERS10</code> for your community — limited founding Pro spots for early shops.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Creator tiers</h2>
        <div class="tier-grid">
          <article v-for="t in tierList" :key="t.id" class="tier-card">
            <h3>{{ t.label }}</h3>
            <p class="tier-followers">{{ t.followers }} followers</p>
            <p class="tier-payout"><strong>Typical deal:</strong> {{ t.typicalPayout }}</p>
            <p class="tier-fit text-muted">{{ t.fit }}</p>
          </article>
        </div>
        <p class="text-muted small mt-2">Payouts are manual during launch — we agree terms in writing before your first post.</p>
      </div>
    </section>

    <section class="section">
      <div class="container narrow">
        <h2 class="section-title">FTC disclosure (required)</h2>
        <p class="disclosure-box">{{ ftcLine }}</p>
        <p class="text-muted">Creators must use clear #ad or “paid partnership” language in posts, stories, and video descriptions.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { AFFILIATE_TIERS, AFFILIATE_FTC_DISCLOSURE } from '~/utils/affiliateProgram.js'

const tierList = Object.values(AFFILIATE_TIERS)
const ftcLine = AFFILIATE_FTC_DISCLOSURE

useSeoMeta({
  title: 'Influencer & affiliate partnerships | The Franks Standard',
  description: 'Nano and micro influencer program for collectibles creators — tracked links, co-marketing, and affiliate incentives.',
})
</script>

<style scoped>
.partners-page { padding-bottom: 64px; }
.partners-hero {
  padding: 48px 0 32px;
  background: linear-gradient(180deg, #f8f9fb, #fff);
}
.partners-hero h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
  margin: 0 0 12px;
}
.lead { max-width: 40rem; line-height: 1.65; font-weight: 600; }
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
.section { padding: 40px 0; }
.section-alt { background: #f8f9fb; }
.section-title { font-size: 1.35rem; font-weight: 800; margin-bottom: 20px; }
.partner-grid, .tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.partner-card, .tier-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.partner-card h3, .tier-card h3 { font-size: 1.05rem; font-weight: 800; margin: 0 0 10px; }
.partner-card p, .tier-card p { font-size: 0.92rem; line-height: 1.55; font-weight: 600; color: #374151; margin: 0 0 8px; }
.tier-followers { color: #047857; font-weight: 800; }
.narrow { max-width: 42rem; }
.disclosure-box {
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  font-weight: 600;
  line-height: 1.55;
}
</style>
