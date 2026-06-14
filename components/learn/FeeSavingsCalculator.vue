<template>
  <div class="fee-calc card-panel">
    <div class="calc-grid">
      <label class="calc-field">
        <span>Average sale price ($)</span>
        <input v-model.number="salePrice" type="number" min="1" step="1" class="input" />
      </label>
      <label class="calc-field">
        <span>Sales per month</span>
        <input v-model.number="salesPerMonth" type="number" min="1" step="1" class="input" />
      </label>
      <label class="calc-field">
        <span>Your Franks plan</span>
        <select v-model="plan" class="select">
          <option value="launch">Launch promo ({{ launchPct }}% — first 90 days)</option>
          <option value="starter">Starter ({{ starterPct }}%)</option>
          <option value="pro">Pro ({{ proPct }}%)</option>
          <option value="store">Store ({{ storePct }}%)</option>
        </select>
      </label>
      <label class="calc-field">
        <span>Compare to illustrative rate (%)</span>
        <input v-model.number="comparePct" type="number" min="0" max="30" step="0.5" class="input" />
        <span class="hint">Typical stacked marketplace ≈ {{ defaultCompare }}%</span>
      </label>
    </div>

    <div class="calc-results">
      <div class="result-box">
        <p class="result-label">Monthly GMV</p>
        <p class="result-value">${{ formatMoney(monthlyGmv) }}</p>
      </div>
      <div class="result-box">
        <p class="result-label">Fees on Franks Standard</p>
        <p class="result-value accent">${{ formatMoney(franksFees) }}</p>
        <p class="result-sub">{{ franksRate }}% effective</p>
      </div>
      <div class="result-box">
        <p class="result-label">Fees at {{ comparePct }}%</p>
        <p class="result-value">${{ formatMoney(compareFees) }}</p>
      </div>
      <div class="result-box highlight">
        <p class="result-label">Estimated monthly savings</p>
        <p class="result-value savings">${{ formatMoney(savings) }}</p>
        <p class="result-sub">Illustrative — excludes payment processing on any platform</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

const salePrice = ref(250)
const salesPerMonth = ref(40)
const plan = ref('launch')
const comparePct = ref(13)
const defaultCompare = PRICING_PUBLIC.competitorTypical.replace(/%+/, '')
const launchPct = PRICING_PUBLIC.launchTxPromoPercent
const starterPct = PRICING_PUBLIC.starterTxPercent
const proPct = PRICING_PUBLIC.proTxPercent
const storePct = PRICING_PUBLIC.storeTxPercent

const franksRate = computed(() => {
  const map = { launch: launchPct, starter: starterPct, pro: proPct, store: storePct }
  return map[plan.value] ?? proPct
})

const monthlyGmv = computed(() => Math.max(0, salePrice.value) * Math.max(0, salesPerMonth.value))
const franksFees = computed(() => monthlyGmv.value * (franksRate.value / 100))
const compareFees = computed(() => monthlyGmv.value * (Math.max(0, comparePct.value) / 100))
const savings = computed(() => Math.max(0, compareFees.value - franksFees.value))

function formatMoney (n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.fee-calc { padding: 1.25rem; }
.calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.calc-field span { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: #374151; }
.hint { font-size: 0.78rem; color: #6b7280; font-weight: 600; margin-top: 4px; display: block; }
.calc-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.result-box {
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.result-box.highlight {
  background: rgba(201, 168, 76, 0.12);
  border-color: rgba(201, 168, 76, 0.45);
}
.result-label { font-size: 0.8rem; font-weight: 700; color: #6b7280; margin: 0 0 4px; }
.result-value { font-size: 1.35rem; font-weight: 800; color: #111827; margin: 0; }
.result-value.accent { color: #047857; }
.result-value.savings { color: #b45309; }
.result-sub { font-size: 0.75rem; color: #6b7280; margin: 6px 0 0; font-weight: 600; }
</style>
