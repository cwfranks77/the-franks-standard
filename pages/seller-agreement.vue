<template>
  <div class="page">
    <div class="container legal">
      <h1>Seller Agreement</h1>
      <p class="updated">Last updated: April 26, 2026. Selling on The Franks Standard means you accept these rules in addition to the <NuxtLink to="/terms">Terms of Service</NuxtLink>.</p>

      <h2>1. Authenticity</h2>
      <p>
        You may only list items you have the right to sell. You must provide a Certificate of Authenticity (COA) or complete
        the in-platform authenticity guarantee for each listing as required. Misrepresentation or counterfeit items will result
        in removal, refunds as applicable, and may result in a permanent ban.
      </p>

      <h2>2. Prohibited items</h2>
      <p>You agree not to list items listed on our <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink> page or that violate law.</p>

      <h2>3. Fees and payouts</h2>
      <p>
        Applicable fees and payout timing will be shown in your seller tools and at the time of sale, as each capability is
        turned on for your account. You are responsible for taxes in your jurisdiction. The platform is a marketplace
        facilitator; payment processors and your bank may have separate terms, which you accept when you use those flows.
      </p>

      <h2>4. Shipping and support</h2>
      <p>
        You must ship as described, respond to buyers in good faith, and co-operate with dispute or authenticity review
        requests.
      </p>

      <h2>5. On-platform communication and checkout only</h2>
      <p>
        You may not solicit buyers or sellers to complete a transaction, send payment, or communicate outside The Franks Standard
        (including personal email, phone, social media, or third-party payment apps). Listings, store pages, and messages must not
        include contact or payment information meant to bypass platform escrow and fees. Violations may result in listing removal
        and account suspension.
      </p>

      <h2>6. Contact</h2>
      <p>
        <NuxtLink to="/contact">Contact</NuxtLink> or
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
      </p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Seller Agreement - The Franks Standard',
  description: 'Seller Agreement for The Franks Standard marketplace.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.legal { max-width: 800px; }
.legal h1 { font-size: 2rem; margin-bottom: 8px; }
.legal h2 { font-size: 1.15rem; color: var(--gold); margin: 28px 0 10px; }
.legal p { color: #374151; line-height: 1.7; font-size: 0.95rem; }
.updated { color: var(--stone-500); font-size: 0.86rem; margin-bottom: 24px; }
</style>
