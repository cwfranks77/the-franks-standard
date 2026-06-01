<template>
  <div class="niche-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Niche collections &amp; limited drops</h1>
      <p class="lead text-muted">
        Campaign copy for curated niches vs eBay — exclusivity + COA + Stripe escrow. Public hub:
        <NuxtLink to="/collections">/collections</NuxtLink>
      </p>

      <section class="card panel">
        <h2>Niche collections</h2>
        <div v-for="n in NICHE_COLLECTIONS" :key="n.slug" class="campaign-block">
          <div class="campaign-head">
            <strong>{{ n.icon }} {{ n.name }}</strong>
            <NuxtLink :to="`/collections/${n.slug}`" class="btn btn-outline btn-sm">Open</NuxtLink>
            <button type="button" class="btn btn-outline btn-sm" @click="copyNiche(n)">{{ copyState[n.slug] ? 'Copied' : 'Copy promo' }}</button>
          </div>
          <p class="text-muted small">{{ n.tagline }}</p>
          <pre class="kit-pre">{{ promoCampaignCopy(n) }}</pre>
        </div>
      </section>

      <section class="card panel">
        <h2>Limited drops (floor campaigns)</h2>
        <ul class="ops-list">
          <li v-for="d in LIMITED_DROPS" :key="d.slug">
            <NuxtLink :to="`/collections/${d.slug}`">{{ d.label }}</NuxtLink>
            — {{ d.subtitle }}
          </li>
        </ul>
        <p class="text-muted small mt-1">
          Browse filter: <code>/browse?limited=1</code> ·
          Collection filter: <code>/browse?collection=floor-drop-psa-week</code>
        </p>
      </section>

      <section class="card panel">
        <h2>Seller tagging</h2>
        <ol class="ops-list">
          <li>Sell flow → “Collections &amp; limited edition” checkbox + collection slug</li>
          <li>Run <code>020_limited_collections.sql</code> in Supabase for DB badges</li>
          <li>Without migration, title keywords like “limited edition” still show Limited badge</li>
        </ol>
      </section>

      <section class="card panel">
        <h2>UTM examples (postcards / email)</h2>
        <pre class="kit-pre">{{ utmExamples }}</pre>
      </section>

      <p class="text-muted small">
        <NuxtLink to="/ops/marketing">← Marketing ops</NuxtLink> ·
        <code>docs/NICHE-LIMITED-COLLECTIONS.md</code>
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  NICHE_COLLECTIONS,
  LIMITED_DROPS,
  promoCampaignCopy,
  SITE_URL,
} from '~/utils/nicheCollections.js'

definePageMeta({ middleware: 'ops-auth' })

const copyState = reactive({})

const utmExamples = [
  `${SITE_URL}/collections/graded-sports-cards?utm_source=postcard&utm_medium=mail&utm_campaign=psa-week`,
  `${SITE_URL}/browse?limited=1&utm_source=instagram&utm_medium=social&utm_campaign=floor-drop`,
  `${SITE_URL}/go/postcard?ref=batch-12&promo=FOUNDERS10`,
].join('\n')

async function copyNiche (n) {
  try {
    await navigator.clipboard.writeText(promoCampaignCopy(n))
    copyState[n.slug] = true
    setTimeout(() => { copyState[n.slug] = false }, 2500)
  } catch {}
}

useSeoMeta({ title: 'Ops — Niche collections' })
</script>

<style scoped>
.niche-ops-page { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #92400e; }
.lead { max-width: 42rem; line-height: 1.6; }
.panel { padding: 20px; margin-bottom: 20px; }
.campaign-block { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
.campaign-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
.kit-pre {
  padding: 12px; background: #0f172a; color: #e2e8f0; border-radius: 8px;
  font-size: 0.82rem; white-space: pre-wrap; margin-top: 8px;
}
.ops-list { line-height: 1.7; font-weight: 600; }
</style>
