<template>
  <section class="checkout-ack card" role="region" aria-labelledby="checkout-ack-title">
    <h2 id="checkout-ack-title">Before you pay</h2>
    <p class="text-muted small">Checkout acknowledgment — The Franks Standard LLC marketplace facilitator</p>
    <ul class="ack-bullets">
      <li v-for="(line, idx) in CHECKOUT_ACK_BULLETS" :key="idx">{{ line }}</li>
    </ul>
    <label class="ack-check">
      <input :checked="agreed" type="checkbox" @change="emit('update:agreed', ($event.target).checked)" />
      <span>{{ CHECKOUT_ACK_CHECKBOX }}</span>
    </label>
    <label v-if="hasSerializedCoa" class="ack-check">
      <input :checked="serializedAgreed" type="checkbox" @change="emit('update:serializedAgreed', ($event.target).checked)" />
      <span>{{ CHECKOUT_ACK_SERIALIZED_COA_CHECKBOX }}</span>
    </label>
  </section>
</template>

<script setup>
import {
  CHECKOUT_ACK_BULLETS,
  CHECKOUT_ACK_CHECKBOX,
  CHECKOUT_ACK_SERIALIZED_COA_CHECKBOX,
} from '~/utils/buyerCheckoutAcknowledgment.js'

defineProps({
  agreed: { type: Boolean, default: false },
  serializedAgreed: { type: Boolean, default: false },
  hasSerializedCoa: { type: Boolean, default: false },
})

const emit = defineEmits(['update:agreed', 'update:serializedAgreed'])
</script>

<style scoped>
.checkout-ack {
  padding: 16px 14px;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}
.checkout-ack h2 { font-size: 0.95rem; margin: 0 0 6px; }
.ack-bullets {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #374151;
  margin: 0 0 12px;
  padding-left: 1.1rem;
}
.ack-check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  cursor: pointer;
}
.ack-check input { margin-top: 3px; }
</style>
