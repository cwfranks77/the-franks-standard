<script setup>
useSeoMeta({ title: 'Marketplace Policies — The Franks Standard' })
</script>

<template>
  <LegalDocShell>
    <h1>Marketplace Policies</h1>
    <p class="updated">Last updated: June 2026</p>

    <h2>Escrow &amp; refunds</h2>
    <p>
      Buyers pay through Platform escrow. Seller-at-fault refunds may be issued by operators via forced Stripe refund.
      Sellers who refuse cooperation may be frozen until platform debt is repaid.
    </p>

    <h2>COA for collectibles &amp; antiques</h2>
    <p>
      Collectible categories require item thumbnail photos, a brief description, a server-issued Franks COA serial
      (<code>FS-YYYY-NNNNNN</code>), and seller e-signature before print unlocks. COAs are
      <strong>never transferable</strong> to another item — permanently bound to one listing and one item snapshot.
      Our backend verifies documents, watermarks official copies, and blocks duplicate or fraudulent COA use.
    </p>

    <h2>Counterfeit enforcement</h2>
    <p>
      Confirmed counterfeit collectibles or antiques: listing removed, COA revoked if applicable,
      <strong>automatic seller account freeze</strong> pending review, possible permanent ban.
    </p>

    <h2>Tax</h2>
    <p>
      Sales tax is calculated from the buyer’s <strong>shipping destination zip</strong> (Louisiana Marketplace Facilitator).
      Operators reserve 25% of seller proceeds for business income tax planning.
    </p>

    <h2>Platform role</h2>
    <p>
      The Franks Standard guarantees authenticity processes and policy enforcement tools — not individual items.
      See <NuxtLink to="/terms">Terms</NuxtLink> for limitation of liability.
    </p>
  </LegalDocShell>
</template>
