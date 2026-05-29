<template>
  <div class="protection-page">
    <section class="prot-hero">
      <div class="container">
        <p class="eyebrow">Trust both sides</p>
        <h1>{{ PROTECTION_HEADLINE }}</h1>
        <p class="lead text-muted">
          The Franks Standard is proof-first — not anti-seller. Honest shops get a floor that showcases real inventory.
          Serious buyers get COA binding, escrow, and enforcement against proven fakes.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container two-col">
        <div>
          <h2 class="col-title buyer">Buyer protection</h2>
          <ul class="pillar-list">
            <li v-for="p in BUYER_PILLARS" :key="p.title">
              <span class="pi">{{ p.icon }}</span>
              <div>
                <strong>{{ p.title }}</strong>
                <p>{{ p.desc }}</p>
              </div>
            </li>
          </ul>
          <NuxtLink to="/how-it-works" class="btn btn-outline btn-sm">How buying works</NuxtLink>
          <NuxtLink to="/learn/tools/coin-study-guide" class="btn btn-outline btn-sm" style="margin-left: 8px;">Coin study guide</NuxtLink>
        </div>
        <div>
          <h2 class="col-title seller">Seller protection</h2>
          <ul class="pillar-list">
            <li v-for="p in SELLER_PILLARS" :key="p.title">
              <span class="pi">{{ p.icon }}</span>
              <div>
                <strong>{{ p.title }}</strong>
                <p>{{ p.desc }}</p>
              </div>
            </li>
          </ul>
          <NuxtLink to="/sellers" class="btn btn-outline btn-sm">For sellers</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container guarantee-box">
        <h2>Refunds, disputes &amp; enforcement</h2>
        <p>
          Binding rules live in our
          <NuxtLink to="/marketplace-policy"><strong>Marketplace Policies &amp; Enforcement</strong></NuxtLink>
          (platform operating standards). Summary:
        </p>
        <ul>
          <li>Pay through Stripe escrow on the platform — not Venmo or wire.</li>
          <li><strong>Seller at fault</strong> (fake, not as described, upheld dispute): buyer refund; seller must cooperate. If the seller refuses, we may force-refund, record <strong>platform debt</strong>, and <strong>freeze</strong> the account (no buy/sell/listing edits/escrow payout) until repaid.</li>
          <li><strong>Buyer at fault</strong> (remorse, false claim): refund typically denied; outbound shipping often not returned.</li>
          <li>Funds come from escrow, seller Stripe balance, then a discretionary <strong>protection reserve</strong> — not the founder personally.</li>
          <li>After debt repayment, we may still permanently ban for serious violations.</li>
        </ul>
        <p class="text-muted small">
          <NuxtLink to="/terms">Terms</NuxtLink> ·
          <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink> ·
          <NuxtLink to="/marketplace-policy">Full policy (refund table, freeze list, bans)</NuxtLink>
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container cta-row">
        <NuxtLink to="/browse" class="btn btn-primary">Browse with confidence</NuxtLink>
        <NuxtLink to="/sell" class="btn btn-outline">Sell with proof</NuxtLink>
        <NuxtLink to="/collections" class="btn btn-outline">Collections</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PROTECTION_HEADLINE, BUYER_PILLARS, SELLER_PILLARS } from '~/utils/protectionMessaging.js'

useSeoMeta({
  title: 'Buyer & seller protection | The Franks Standard',
  description: 'Balanced trust: COA floor offices, escrow, seller fairness, and dispute policy — proof-first, not anti-seller.',
})
</script>

<style scoped>
.prot-hero { padding: 48px 0 32px; background: linear-gradient(180deg, #f8f9fb, #fff); }
.prot-hero h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.2rem); }
.eyebrow { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #92400e; }
.lead { max-width: 42rem; line-height: 1.65; font-weight: 600; }
.section { padding: 40px 0; }
.section-alt { background: #f8fafc; }
.two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; }
.col-title { font-size: 1.2rem; margin-bottom: 16px; }
.col-title.buyer { color: #047857; }
.col-title.seller { color: #1d4ed8; }
.pillar-list { list-style: none; padding: 0; margin: 0 0 20px; }
.pillar-list li { display: flex; gap: 12px; margin-bottom: 16px; }
.pi { font-size: 1.4rem; }
.pillar-list p { margin: 4px 0 0; font-size: 0.9rem; color: #4b5563; font-weight: 600; }
.guarantee-box { max-width: 40rem; }
.guarantee-box ul { line-height: 1.6; font-weight: 600; }
.cta-row { display: flex; flex-wrap: wrap; gap: 12px; }
</style>
