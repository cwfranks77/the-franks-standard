<template>
  <div class="partner-page">
    <div class="partner-inner">
      <p class="partner-tag">Store &amp; dropship partners</p>
      <h1>List your shop on The Franks Standard</h1>
      <p class="partner-lead">
        Built for <strong>eBay stores and brick-and-mortar shops</strong> — import inventory in minutes,
        keep <strong>4–5% sale fees</strong> (not ~13% stacked), seller proof on collectibles, and Stripe escrow — we facilitate; we do not guarantee item authenticity.
      </p>

      <ul class="partner-perks">
        <li>AI transfer from eBay Active Listings CSV or your catalog</li>
        <li>Launch offer: 10 free listings + <strong>{{ launchPct }}% fees for 90 days</strong></li>
        <li>Dropship tools, video inspect rooms, platform-only buyer contact</li>
        <li v-if="trackingRef" class="ref-line">Your invite code: <code>{{ trackingRef }}</code></li>
      </ul>

      <div class="partner-actions">
        <NuxtLink :to="importHref" class="btn btn-primary btn-lg">Import inventory — start here</NuxtLink>
        <NuxtLink :to="registerHrefFixed" class="btn btn-outline btn-lg">Create seller account</NuxtLink>
        <NuxtLink to="/sell" class="btn btn-outline btn-lg">How selling works</NuxtLink>
      </div>

      <p class="partner-foot text-muted">
        Questions? <a href="mailto:info@thefranksstandard.com?subject=Store%20partner%20invite">info@thefranksstandard.com</a>
        or <a href="tel:+18778370527">(877) 837-0527</a>.
        Mention code <strong>STORE90</strong> or your postcard ref when you apply.
      </p>
    </div>
  </div>
</template>

<script setup>
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'
import { buildTrackedPath } from '~/utils/outreachTracking.js'

const route = useRoute()
const { captureFromRoute, getAttribution } = useOutreachAttribution()

onMounted(() => captureFromRoute(route))

const launchPct = PRICING_PUBLIC.launchTxPromoPercent
const trackingRef = computed(() => {
  const a = getAttribution()
  return a?.ref || String(route.query.ref || '').trim() || ''
})

const importHref = computed(() => {
  const params = new URLSearchParams({
    ref: trackingRef.value || 'store90',
    promo: 'STORE90',
    utm_source: 'outreach',
    utm_medium: 'partner',
    utm_campaign: 'store90',
  })
  return `/sell/import?${params.toString()}`
})

const registerHrefFixed = computed(() => {
  const params = new URLSearchParams({
    account: 'sell',
    ref: trackingRef.value || 'store90',
    promo: 'STORE90',
  })
  if (route.query.utm_source) params.set('utm_source', String(route.query.utm_source))
  if (route.query.utm_medium) params.set('utm_medium', String(route.query.utm_medium))
  if (route.query.utm_campaign) params.set('utm_campaign', String(route.query.utm_campaign))
  return `/auth/register?${params.toString()}`
})

useSeoMeta({
  title: 'Store partner — import & sell | The Franks Standard',
  description: 'eBay and shop partners: AI inventory import, low fees, escrow checkout, seller proof on collectibles.',
})
</script>

<style scoped>
.partner-page {
  min-height: 60vh;
  padding: 48px 20px 80px;
  background: #f8f9fb;
}
.partner-inner { max-width: 36rem; margin: 0 auto; }
.partner-tag {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
  margin: 0 0 8px;
}
.partner-page h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.1rem);
  font-weight: 800;
  color: #111827;
  margin: 0 0 16px;
  line-height: 1.2;
}
.partner-lead {
  font-size: 1.05rem;
  line-height: 1.65;
  color: #1f2937;
  font-weight: 600;
  margin: 0 0 24px;
}
.partner-perks {
  margin: 0 0 28px;
  padding-left: 1.2rem;
  line-height: 1.6;
  font-weight: 600;
  color: #374151;
}
.ref-line { list-style: none; margin-left: -1.2rem; margin-top: 12px; }
.ref-line code {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 800;
}
.partner-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
@media (min-width: 480px) {
  .partner-actions { flex-direction: row; flex-wrap: wrap; }
}
.partner-foot { font-size: 0.9rem; line-height: 1.55; }
.partner-foot a { font-weight: 700; color: #146eb4; }
</style>
