<template>
  <div class="page">
    <div class="container legal">
      <h1>Seller Agreement</h1>
      <p class="updated">
        Last updated: {{ POLICY_LAST_UPDATED }}. Selling on The Franks Standard means you accept these rules in addition to the
        <NuxtLink to="/terms">Terms of Service</NuxtLink> and
        <NuxtLink to="/marketplace-policy">Marketplace Policies &amp; Enforcement</NuxtLink>.
      </p>

      <h2>1. Mandatory digital policy acceptance</h2>
      <p>
        Before you list, import, dropship, or otherwise sell — whether as a store, occasional seller, or dropship operator —
        you must digitally sign and agree to the current versions of the
        <NuxtLink to="/terms">Terms of Service</NuxtLink>,
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>,
        this Seller Agreement,
        <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>, and
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        on the Sell page (or Import / Dropship setup). Your full legal name is stored as your electronic signature.
        Re-signing is required when the policy version changes.
      </p>

      <h2>2. Authenticity and COA</h2>
      <p>
        You may only list items you have the right to sell. Each listing must include a Certificate of Authenticity (COA) or the
        in-platform Seller Authenticity Guarantee (Franks Standard template — you back the item, not the Platform) as required.
        Misrepresentation, counterfeit items, or COA misuse may result in
        listing removal, COA revocation, buyer refunds, platform debt, account freeze, and permanent ban — as detailed in the
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>.
      </p>

      <h2>3. Prohibited items</h2>
      <p>
        You agree not to list items on our <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink> page or that violate law.
      </p>

      <h2>4. Fees, payouts, and escrow</h2>
      <p>
        Fees and payout timing appear in seller tools and at sale time. You are responsible for taxes in your jurisdiction. The
        Platform is a marketplace facilitator; Stripe and your bank have separate terms. Escrow holds funds until the buyer
        confirms receipt (or other release rules). Escrow release to you is blocked during account freeze or order-level escrow
        freeze under the Marketplace Policies.
      </p>

      <h2>5. Shipping, buyers, and disputes</h2>
      <p>
        You must ship as described, provide tracking when applicable, respond to buyers in good faith, and cooperate with
        authenticity and dispute reviews. If a buyer has a valid refund right and you refuse or fail to refund within a
        reasonable period after Platform notice, the Platform may refund the buyer directly, record the amount as debt you owe
        us, and freeze your account until paid.
      </p>

      <h2>6. Refunds, platform debt, and account freeze</h2>
      <p>
        When you are <strong>seller at fault</strong> (including counterfeit, not as described, upheld dispute, or failure to
        honor a valid refund) and the Platform advances a refund to the buyer, you owe the Platform that amount
        (&quot;platform debt&quot;). We may immediately <strong>freeze</strong> your account. While frozen you may not:
      </p>
      <ul class="policy-ul">
        <li>Buy, sell, bid, or check out on the Platform;</li>
        <li>Create, edit, update, or delete listings (including descriptions, photos, or prices);</li>
        <li>Mark orders shipped or issue Franks COAs;</li>
        <li>Receive escrow release or new payouts on held orders.</li>
      </ul>
      <p>
        Published listings may be archived. Repayment must be arranged with
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a> to the Platform business entity (not personal
        payment to individuals unless we expressly authorize). <strong>Repayment does not guarantee reinstatement</strong> — we
        may permanently ban your account after payment for serious violations.
      </p>

      <h2>7. Chargebacks</h2>
      <p>
        You accept liability for chargebacks on your sales where card network rules assign responsibility to you, including after
        escrow release. The Platform may offset future payouts, delay transfers, or use reserves described in the Marketplace
        Policies.
      </p>

      <h2>8. On-platform communication and checkout only</h2>
      <p>
        You may not solicit off-platform payment or communication to bypass escrow and fees. Violations may result in listing
        removal, freeze, or permanent ban.
      </p>

      <h2>9. Enforcement incorporation</h2>
      <p>
        All enforcement actions in the
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink> (integrity scan, suspend listing, confirm counterfeit,
        forced refund, account freeze, debt recovery, ban after repayment) are incorporated into this Agreement by reference.
      </p>

      <h2>10. Contact</h2>
      <p>
        <NuxtLink to="/contact">Contact</NuxtLink> or
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'

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
.policy-ul { line-height: 1.65; color: #374151; font-size: 0.95rem; }
.updated { color: var(--stone-500); font-size: 0.86rem; margin-bottom: 24px; }
</style>
