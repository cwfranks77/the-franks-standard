<script setup>
import { COA_NON_TRANSFERABLE_NOTICE } from '~/utils/coaIssuance'
import { buyerMayViewCoaDocument } from '~/utils/coaGatePolicy'

const props = defineProps({
  coaType: { type: String, default: 'none' },
  serial: { type: String, default: '' },
  listingId: { type: String, default: '' },
  thirdPartySerial: { type: String, default: '' },
  authStatus: { type: String, default: 'none' },
  buyerAccessEnabled: { type: Boolean, default: false },
  isSeller: { type: Boolean, default: false },
  isBuyer: { type: Boolean, default: false },
  imagePaths: { type: Array, default: () => [] },
  description: { type: String, default: '' },
  certPrimaryImagePath: { type: String, default: '' },
})

const listingGateInput = computed(() => ({
  image_paths: props.imagePaths,
  description: props.description,
  coa_serial_number: props.serial,
  coa_document_serial: props.serial,
  coa_auth_status: props.authStatus,
  coa_buyer_access_enabled: props.buyerAccessEnabled,
}))

const certGateInput = computed(() => ({
  primary_image_path: props.certPrimaryImagePath,
  auth_status: props.authStatus,
}))

const printGate = computed(() =>
  buyerMayViewCoaDocument(
    listingGateInput.value,
    certGateInput.value,
    props.isBuyer,
    props.isSeller,
  ),
)

const mayViewDocument = computed(() => printGate.value.ok && Boolean(props.serial))

const documentPath = computed(() => {
  if (!props.serial) return ''
  const q = props.listingId ? `?listing=${encodeURIComponent(props.listingId)}` : ''
  return `/coa/document/${props.serial}${q}`
})

const printPath = computed(() => {
  if (!documentPath.value) return ''
  const sep = documentPath.value.includes('?') ? '&' : '?'
  return `${documentPath.value}${sep}print=1`
})

const lockReason = computed(() => {
  if (!printGate.value.ok) return printGate.value.reason
  return ''
})
</script>

<template>
  <div v-if="coaType !== 'none'" class="coa-access-panel" :class="{ locked: !mayViewDocument }">
    <p class="coa-access-title">Certificate access</p>
    <p class="coa-access-notice">{{ COA_NON_TRANSFERABLE_NOTICE }}</p>

    <dl class="coa-access-meta">
      <template v-if="serial">
        <dt>Platform serial</dt>
        <dd><NuxtLink :to="`/verify/coa/${serial}`">{{ serial }}</NuxtLink></dd>
      </template>
      <template v-if="thirdPartySerial">
        <dt>Document serial (issuer)</dt>
        <dd>{{ thirdPartySerial }}</dd>
      </template>
      <dt>Item thumbnail</dt>
      <dd>{{ certPrimaryImagePath ? 'On file' : 'Missing — print locked' }}</dd>
      <dt>Backend status</dt>
      <dd>{{ authStatus === 'verified' ? 'Verified' : authStatus }}</dd>
    </dl>

    <p v-if="lockReason" class="coa-access-lock" role="status">{{ lockReason }}</p>

    <div class="coa-access-actions">
      <NuxtLink
        v-if="mayViewDocument"
        :to="documentPath"
        class="btn btn-outline btn-sm"
        target="_blank"
        rel="noopener"
      >
        View official COA
      </NuxtLink>
      <button
        v-else
        type="button"
        class="btn btn-outline btn-sm"
        disabled
      >
        View official COA (locked)
      </button>
      <NuxtLink
        v-if="mayViewDocument"
        :to="printPath"
        class="btn btn-outline btn-sm"
        target="_blank"
        rel="noopener"
      >
        Print registered copy
      </NuxtLink>
      <button
        v-else
        type="button"
        class="btn btn-outline btn-sm"
        disabled
      >
        Print locked
      </button>
    </div>

    <p v-if="mayViewDocument" class="coa-access-hint text-muted small">
      Every view or print gets a unique copy ID watermarked on the document with our seal.
      Photocopies without a valid copy ID from this site are not authentic. All copies are logged.
    </p>
  </div>
</template>

<style scoped>
.coa-access-panel {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}
.coa-access-panel.locked {
  border-color: rgba(255, 255, 255, 0.12);
}
.coa-access-title {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 6px;
}
.coa-access-notice {
  font-size: 0.75rem;
  color: #fcd34d;
  line-height: 1.45;
  margin-bottom: 10px;
}
.coa-access-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 0.8rem;
  margin-bottom: 10px;
}
.coa-access-meta dt { color: #9ca3af; }
.coa-access-lock {
  font-size: 0.8rem;
  color: #fbbf24;
  margin-bottom: 10px;
}
.coa-access-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.coa-access-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
