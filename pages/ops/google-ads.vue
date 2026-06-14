<template>
  <div class="ads-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Google Ads &amp; paid growth</h1>
      <p class="lead text-muted">
        Step-by-step setup is in <code>docs/GOOGLE-ADS-SETUP.md</code>. Paste ad copy below into Google Ads — claims match what is
        <strong>live today</strong> (escrow yes, platform money-back guarantee not yet).
      </p>

      <section class="card notice">
        <h2>cwfranks77@gmail · Ambrena → Franks · info@</h2>
        <p class="text-muted">
          <strong>cwfranks77@gmail.com</strong> is a regular Gmail Google account (not Workspace) — keep it as the Ads login.
          <strong>info@thefranksstandard.com</strong> (Namecheap mail) cannot replace that login without buying Google Workspace.
          Wipe <strong>Ambrena</strong> inside Ads: pause old campaigns, rename account to The Franks Standard, new URLs only on thefranksstandard.com.
          Use <strong>info@</strong> on the site and in outreach; forward info@ → Gmail if you want one inbox.
        </p>
        <ol class="steps">
          <li>ads.google.com → Preferences → account name: The Franks Standard</li>
          <li>Pause/delete Ambrena campaigns and old store URLs</li>
          <li>New campaign → thefranksstandard.com/sell + FOUNDERS10</li>
          <li>Billing → The Franks Standard LLC</li>
        </ol>
      </section>

      <section class="card">
        <h2>Quick start checklist</h2>
        <ol class="steps">
          <li>Create campaign at <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">ads.google.com</a> → Search.</li>
          <li>Landing URLs: <code>/sell</code> (sellers), <code>/browse</code> (buyers), <code>/join/founders10</code> (promo).</li>
          <li>Add UTM: <code>?utm_source=google&amp;utm_medium=cpc&amp;utm_campaign=sellers</code></li>
          <li>Set conversion on registration + checkout (link GA4 or gtag when <code>NUXT_PUBLIC_GADS_ID</code> is set).</li>
          <li>Start budget $10–20/day; review search terms weekly.</li>
        </ol>
      </section>

      <section v-for="block in adBlocks" :key="block.title" class="card">
        <div class="card-head">
          <h2>{{ block.title }}</h2>
          <button type="button" class="btn btn-outline btn-sm" @click="copy(block)">{{ block.copied ? 'Copied' : 'Copy' }}</button>
        </div>
        <pre class="copy-box">{{ block.text }}</pre>
      </section>

      <section class="card alt">
        <h2>Also test (not Google)</h2>
        <ul>
          <li><strong>Meta</strong> — use copy from <NuxtLink to="/ops/ads">Social Media Ads</NuxtLink></li>
          <li><strong>Reddit</strong> — r/sportscards, r/coins (organic + $5/day promoted)</li>
          <li><strong>Pinterest</strong> — category pins → /browse</li>
        </ul>
      </section>

      <p class="back"><NuxtLink to="/ops/panel">← Operator console</NuxtLink></p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Google Ads — Ops', robots: 'noindex' })

const SITE = 'https://thefranksstandard.com'

const adBlocks = reactive([
  {
    title: 'Search ad — sellers (headlines + descriptions)',
    copied: false,
    text: `Headlines (mix 3):
The Franks Standard — Sell Collectibles
COA Required — Lower Seller Fees
3 Months Pro Free — FOUNDERS10
Import Listings From eBay CSV

Descriptions:
Proof-first marketplace: every listing needs a COA or signed guarantee. Escrow checkout until buyer confirms. Seller fees 4–5% by plan. List free — import from eBay. FOUNDERS10: 3 months Pro for early sellers.
${SITE}/sell?utm_source=google&utm_medium=cpc&utm_campaign=sellers`,
  },
  {
    title: 'Search ad — buyers',
    copied: false,
    text: `Headlines:
Buy Authentic Collectibles
COA On Every Listing
Escrow Until You Confirm Delivery

Description:
Shop collectibles with required proof on every listing. Escrow holds funds until you confirm the item. Video inspect from listings.
${SITE}/browse?utm_source=google&utm_medium=cpc&utm_campaign=buyers`,
  },
  {
    title: 'Negative keywords (shared list)',
    copied: false,
    text: `ebay login
amazon seller
free stuff
wholesale replica
fake
counterfeit
jobs
hiring
coupon code ebay`,
  },
])

async function copy (block) {
  try {
    await navigator.clipboard.writeText(block.text)
    block.copied = true
    setTimeout(() => { block.copied = false }, 2000)
  } catch {}
}
</script>

<style scoped>
.ads-ops-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.lead { max-width: 720px; margin-bottom: 24px; }
.card { padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
.card h2 { color: var(--gold); font-size: 1.05rem; margin-bottom: 12px; }
.card-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.copy-box { white-space: pre-wrap; font-size: 0.85rem; line-height: 1.5; padding: 12px; background: #f8fafc; border-radius: 8px; margin-top: 10px; }
.steps { line-height: 1.7; padding-left: 1.2rem; }
.alt ul { line-height: 1.8; padding-left: 1.2rem; }
.notice { border-color: rgba(10, 169, 255, 0.35); background: rgba(10, 169, 255, 0.06); }
.back { margin-top: 24px; }
</style>
