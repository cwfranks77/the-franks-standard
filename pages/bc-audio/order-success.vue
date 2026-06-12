<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'

definePageMeta({ layout: 'bc-audio' })

const route = useRoute()
const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))

const orderId = computed(() => String(route.query.order || '').trim())
const sessionId = computed(() => String(route.query.session_id || '').trim())

useSeoMeta({
  title: `Payment received · ${BC_BRAND.short}`,
  description: `${BC_BRAND.full} — your Stripe payment was received. Fulfillment sync is active.`,
  robots: 'noindex',
})
</script>

<template>
  <div class="bc-os">
    <div class="bc-os__inner">
      <p class="bc-os__eyebrow">{{ BC_BRAND.short }} checkout</p>
      <h1>Payment received</h1>
      <p class="bc-os__lead">
        Thank you. Stripe processed your payment securely. Your order is queued for distributor fulfillment.
      </p>

      <div v-if="orderId" class="bc-os__ref">
        <span class="bc-os__ref-label">Order reference</span>
        <strong class="bc-os__ref-value">#{{ orderId }}</strong>
      </div>
      <p v-if="sessionId" class="bc-os__muted">Stripe session: {{ sessionId }}</p>

      <section class="bc-os__card">
        <h2>What happens next</h2>
        <ul class="bc-os__list">
          <li>A receipt was sent to the email you entered at checkout.</li>
          <li>Our distributor node is notified to pick and ship your unit.</li>
          <li>Questions? Call <a :href="`tel:${support.phoneTel}`">{{ support.phoneDisplay }}</a> or email
            <a :href="`mailto:${support.email}`">{{ support.email }}</a>.
          </li>
        </ul>
      </section>

      <div class="bc-os__cta">
        <NuxtLink to="/" class="bc-os__btn bc-os__btn--primary">Back to storefront</NuxtLink>
        <NuxtLink to="/bc-audio/catalog" class="bc-os__btn">Browse catalog</NuxtLink>
        <NuxtLink to="/bc-audio/open-door" class="bc-os__btn bc-os__btn--ghost">Open Door support</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc-os {
  padding: 2.85rem 1.25rem 4rem;
  background: #0a0a0c;
  color: #f5f5f7;
  min-height: calc(100vh - 64px);
}
.bc-os__inner { max-width: 640px; margin: 0 auto; }
.bc-os__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #d32f2f;
  font-weight: 800;
  margin: 0 0 10px;
}
.bc-os h1 {
  font-size: clamp(1.65rem, 4vw, 2.1rem);
  font-weight: 900;
  margin: 0 0 12px;
}
.bc-os__lead {
  margin: 0 0 1.25rem;
  color: #c4c8d0;
  line-height: 1.55;
  font-size: 0.95rem;
}
.bc-os__ref {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: #16161c;
}
.bc-os__ref-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7a8190;
}
.bc-os__ref-value { font-size: 1.15rem; color: #ff5252; }
.bc-os__muted {
  margin: 0 0 1.25rem;
  font-size: 0.75rem;
  color: #5c6370;
  word-break: break-all;
}
.bc-os__card {
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.5rem;
}
.bc-os__card h2 {
  font-size: 0.95rem;
  margin: 0 0 10px;
  color: #f5f5f7;
}
.bc-os__list {
  margin: 0;
  padding-left: 1.15rem;
  color: #9ca3af;
  font-size: 0.88rem;
  line-height: 1.55;
}
.bc-os__list a { color: #ff5252; }
.bc-os__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.bc-os__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.82rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #f5f5f7;
  background: transparent;
}
.bc-os__btn--primary {
  background: linear-gradient(180deg, #d32f2f 0%, #b71c1c 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 18px rgba(211, 47, 47, 0.35);
}
.bc-os__btn--ghost { color: #7a8190; border-style: dashed; }
.bc-os__btn:hover { filter: brightness(1.08); }
</style>
