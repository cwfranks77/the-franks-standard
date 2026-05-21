<template>
  <div class="status-page">
    <div class="container">
      <header class="status-head">
        <p class="eyebrow">Owner toolkit</p>
        <h1>Transaction readiness</h1>
        <p class="text-muted lede">
          Honest checklist for what works today vs what still needs engineering before the site runs like a full marketplace.
        </p>
        <div class="status-actions">
          <NuxtLink to="/ops/panel" class="btn btn-outline btn-sm">&larr; Operator console</NuxtLink>
          <NuxtLink to="/ops/test-checkout" class="btn btn-outline btn-sm">Test checkout &amp; tax</NuxtLink>
          <NuxtLink to="/pay" class="btn btn-outline btn-sm">Pay &amp; fees</NuxtLink>
          <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Stripe Dashboard</a>
        </div>
      </header>

      <TransactionReadinessBanner :show-details="true" />

      <section class="status-grid">
        <div class="status-card">
          <h2>Live marketplace stats</h2>
          <p v-if="statsError" class="text-muted small">{{ statsError }}</p>
          <ul class="stat-list">
            <li><strong>{{ published }}</strong> published listings</li>
            <li><strong>{{ drafts }}</strong> drafts</li>
            <li><strong>{{ profiles }}</strong> registered profiles</li>
          </ul>
          <button type="button" class="btn btn-primary btn-sm" :disabled="statsLoading" @click="refresh">
            {{ statsLoading ? 'Refreshing…' : 'Refresh stats' }}
          </button>
        </div>

        <div class="status-card">
          <h2>What works (after deploy)</h2>
          <ul class="bullet-list">
            <li><strong>Buy now</strong> — Stripe Checkout for listing amount + billing-address tax when applicable</li>
            <li><strong>Orders</strong> — stored in Supabase; visible on dashboard</li>
            <li><strong>Escrow</strong> — paid → held → buyer confirms on order page</li>
            <li><strong>Connect</strong> — sellers set up payouts from dashboard</li>
            <li>Platform fees still use Payment Links on <NuxtLink to="/pay">Pay &amp; fees</NuxtLink></li>
          </ul>
          <p class="small text-muted">Setup: <code>docs/STRIPE-FULL-PAYMENTS.md</code></p>
        </div>

        <div class="status-card">
          <h2>Deploy checklist</h2>
          <ul class="bullet-list warn">
            <li>Run <code>003_stripe_payments.sql</code> in Supabase SQL</li>
            <li>Set Edge secrets: <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>, <code>SITE_URL</code></li>
            <li>Deploy four Edge Functions (webhook with <code>--no-verify-jwt</code>)</li>
            <li>Stripe Dashboard → Webhooks → <code>checkout.session.completed</code> + <code>account.updated</code></li>
            <li>Enable Stripe Connect in Dashboard → Settings</li>
          </ul>
        </div>

        <div class="status-card wide">
          <h2>Buyer flow (live checkout)</h2>
          <ol class="numbered">
            <li>Sign in → open listing → <strong>Buy now</strong></li>
            <li>Pay on Stripe Checkout (listing amount, tax from billing address, platform fee split if seller uses Connect)</li>
            <li>Seller ships → buyer opens <strong>Order</strong> → confirms receipt</li>
            <li>Escrow releases to seller (Connect transfer or manual transfer)</li>
          </ol>
        </div>

        <div class="status-card wide">
          <h2>Payment link tester</h2>
          <p class="small text-muted">Open each link in a new tab to confirm Stripe checkout loads (use test mode in Stripe if enabled).</p>
          <ul class="link-test-list">
            <li v-for="link in paymentLinks" :key="link.key">
              <span class="link-badge">{{ link.badge }}</span>
              <span>{{ link.title }}</span>
              <a
                v-if="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline btn-sm"
              >Open</a>
              <span v-else class="text-muted small">Not configured ({{ link.envName }})</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })

useSeoMeta({
  title: 'Transaction readiness - Owner',
  robots: 'noindex, nofollow',
})

const { links: paymentLinks } = usePaymentLinks()
const { published, drafts, profiles, loading: statsLoading, error: statsError, refresh } = useOpsStats()

onMounted(() => { refresh() })
</script>

<style scoped>
.status-page { padding: 48px 16px 80px; }
.status-head { margin-bottom: 28px; max-width: 720px; }
.eyebrow {
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 8px;
}
.status-head h1 { font-size: 1.65rem; margin: 0 0 10px; }
.lede { line-height: 1.6; }
.status-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 24px;
}
.status-card {
  padding: 20px 18px;
  border: 1px solid #d7dde6;
  border-radius: var(--radius-lg, 12px);
  background: #fff;
}
.status-card.wide { grid-column: 1 / -1; }
.status-card h2 { font-size: 1.05rem; margin: 0 0 12px; color: #111827; }
.stat-list { list-style: none; margin: 0 0 14px; padding: 0; }
.stat-list li { margin-bottom: 8px; font-size: 0.95rem; }
.bullet-list { margin: 0; padding-left: 1.1rem; font-size: 0.9rem; line-height: 1.55; }
.bullet-list li { margin-bottom: 6px; }
.bullet-list.warn li { color: #92400e; }
.numbered { margin: 0; padding-left: 1.2rem; font-size: 0.9rem; line-height: 1.6; }
.numbered li { margin-bottom: 8px; }
.link-test-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.link-test-list li {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 10px 12px; background: #f8f9fb; border-radius: 8px; border: 1px solid #e5e7eb;
}
.link-badge {
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
  padding: 2px 8px; border-radius: 999px; background: rgba(201, 168, 76, 0.15); color: var(--gold);
}
.small { font-size: 0.85rem; }
@media (max-width: 720px) {
  .status-grid { grid-template-columns: 1fr; }
}
</style>
