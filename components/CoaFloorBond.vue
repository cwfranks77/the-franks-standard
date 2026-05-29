<template>
  <div v-if="bond" class="floor-bond" :class="bond.paired ? 'floor-bond--ok' : 'floor-bond--warn'">
    <p class="floor-bond-title">
      {{ bond.paired ? '✓ COA paired to this listing office' : '⚠ COA pairing problem' }}
    </p>
    <p v-if="floorSlot" class="floor-slot">
      Floor office #<strong>{{ floorSlot }}</strong>
      <span v-if="listingIdShort" class="text-muted"> · Listing slot {{ listingIdShort }}</span>
    </p>
    <p class="floor-bond-msg">{{ bond.message }}</p>
    <NuxtLink v-if="verifyPath" :to="verifyPath" class="verify-link">Verify COA in registry →</NuxtLink>
    <p v-if="!bond.paired && bond.reason === 'item_changed'" class="text-muted small">
      A seller cannot photograph one coin and sell another while keeping the same COA. Our system flags when listing photos or description drift from what was certified.
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  bond: { type: Object, default: null },
  floorSlot: { type: String, default: '' },
  listingId: { type: String, default: '' },
  serial: { type: String, default: '' },
})

const listingIdShort = computed(() => {
  const id = props.listingId || ''
  return id ? id.slice(0, 8) : ''
})

const verifyPath = computed(() => {
  const s = props.serial || props.floorSlot
  return s ? `/verify/coa/${s}` : ''
})
</script>

<style scoped>
.floor-bond {
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 2px solid #e5e7eb;
}
.floor-bond--ok { background: #ecfdf5; border-color: #047857; }
.floor-bond--warn { background: #fef2f2; border-color: #b91c1c; }
.floor-bond-title { font-weight: 800; margin: 0 0 6px; font-size: 0.92rem; }
.floor-slot { margin: 0 0 6px; font-size: 0.88rem; }
.floor-bond-msg { margin: 0; font-size: 0.85rem; font-weight: 600; line-height: 1.45; }
.verify-link { display: inline-block; margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #146eb4; }
</style>
