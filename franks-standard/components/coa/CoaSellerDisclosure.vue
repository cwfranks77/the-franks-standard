<script setup>
import { COA_FINE_PRINT_SHORT } from '~/utils/franksCoaModel.js'

defineProps({
  variant: { type: String, default: 'short' },
})
</script>

<template>
  <p class="coa-disclosure" :class="{ 'coa-disclosure--full': variant === 'full' }">
    {{ COA_FINE_PRINT_SHORT }}
  </p>
</template>

<style scoped>
.coa-disclosure {
  font-size: 0.75rem;
  line-height: 1.5;
  color: #9ca3af;
  margin-top: 8px;
}
.coa-disclosure--full {
  padding: 10px;
  border-left: 3px solid #c9a84c;
  background: rgba(0, 0, 0, 0.15);
}
</style>
