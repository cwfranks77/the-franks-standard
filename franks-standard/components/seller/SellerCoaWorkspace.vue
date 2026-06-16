<script setup>
import {
  canPrintOrTransferCoa,
  clearCoaDraft,
  generateCoaSerial,
  isValidElectronicSignature,
  loadCoaDraft,
  normalizeSignerName,
  saveCoaDraft,
} from '~/utils/coaIssuance'

const listingTitle = ref('')
const category = ref('Collectibles')
const signedName = ref('')
const record = ref(loadCoaDraft())
const issueError = ref('')

const signatureValid = computed(() => isValidElectronicSignature(signedName.value))
const issued = computed(() => canPrintOrTransferCoa(record.value))
const serialDisplay = computed(() => record.value?.serial || '')

function issueSerial () {
  issueError.value = ''
  if (!listingTitle.value.trim()) {
    issueError.value = 'Enter the item title before issuing a COA serial.'
    return
  }
  if (!signatureValid.value) {
    issueError.value = 'Type your full legal name (first and last) as your electronic signature.'
    return
  }
  const serial = generateCoaSerial()
  const next = {
    serial,
    signedName: normalizeSignerName(signedName.value),
    signedAt: new Date().toISOString(),
    listingTitle: listingTitle.value.trim(),
    category: category.value.trim() || 'Collectibles',
  }
  record.value = next
  saveCoaDraft(next)
}

function resetCoa () {
  record.value = null
  signedName.value = ''
  issueError.value = ''
  clearCoaDraft()
}

function onPrintBlocked () {
  issueError.value = 'COA cannot be printed until a floor-office serial is issued and your electronic signature is on file.'
}

function printCoa () {
  if (!issued.value || !import.meta.client) return
  window.print()
}

function onTransferBlocked () {
  if (issued.value) {
    issueError.value = 'This COA serial is bound to one listing and cannot be transferred to another item.'
    return
  }
  issueError.value = 'COA cannot be transferred until a serial number is issued and your electronic signature is on file.'
}

onMounted(() => {
  const draft = record.value
  if (draft) {
    listingTitle.value = draft.listingTitle || ''
    category.value = draft.category || 'Collectibles'
    signedName.value = draft.signedName || ''
  }
})
</script>

<template>
  <div class="space-y-5 text-sm">
    <div class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-white">
      <p class="font-semibold mb-1">Seller COA rules</p>
      <ul class="list-disc list-inside space-y-1 text-white/90">
        <li>COA tools are available to every seller listing collectibles.</li>
        <li><strong>Not printable</strong> until a serial number is issued on this platform.</li>
        <li><strong>Not transferable</strong> to another item until serial + e-signature are complete.</li>
        <li>One Franks serial (<code class="text-primary">FS-YYYY-NNNNNN</code>) binds to one listing only.</li>
      </ul>
    </div>

    <div class="grid sm:grid-cols-2 gap-3">
      <label class="block">
        <span class="text-white font-medium text-xs uppercase tracking-wide">Item title</span>
        <input
          v-model="listingTitle"
          type="text"
          class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
          placeholder="e.g. 1952 Topps Mickey Mantle #311"
          :disabled="issued"
        >
      </label>
      <label class="block">
        <span class="text-white font-medium text-xs uppercase tracking-wide">Category</span>
        <input
          v-model="category"
          type="text"
          class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
          placeholder="Collectibles"
          :disabled="issued"
        >
      </label>
    </div>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Electronic signature (full legal name)</span>
      <input
        v-model="signedName"
        type="text"
        autocomplete="name"
        class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
        placeholder="First Last"
        :disabled="issued"
      >
      <p class="text-xs text-white/75 mt-1">
        Typing your name acts as your electronic signature on the Seller Written Guarantee attached to this COA.
      </p>
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="px-4 py-2 rounded-md bg-primary text-bg font-medium text-sm disabled:opacity-40"
        :disabled="issued"
        @click="issueSerial"
      >
        Issue COA serial
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-md border border-border text-white text-sm"
        :disabled="!issued"
        @click="resetCoa"
      >
        Start over
      </button>
      <button
        v-if="issued"
        type="button"
        class="px-4 py-2 rounded-md border border-secondary text-secondary text-sm"
        @click="printCoa"
      >
        Print COA
      </button>
      <button
        v-else
        type="button"
        class="px-4 py-2 rounded-md border border-border text-white/50 text-sm cursor-not-allowed"
        @click="onPrintBlocked"
      >
        Print locked
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-md border border-border text-white/50 text-sm"
        @click="onTransferBlocked"
      >
        Transfer locked
      </button>
    </div>

    <p v-if="issueError" class="text-amber-200 text-xs" role="alert">{{ issueError }}</p>

    <div
      v-if="record"
      id="coa-print-area"
      class="rounded-xl border border-border bg-surface2 p-5 coa-print-area"
      :class="{ 'opacity-60': !issued }"
    >
      <p class="text-xs uppercase tracking-wide text-white/70 mb-1">Certificate preview</p>
      <p v-if="!issued" class="text-amber-200 text-xs mb-3">
        Preview only — not valid for buyers until serial is issued and signed.
      </p>
      <p class="font-mono text-lg text-secondary mb-2">{{ serialDisplay || 'Pending serial…' }}</p>
      <p class="text-white"><strong>Item:</strong> {{ record.listingTitle }}</p>
      <p class="text-white/85"><strong>Seller signature:</strong> {{ record.signedName || '—' }}</p>
      <p v-if="record.signedAt" class="text-white/75 text-xs mt-2">
        Signed {{ new Date(record.signedAt).toLocaleString() }}
      </p>
      <p class="text-white/70 text-xs mt-3 border-t border-border pt-3">
        The Franks Standard LLC — marketplace facilitator. Seller backs authenticity; platform does not warrant genuineness.
        This COA is non-transferable to other listings without a new serial and signature.
      </p>
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #coa-print-area,
  #coa-print-area * {
    visibility: visible;
  }
  #coa-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: #111827 !important;
    background: #fff !important;
    -webkit-text-fill-color: #111827 !important;
  }
}
</style>
