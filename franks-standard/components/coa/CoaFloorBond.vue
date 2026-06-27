<script setup>
import { FLOOR_SLOT_HELP } from '~/utils/coaListingBond.js'

defineProps({
  bond: { type: Object, required: true },
  floorSlot: { type: String, default: '' },
  listingId: { type: String, default: '' },
  serial: { type: String, default: '' },
})
</script>

<template>
  <div class="floor-bond" :class="bond.paired ? 'floor-bond--ok' : 'floor-bond--warn'" role="status">
    <p class="floor-bond__title">Floor office pairing</p>
    <p class="floor-bond__msg">{{ bond.message }}</p>
    <p v-if="floorSlot || serial" class="floor-bond__slot">
      Office <strong>{{ floorSlot || serial }}</strong>
      <NuxtLink v-if="serial" :to="`/verify/coa/${serial}`" class="floor-bond__verify">Verify serial</NuxtLink>
    </p>
    <p class="floor-bond__help text-muted small">{{ FLOOR_SLOT_HELP }}</p>
  </div>
</template>

<style scoped>
.floor-bond {
  padding: 12px 14px;
  border-radius: 8px;
  margin: 12px 0;
  font-size: 0.82rem;
}
.floor-bond--ok {
  border: 1px solid rgba(16, 185, 129, 0.45);
  background: rgba(16, 185, 129, 0.08);
}
.floor-bond--warn {
  border: 1px solid rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.08);
}
.floor-bond__title { font-weight: 700; margin: 0 0 4px; }
.floor-bond__msg { margin: 0 0 6px; line-height: 1.45; }
.floor-bond__slot { margin: 0 0 6px; }
.floor-bond__verify { margin-left: 8px; font-size: 0.78rem; }
.floor-bond__help { margin: 0; line-height: 1.45; }
</style>
