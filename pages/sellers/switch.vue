<template>
  <div class="page switch-page">
    <div class="container narrow">
      <h1>Switching to The Franks Standard</h1>
      <p class="lead text-muted">
        Easy inventory transfer for sellers. Clear escrow checkout for buyers. This marketplace lives in
        <strong>the-franks-standard</strong> — not ZentraMesh or other repos.
      </p>

      <div class="card section">
        <h2>Sellers</h2>
        <ol class="steps">
          <li>Create an account and sign in.</li>
          <li>
            Open <NuxtLink to="/sell/import">Import inventory</NuxtLink> — enter your eBay username to skim active listings, or upload a CSV export.
          </li>
          <li>Review titles, prices, and photos — import as drafts or publish.</li>
          <li>Add seller proof (uploaded COA or Franks COA) when the category requires it.</li>
          <li>Connect Stripe on <NuxtLink to="/pay">Pay &amp; fees</NuxtLink> when you are ready to accept orders.</li>
        </ol>
        <NuxtLink to="/sell/import" class="btn btn-primary btn-sm">Start import</NuxtLink>
        <NuxtLink to="/sellers" class="btn btn-outline btn-sm">Store application</NuxtLink>
      </div>

      <div class="card section">
        <h2>Buyers</h2>
        <ul>
          <li>Find items on <NuxtLink to="/browse">Browse listings</NuxtLink> or a seller storefront.</li>
          <li>Pay with <strong>Buy now</strong> — funds stay in escrow until you confirm delivery.</li>
          <li>Do not use off-site PayPal or wire requests for listings advertised here.</li>
          <li>Message the seller or start a video call from the listing if you need more photos.</li>
        </ul>
        <NuxtLink to="/browse" class="btn btn-primary btn-sm">Shop now</NuxtLink>
      </div>

      <div class="card section muted-box">
        <h2>Coming from eBay?</h2>
        <p class="text-muted">
          Sellers: we copy public listing data (title, price, photo URL) — you still own the item and fulfill orders here.
          Buyers: you are purchasing on The Franks Standard with our authenticity rules and buyer protection flow.
        </p>
      </div>

      <p class="text-muted small mt-3">
        <NuxtLink to="/how-it-works">How it works</NuxtLink>
        ·
        <NuxtLink to="/seller-agreement">Seller agreement</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Switching guide — The Franks Standard',
  description: 'Move inventory from eBay or CSV and shop with escrow checkout on The Franks Standard.',
})
</script>

<style scoped>
.page { padding: 48px 16px 100px; }
.narrow { max-width: 720px; margin: 0 auto; }
.lead { font-size: 1.05rem; line-height: 1.65; margin: 1rem 0 1.5rem; }
.section { padding: 1.5rem; margin-bottom: 1.25rem; }
.section h2 { font-size: 1.15rem; color: var(--gold); margin-bottom: 0.75rem; }
.steps { line-height: 1.7; padding-left: 1.25rem; margin: 0 0 1rem; }
.section ul { line-height: 1.7; padding-left: 1.25rem; margin: 0 0 1rem; }
.muted-box { opacity: 0.95; }
.mt-3 { margin-top: 1rem; }
</style>
