<script setup>
import { BC_SHIPPING } from '~/utils/bcShipping.js'

defineProps({
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="bc-ship" :class="{ 'bc-ship--compact': compact }" role="note" aria-label="Fulfillment and shipping timeline">
    <template v-if="compact">
      <span class="bc-ship__icon" aria-hidden="true">📦</span>
      <span class="bc-ship__compact-text">{{ BC_SHIPPING.shortLine }}</span>
    </template>
    <template v-else>
      <p class="bc-ship__title">{{ BC_SHIPPING.headline }}</p>
      <p class="bc-ship__summary">{{ BC_SHIPPING.summary }}</p>
      <p class="bc-ship__reason">{{ BC_SHIPPING.clearanceReason }}</p>
      <dl class="bc-ship__grid">
        <div class="bc-ship__row">
          <dt>{{ BC_SHIPPING.paymentLabel }}</dt>
          <dd>{{ BC_SHIPPING.paymentWindow }}</dd>
        </div>
        <div class="bc-ship__row">
          <dt>{{ BC_SHIPPING.fulfillmentLabel }}</dt>
          <dd>{{ BC_SHIPPING.fulfillmentNote }}</dd>
        </div>
      </dl>
      <p class="bc-ship__delivery">{{ BC_SHIPPING.deliveryEstimate }}</p>
      <p class="bc-ship__note">{{ BC_SHIPPING.checkoutNote }}</p>
    </template>
  </div>
</template>

<style scoped>
.bc-ship {
  margin-top: 1rem;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(211, 47, 47, 0.28);
  background: rgba(10, 10, 12, 0.65);
}

.bc-ship--compact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 10px;
  padding: 8px 10px;
  border-style: dashed;
  background: rgba(22, 22, 28, 0.85);
}

.bc-ship__icon {
  font-size: 0.95rem;
  line-height: 1;
  flex-shrink: 0;
}

.bc-ship__compact-text {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #c4c8d0;
  line-height: 1.35;
}

.bc-ship__title {
  margin: 0 0 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #d32f2f;
}

.bc-ship__summary {
  margin: 0 0 8px;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #e8eaed;
  font-weight: 600;
}

.bc-ship__reason {
  margin: 0 0 10px;
  font-size: 0.76rem;
  line-height: 1.45;
  color: #9ca3af;
}

.bc-ship__grid {
  margin: 0 0 10px;
  display: grid;
  gap: 8px;
}

.bc-ship__row {
  display: grid;
  grid-template-columns: minmax(0, 6.5rem) minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.bc-ship__row dt {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7a8190;
}

.bc-ship__row dd {
  margin: 0;
  font-size: 0.8rem;
  color: #c4c8d0;
  line-height: 1.4;
}

.bc-ship__delivery {
  margin: 0 0 10px;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #9ca3af;
  font-weight: 600;
}

.bc-ship__note {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: #7a8190;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 8px;
}
</style>
