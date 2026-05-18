<template>
  <div class="page sellers-page">
    <div class="container narrow">
      <h1>For stores and professional sellers</h1>
      <p class="lead text-muted">
        The Franks Standard is a <strong>marketplace facilitator</strong>: we connect buyers and sellers of authenticity-backed
        inventory. We are not a bank and we are not the seller of your items. Checkout, public inventory, and payouts connect
        in stages so quality stays ahead of scale.
      </p>

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
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.callout { padding: 1.5rem; margin: 1.5rem 0; }
.callout h2 { font-size: 1.15rem; color: var(--gold); margin-bottom: 0.75rem; }
.callout ul { color: #374151; line-height: 1.7; margin: 0; padding-left: 1.25rem; font-weight: 600; }
.callout li { margin-bottom: 0.5rem; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 1.5rem; }
.small { line-height: 1.5; }
.mt-3 { margin-top: 1rem; }
</style>
