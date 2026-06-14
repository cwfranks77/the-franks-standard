<template>
  <p class="coa-seller-disclosure" :class="{ 'coa-seller-disclosure--full': variant === 'full' }">
    {{ text }}
  </p>
</template>

<script setup>
import { COA_FINE_PRINT_FULL, COA_FINE_PRINT_SHORT } from '~/utils/authenticitySeal.js'

const props = defineProps({
  variant: { type: String, default: 'short' }, // 'short' | 'full'
})

const text = computed(() => (props.variant === 'full' ? COA_FINE_PRINT_FULL : COA_FINE_PRINT_SHORT))
</script>

<style scoped>
.coa-seller-disclosure {
  margin: 10px 0 0;
  font-size: 0.68rem;
  line-height: 1.45;
  color: #6b7280;
  font-weight: 600;
}
.coa-seller-disclosure--full {
  font-size: 0.72rem;
  line-height: 1.55;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}
</style>
