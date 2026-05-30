<template>
  <div class="page">
    <div class="container legal">
      <h1>Terms of Service</h1>
      <p class="updated">
        Last updated: {{ POLICY_LAST_UPDATED }}. These terms may be updated; continued use of the site means you accept the
        current version. See also our
        <NuxtLink to="/marketplace-policy">Marketplace Policies &amp; Enforcement</NuxtLink> (platform operating standards).
      </p>

      <h2>1. The service</h2>
      <p>
        The Franks Standard (&quot;Platform,&quot; &quot;we,&quot; &quot;us&quot;) is an online marketplace for buyers and sellers of items that
        require proof of authenticity. By using the site, you agree to these Terms, our
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>,
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>, and, if you sell, the
        <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>.
      </p>

      <h2>2. Marketplace facilitator</h2>
      <p>
        The Platform is a <em>marketplace facilitator</em>, not the seller of third-party listed items. We are not a bank,
        money transmitter, or escrow agent except as described in our payment flows and
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>. Individual sales are contracts between buyer and
        seller; Stripe and your financial institutions have separate terms at checkout. Features roll out in phases — see
        <NuxtLink to="/sellers">For sellers</NuxtLink>,
        <NuxtLink to="/how-it-works">How it works</NuxtLink>, and
        <NuxtLink to="/contact">Contact</NuxtLink>.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for your credentials and all activity under your account. Information you provide must be accurate.
        <strong>Sellers</strong> must digitally sign all current policies (Terms, Marketplace Policies, Seller Agreement,
        Prohibited Items, Privacy) before listing, importing, or dropshipping — see
        <NuxtLink to="/marketplace-policy">Marketplace Policies §3</NuxtLink>.
        We may suspend, freeze, or terminate accounts under the Marketplace Policies (including for authenticity violations,
        refusal to honor valid refunds, or unpaid platform debt).
      </p>

      <h2>4. Listings and authenticity</h2>
      <p>
        Sellers must comply with authenticity requirements (COA or in-platform guarantee) for collectible categories,
        accurate descriptions, and <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>.
        The <NuxtLink to="/protection#authenticity-seal">Listing Authenticity Seal</NuxtLink> means the listing met
        platform proof and screening rules at publish time — it is <strong>not</strong> a guarantee by the Platform that
        a third-party expert has physically authenticated the item, and it does not eliminate the risk that an item may
        later be disputed or proven counterfeit.
      </p>
      <p>
        Automated integrity screening (including language and proof checks) is a risk-reduction tool only. The Platform may
        scan listings, suspend or remove them, revoke COAs, and ban sellers as described in the
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>. Remedies if an item is proven fake or
        misrepresented are limited to those policies and applicable law — not open-ended personal liability of the founder.
      </p>

      <h2>5. Payments, escrow, refunds, and disputes</h2>
      <p>
        Payments are processed by Stripe. Where escrow applies, funds are held until release conditions in the Marketplace
        Policies are met. Platform fees are described on
        <NuxtLink to="/pricing">Pricing</NuxtLink>; we do not charge a separate per-dispute mediation fee.
      </p>
      <p>
        Refund and dispute standards (including seller-at-fault refunds, forced refunds when sellers refuse, account freeze,
        escrow holds, and permanent bans) are defined in the
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink> and Seller Agreement — not in marketing copy alone.
        Any discretionary buyer protection program is limited and funded by the business entity, not personally by the founder.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        The service is provided &quot;as is.&quot; To the maximum extent permitted by law, the Platform and its operators are not
        liable for indirect or consequential damages. Some jurisdictions do not allow certain limitations; in those cases,
        liability is limited to the fullest extent allowed by law. Nothing in these Terms limits rights consumers may have
        under mandatory law.
      </p>

      <h2>7. Governing framework</h2>
      <p>
        Enforcement actions (listing suspension, integrity review, forced refund, account freeze for platform debt, chargeback
        allocation, and permanent ban) are implemented as described in the
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>. If you sell, you additionally agree to the
        <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>.
      </p>

      <h2>8. Contact</h2>
      <p>
        Terms questions:
        <NuxtLink to="/contact">Contact</NuxtLink> or
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'

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
