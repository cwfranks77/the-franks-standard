<script setup>
import { BC_CHECKOUT_TERMS } from '~/utils/bcShipping.js'

const agreed = defineModel({ type: Boolean, default: false })

defineProps({
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="bc-terms" :class="{ 'bc-terms--compact': compact }">
    <p v-if="!compact" class="bc-terms__title">{{ BC_CHECKOUT_TERMS.title }}</p>
    <p class="bc-terms__summary">{{ BC_CHECKOUT_TERMS.summary }}</p>
    <label class="bc-terms__label">
      <input v-model="agreed" type="checkbox" class="bc-terms__input">
      <span class="bc-terms__check">{{ BC_CHECKOUT_TERMS.checkboxLabel }}</span>
    </label>
  </div>
</template>

<style scoped>
.bc-terms {
  margin-top: 1rem;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(22, 22, 28, 0.9);
}

.bc-terms--compact {
  margin-top: 0;
  margin-bottom: 1rem;
}

.bc-terms__title {
  margin: 0 0 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #d32f2f;
}

.bc-terms__summary {
  margin: 0 0 10px;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #9ca3af;
}

.bc-terms__label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.bc-terms__input {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: #d32f2f;
  cursor: pointer;
}

.bc-terms__check {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #e8eaed;
  font-weight: 600;
}
</style>
