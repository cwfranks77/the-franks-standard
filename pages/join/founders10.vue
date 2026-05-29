<template>
  <div class="founders-page">
    <div class="founders-inner">
      <p class="founders-tag">Limited offer</p>
      <h1>Founding seller program</h1>
      <p class="founders-lead">
        The first <strong>10 people</strong> who create a seller account get
        <strong>3 months of Pro free</strong> — no subscription fee during that period.
      </p>

      <div v-if="!loading" class="founders-card">
        <p class="spots-label">Spots remaining</p>
        <p class="spots-count" :class="{ 'sold-out': soldOut }">
          {{ soldOut ? '0' : remaining }}
          <span class="spots-denom">/ 10</span>
        </p>
        <p v-if="soldOut" class="promo-line sold-out-msg">
          All founding spots are claimed. You can still sell on the marketplace with a free Starter account.
        </p>
        <p v-else class="promo-line">
          Use promo code <code>{{ FOUNDING_PROMO_CODE }}</code> when you register or at checkout.
        </p>
      </div>
      <div v-else class="founders-skeleton" aria-hidden="true" />

      <div class="founders-actions">
        <NuxtLink
          v-if="!soldOut"
          :to="registerHref"
          class="btn btn-primary btn-lg"
        >
          Claim your spot — sign up to sell
        </NuxtLink>
        <NuxtLink
          v-else
          to="/auth/register?account=sell"
          class="btn btn-outline btn-lg"
        >
          Create seller account
        </NuxtLink>
        <NuxtLink to="/sell" class="btn btn-outline btn-lg">
          Learn about selling
        </NuxtLink>
      </div>

      <ul class="founders-footnotes">
        <li>One redemption per person — duplicate accounts won’t get extra free months.</li>
        <li>Link and code stop working after 10 successful redemptions.</li>
        <li>Pro features unlock immediately after you verify email and redeem.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { FOUNDING_PROMO_CODE } from '~/utils/foundingPromo.js'
import { pickAttributionQueryKeys } from '~/utils/outreachTracking.js'

const route = useRoute()
const { fetchAvailability } = usePromoCode()
const availability = ref(null)
const loading = ref(true)

onMounted(async () => {
  availability.value = await fetchAvailability('founders10')
  loading.value = false
})

const remaining = computed(() => availability.value?.remaining ?? null)
const soldOut = computed(() => availability.value?.sold_out === true)
const registerHref = computed(() => {
  const params = new URLSearchParams({ account: 'sell', promo: FOUNDING_PROMO_CODE })
  const tracked = pickAttributionQueryKeys(route.query)
  for (const [k, v] of Object.entries(tracked)) params.set(k, v)
  if (!params.has('ref')) params.set('ref', 'founders10')
  return `/auth/register?${params.toString()}`
})

useSeoMeta({
  title: 'Founding sellers — 3 months Pro free | The Franks Standard',
  description: 'First 10 people to sign up and sell get 3 months of Pro free. Limited spots.',
})
</script>

<style scoped>
.founders-page {
  min-height: 60vh;
  padding: 48px 20px 80px;
  background: #f8f9fb;
}
.founders-inner {
  max-width: 32rem;
  margin: 0 auto;
}
.founders-tag {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
  margin: 0 0 8px;
}
.founders-page h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  color: #111827;
  margin: 0 0 16px;
  line-height: 1.2;
}
.founders-lead {
  font-size: 1.1rem;
  line-height: 1.65;
  color: #1f2937;
  font-weight: 600;
  margin: 0 0 28px;
}
.founders-lead strong {
  color: #111827;
  font-weight: 800;
}
.founders-card {
  background: #fff;
  border: 1px solid #d7dde6;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(17, 24, 39, 0.08);
  margin-bottom: 28px;
}
.spots-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #4b5563;
  margin: 0 0 4px;
}
.spots-count {
  font-size: 2.5rem;
  font-weight: 800;
  color: #047857;
  margin: 0;
  line-height: 1.1;
}
.spots-count.sold-out {
  color: #6b7280;
}
.spots-denom {
  font-size: 1.125rem;
  font-weight: 600;
  color: #4b5563;
}
.promo-line {
  margin: 14px 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.55;
}
.sold-out-msg {
  color: #92400e;
  font-weight: 700;
}
.founders-card code {
  background: #f3f4f6;
  color: #111827;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.95rem;
}
.founders-skeleton {
  height: 8rem;
  border-radius: 12px;
  background: #e5e7eb;
  margin-bottom: 28px;
  animation: founders-pulse 1.2s ease-in-out infinite;
}
@keyframes founders-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.founders-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}
@media (min-width: 480px) {
  .founders-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
.founders-footnotes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.founders-footnotes li {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.5;
  padding-left: 1.1rem;
  position: relative;
}
.founders-footnotes li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #111827;
  font-weight: 800;
}
</style>
