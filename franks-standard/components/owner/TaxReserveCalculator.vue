<script setup>
const saleAmount = ref('')
const reserveRate = 0.25

const reserveAmount = computed(() => {
  const n = parseFloat(saleAmount.value)
  if (!Number.isFinite(n) || n < 0) return null
  return (n * reserveRate).toFixed(2)
})

const netAfterReserve = computed(() => {
  const n = parseFloat(saleAmount.value)
  if (!Number.isFinite(n) || n < 0) return null
  return (n * (1 - reserveRate)).toFixed(2)
})
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-textMuted">
      Every checkout reserves <strong class="text-secondary">25%</strong> for Louisiana business income tax before payout.
    </p>
    <label class="block">
      <span class="text-xs text-textMuted mb-1 block">Sale amount ($)</span>
      <input
        v-model="saleAmount"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        class="w-full max-w-xs bg-bg border border-border rounded px-3 py-2"
      />
    </label>
    <div v-if="reserveAmount !== null" class="grid sm:grid-cols-2 gap-3">
      <div class="bg-bg border border-border rounded-lg p-3">
        <p class="text-xs text-textMuted">Tax reserve (25%)</p>
        <p class="text-xl font-semibold text-secondary">${{ reserveAmount }}</p>
      </div>
      <div class="bg-bg border border-border rounded-lg p-3">
        <p class="text-xs text-textMuted">After reserve</p>
        <p class="text-xl font-semibold">${{ netAfterReserve }}</p>
      </div>
    </div>
  </div>
</template>
