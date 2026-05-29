<template>
  <div class="listing-calc card-panel">
    <label class="calc-field">
      <span>New listings you plan to publish this month</span>
      <input v-model.number="listings" type="number" min="0" step="1" class="input" />
    </label>
    <p class="hint">First <strong>{{ freeCount }}</strong> listings are free. Additional listings are billed per Stripe listing fee (site default ≈ ${{ listingFee }} each unless owner mode).</p>
    <div class="calc-results">
      <p class="line">Free listings used: <strong>{{ freeUsed }}</strong></p>
      <p class="line">Paid listings: <strong>{{ paidCount }}</strong></p>
      <p class="line total">Estimated listing fees: <strong>${{ formatMoney(paidFees) }}</strong></p>
    </div>
    <p class="disclaimer text-muted">Sale transaction fees are separate — use the <NuxtLink to="/learn/tools/fee-calculator">fee savings calculator</NuxtLink>.</p>
  </div>
</template>

<script setup>
const freeCount = 10
const listingFee = 2.99
const listings = ref(25)

const freeUsed = computed(() => Math.min(freeCount, Math.max(0, listings.value)))
const paidCount = computed(() => Math.max(0, listings.value - freeCount))
const paidFees = computed(() => paidCount.value * listingFee)

function formatMoney (n) {
  return Number(n || 0).toFixed(2)
}
</script>

<style scoped>
.listing-calc { padding: 1.25rem; }
.calc-field span { display: block; font-weight: 700; margin-bottom: 8px; font-size: 0.9rem; }
.hint { font-size: 0.88rem; line-height: 1.5; margin: 12px 0 20px; }
.calc-results { padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e5e7eb; }
.line { margin: 0 0 8px; font-weight: 600; }
.total { font-size: 1.1rem; margin-top: 12px; color: #111827; }
.disclaimer { font-size: 0.85rem; margin-top: 16px; }
</style>
