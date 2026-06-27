<script setup>
const shippingZip = ref('')
const saleAmount = ref('')

const LA_STATE_RATE = 0.0445
const LA_LOCAL_ESTIMATE = 0.05

const estimatedTax = computed(() => {
  const zip = shippingZip.value.replace(/\D/g, '').slice(0, 5)
  const amount = parseFloat(saleAmount.value)
  if (zip.length !== 5 || !Number.isFinite(amount) || amount < 0) return null
  const combined = LA_STATE_RATE + LA_LOCAL_ESTIMATE
  return (amount * combined).toFixed(2)
})

const isLouisianaZip = computed(() => {
  const zip = parseInt(shippingZip.value.replace(/\D/g, '').slice(0, 5), 10)
  return zip >= 70001 && zip <= 71497
})
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-textMuted">
      Sales tax is calculated from the buyer&apos;s <strong>shipping</strong> zip code — not billing — per Louisiana Marketplace Facilitator rules (Act 22).
    </p>
    <div class="grid sm:grid-cols-2 gap-3 max-w-lg">
      <label class="block">
        <span class="text-xs text-textMuted mb-1 block">Shipping zip</span>
        <input
          v-model="shippingZip"
          type="text"
          maxlength="10"
          placeholder="70112"
          class="w-full bg-bg border border-border rounded px-3 py-2"
        />
      </label>
      <label class="block">
        <span class="text-xs text-textMuted mb-1 block">Item subtotal ($)</span>
        <input
          v-model="saleAmount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          class="w-full bg-bg border border-border rounded px-3 py-2"
        />
      </label>
    </div>
    <p v-if="shippingZip.length >= 5 && !isLouisianaZip" class="text-xs text-danger">
      Zip outside Louisiana range — use your tax table for other states.
    </p>
    <div v-if="estimatedTax !== null && isLouisianaZip" class="bg-bg border border-border rounded-lg p-3 max-w-xs">
      <p class="text-xs text-textMuted">Estimated LA sales tax (~9.45%)</p>
      <p class="text-xl font-semibold text-primary">${{ estimatedTax }}</p>
    </div>
  </div>
</template>
