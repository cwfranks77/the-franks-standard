<template>
  <div class="container pay-page">
    <div class="pay-hero">
      <h1>Pay &amp; fees</h1>
      <p class="lede text-muted">
        All payments are handled by <strong>Stripe</strong> — the same payment processor used by Shopify, Amazon, and millions of businesses.
        Your funds are collected securely and deposited to The Franks Standard operating account. Seller payouts go through Stripe Connect.
      </p>
      <div class="pay-quick-links">
        <NuxtLink to="/pricing" class="btn btn-outline btn-sm">See pricing plans</NuxtLink>
        <NuxtLink to="/launch-offer" class="btn btn-outline btn-sm">Launch offer (new sellers)</NuxtLink>
      </div>
    </div>

    <div v-if="isOwner" class="pay-owner-banner">
      <span class="pay-owner-badge">Owner mode</span>
      <div>
        <p><strong>All fees are waived for you.</strong> As the site owner, you have free full access to sell on The Franks Standard.</p>
        <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">These payment links are for regular sellers and buyers. Your listings are fee-free.</p>
      </div>
    </div>

    <div class="grid grid-2 pay-grid">
      <article
        v-for="item in items"
        :key="item.key"
        class="card pay-card hover-lift"
      >
        <div class="card-body">
          <span class="badge badge-gold">{{ item.badge }}</span>
          <h2>{{ item.title }}</h2>
          <p class="text-muted">{{ item.body }}</p>
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-sm mt-2"
          >Pay in Stripe &rarr;</a>
          <p v-else class="op-warn-inline mt-2" role="status">
            Add <code>{{ item.envName }}</code> in <code>.env</code> to enable this link after you create it in Stripe.
          </p>
        </div>
      </article>
    </div>

    <p class="text-muted fine text-center">
      This site does not store your card number. Orders and escrow are described in <NuxtLink to="/how-it-works">How it works</NuxtLink>.
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Pay and fees - The Franks Standard',
  description: 'Pay selling fees, buyer protection, and order holds via Stripe.',
})

const { isOwner } = useOwnerMode()
const config = useRuntimeConfig()
const c = config.public
const fallbackPaymentLinks = {
  payListingFeeUrl: 'https://buy.stripe.com/5kQfZa78O7EL8bAcqwbII09',
  payProSellerUrl: 'https://buy.stripe.com/5kQfZaeBgaQX0J8duAbII0a',
  payOrderDepositUrl: 'https://buy.stripe.com/cNiaEQeBg1gnezY4Y4bII0b',
  payDisputeFeeUrl: 'https://buy.stripe.com/bJe8wIal09MT8bAfCIbII0c',
}

const items = computed(() => [
  {
    key: 'list',
    badge: 'Sellers',
    title: 'Listing or renewal fee',
    body: 'Charged per listing or subscription window you set in your Stripe product.',
    url: c.payListingFeeUrl || fallbackPaymentLinks.payListingFeeUrl,
    envName: 'NUXT_PUBLIC_PAY_LISTING_FEE_URL',
  },
  {
    key: 'pro',
    badge: 'Sellers',
    title: 'Pro seller (optional)',
    body: 'Monthly or annual upgrade for featured slots - wire your own Stripe product.',
    url: c.payProSellerUrl || fallbackPaymentLinks.payProSellerUrl,
    envName: 'NUXT_PUBLIC_PAY_PRO_SELLER_URL',
  },
  {
    key: 'order',
    badge: 'Buyers',
    title: 'Order payment / deposit',
    body: 'Point this link at your checkout for item payment or a deposit. Final release follows your escrow rules.',
    url: c.payOrderDepositUrl || fallbackPaymentLinks.payOrderDepositUrl,
    envName: 'NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL',
  },
  {
    key: 'dispute',
    badge: 'Either party',
    title: 'Dispute or mediation fee',
    body: 'If you add a small fee for escalated review, use a separate Payment Link here.',
    url: c.payDisputeFeeUrl || fallbackPaymentLinks.payDisputeFeeUrl,
    envName: 'NUXT_PUBLIC_PAY_DISPUTE_FEE_URL',
  },
])
</script>

<style scoped>
.pay-page { padding: 2.5rem 0 3.5rem; }
.pay-hero { max-width: 700px; margin-bottom: 2rem; }
.pay-hero h1 { font-size: 1.85rem; margin-bottom: 0.5rem; }
.pay-quick-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.lede { font-size: 1.02rem; line-height: 1.7; }
.lede strong { color: var(--stone-200); }
.lede code { color: var(--gold-light); font-size: 0.85em; }
.pay-card h2 { font-size: 1.1rem; margin: 0.5rem 0; color: var(--stone-100); }
.pay-card .text-muted { font-size: 0.92rem; }
.op-warn-inline {
  font-size: 0.82rem;
  background: rgba(255, 61, 92, 0.1);
  border: 1px solid rgba(255, 61, 92, 0.2);
  border-radius: 8px;
  padding: 8px 10px;
  color: var(--stone-200);
}
.fine { font-size: 0.85rem; margin-top: 2rem; }
.pay-owner-banner {
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px;
  margin-bottom: 1.5rem; padding: 18px 20px;
  border-radius: var(--radius-lg, 12px);
  border: 2px solid rgba(0, 245, 160, 0.35);
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.08), rgba(201, 168, 76, 0.06));
  color: var(--stone-200); line-height: 1.6;
}
.pay-owner-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(201, 168, 76, 0.18); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.4);
  white-space: nowrap;
}
</style>
