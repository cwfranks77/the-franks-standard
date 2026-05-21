<template>
  <div class="page">
    <div class="container legal">
      <h1>Terms of Service</h1>
      <p class="updated">Last updated: April 26, 2026. These terms may be updated; continued use of the site means you accept the current version.</p>

      <h2>1. The service</h2>
      <p>
        The Franks Standard is an online marketplace for buyers and sellers of items that require proof of authenticity. By using
        the site, you agree to these terms and to our <NuxtLink to="/privacy">Privacy Policy</NuxtLink> and, if you sell,
        the <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>.
      </p>

      <h2>2. Marketplace facilitator</h2>
      <p>
        The Franks Standard is a <em>platform</em> and marketplace facilitator. We are not the seller of items listed by third
        parties, and we are not a bank, money transmitter, or escrow agent except where we say otherwise in a specific
        product flow or in the terms of a payment provider you choose at checkout. Individual sales are between the buyer
        and the seller; the platform, payment processors, and (where used) your card issuer or bank have their own terms and
        roles, which you should read at checkout. Features such as public listing shelves, connect payouts, and hold-and-release
        payments may be offered in phases—see
        <NuxtLink to="/sellers">For sellers</NuxtLink>,
        <NuxtLink to="/how-it-works">How it works</NuxtLink>, and
        <NuxtLink to="/contact">Contact</NuxtLink> for what is available and how to work with the team to go live.
      </p>

      <h2>3. Accounts</h2>
      <p>You are responsible for your account credentials and for all activity under your account. You must provide accurate information.</p>

      <h2>4. Listings and authenticity</h2>
      <p>
        Sellers must comply with our authenticity requirements, including providing a COA or signed in-platform guarantee as
        required. Prohibited or illegal items are not allowed; see <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>.
      </p>

      <h2>5. Payments and disputes</h2>
      <p>
        Payment processing and escrow (where applicable) will follow the flows and provider terms we describe at checkout.
        Platform fees are transaction fees on completed sales, optional subscription plans, and listing fees as shown on
        <NuxtLink to="/pricing">Pricing</NuxtLink> — we do not charge buyers or sellers a separate dispute or mediation fee.
        We take counterfeit and misrepresentation seriously; see our <NuxtLink to="/how-it-works">How it works</NuxtLink> page
        for our standards.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        The service is provided &quot;as is.&quot; To the maximum extent permitted by law, The Franks Standard and its
        operators are not liable for indirect or consequential damages. Some jurisdictions do not allow certain limitations;
        in those cases, our liability is limited to the fullest extent allowed by law.
      </p>

      <h2>7. Contact</h2>
      <p>For terms questions: <NuxtLink to="/contact">Contact</NuxtLink> or <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a></p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Terms of Service - The Franks Standard',
  description: 'Terms of Service for The Franks Standard marketplace.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.legal { max-width: 800px; }
.legal h1 { font-size: 2rem; margin-bottom: 8px; }
.legal h2 { font-size: 1.15rem; color: var(--gold); margin: 28px 0 10px; }
.legal p { color: #374151; line-height: 1.7; font-size: 0.95rem; }
.updated { color: #4b5563; font-size: 0.86rem; margin-bottom: 24px; }
</style>
