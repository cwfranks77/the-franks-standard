<template>
  <div class="page sellers-page">
    <div class="container narrow">
      <h1>For stores and professional sellers</h1>
      <p class="lead text-muted">
        The Franks Standard is a <strong>marketplace facilitator</strong>: we connect buyers and sellers of authenticity-backed
        inventory. We are not a bank and we are not the seller of your items. Checkout, public inventory, and payouts connect
        in stages so quality stays ahead of scale.
      </p>

      <SitePromoOffers :compact="true" class="sellers-promos" />

      <div class="card callout switch-callout">
        <h2>Seller tools &amp; Top Sellers program</h2>
        <p class="text-muted">
          Live links to accredited appraiser directories (ASA, ISA, AAA), grading services, and sold comps —
          plus our <strong>Seller Excellence</strong> cycle: top sellers every six months earn reduced or waived platform fees.
        </p>
        <NuxtLink to="/seller-tools" class="btn btn-primary btn-sm">Appraisal &amp; research links</NuxtLink>
        <NuxtLink to="/top-sellers" class="btn btn-outline btn-sm">Top sellers &amp; rewards</NuxtLink>
      </div>

      <div class="card callout switch-callout">
        <h2>Import inventory from eBay or CSV</h2>
        <p class="text-muted">
          Skim your active eBay listings or upload an export — review, then list on The Franks Standard with the same photos and titles. Buyers get escrow checkout and clear authenticity rules.
        </p>
        <NuxtLink to="/sell/import" class="btn btn-primary btn-sm">Import tool</NuxtLink>
        <NuxtLink to="/sellers/switch" class="btn btn-outline btn-sm">Switching guide</NuxtLink>
      </div>

      <div class="card callout">
        <h2>What we need from you</h2>
        <ul>
          <li>COA or a signed in-platform guarantee on every public listing, per our
            <NuxtLink to="/how-it-works">How it works</NuxtLink> and
            <NuxtLink to="/seller-agreement">Seller agreement</NuxtLink>.
          </li>
          <li>Accurate item descriptions, shipping in good faith, and co-operation if a buyer or authenticity question comes up.</li>
          <li>Respect for <NuxtLink to="/prohibited-items">prohibited items</NuxtLink> and all applicable law.</li>
        </ul>
        <p class="text-muted small">
          Payment and fee details appear on <NuxtLink to="/pay">Pay &amp; fees</NuxtLink> and in your seller tools as each feature
          is enabled for your account.
        </p>
      </div>

      <div class="actions">
        <a class="btn btn-primary btn-lg" :href="applicationMailto">Apply to sell (email)</a>
        <NuxtLink to="/sell" class="btn btn-outline btn-lg">Prepare a single listing draft</NuxtLink>
        <NuxtLink to="/contact" class="btn btn-dark btn-lg">Contact</NuxtLink>
      </div>

      <p class="text-muted mt-3 small">
        Applications go to
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a> — the same address as
        <NuxtLink to="/contact">Contact</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup>
const applicationMailto = buildSellerApplicationMailto()

useSeoMeta({
  title: 'For sellers & stores — The Franks Standard',
  description:
    'Apply to sell on the authenticity-first marketplace. Marketplace facilitator: COA or signed guarantee, staged rollout, clear fees.',
})
</script>

<style scoped>
.page { padding: 48px 16px 100px; }
.narrow { max-width: 720px; margin: 0 auto; }
.lead { font-size: 1.08rem; line-height: 1.65; margin: 1rem 0 1.5rem; }
.sellers-promos { margin: 0 0 28px; }
.switch-callout { margin-bottom: 1.25rem; }
.switch-callout h2 { font-size: 1.15rem; color: var(--gold); margin-bottom: 0.5rem; }
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.callout { padding: 1.5rem; margin: 1.5rem 0; }
.callout h2 { font-size: 1.15rem; color: var(--gold); margin-bottom: 0.75rem; }
.callout ul { color: #374151; line-height: 1.7; margin: 0; padding-left: 1.25rem; font-weight: 600; }
.callout li { margin-bottom: 0.5rem; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 1.5rem; }
.small { line-height: 1.5; }
.mt-3 { margin-top: 1rem; }
</style>
