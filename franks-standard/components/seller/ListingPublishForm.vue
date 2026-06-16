<script setup lang="ts">
import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'
import { loadCoaDraft } from '~/utils/coaIssuance'
import {
  scanListingCompliance,
  scanListingImageNames,
  formatComplianceBlockMessage,
} from '~/utils/listingCompliance'
import { appendLocalActivity } from '~/utils/platformActivity'

const title = ref('')
const description = ref('')
const category = ref('Sports Cards & Memorabilia')
const price = ref('')
const imageNames = ref<string[]>([])
const coaSerial = ref('')
const sellerSignature = ref('')
const blockMessage = ref('')
const reviewFlags = ref<string[]>([])
const published = ref(false)

onMounted(() => {
  const draft = loadCoaDraft()
  if (draft?.serial) {
    coaSerial.value = draft.serial
    sellerSignature.value = draft.signedName || ''
    if (draft.listingTitle && !title.value) title.value = draft.listingTitle
    if (draft.category) category.value = draft.category
  }
})

function onFiles (event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  imageNames.value = files.map((f) => f.name)
}

function validate () {
  blockMessage.value = ''
  reviewFlags.value = []
  published.value = false

  const scan = scanListingCompliance({
    category: category.value,
    title: title.value,
    description: description.value,
    coa_serial_number: coaSerial.value,
    seller_signature: sellerSignature.value,
    coa_type: coaSerial.value ? 'franks_issued' : 'none',
    price: price.value ? Number(price.value) : null,
  })
  const images = scanListingImageNames(imageNames.value)

  if (!scan.ok) {
    blockMessage.value = formatComplianceBlockMessage(scan.flags)
    appendLocalActivity({
      user_id: 'seller',
      user_display_name: 'Seller',
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: 'Listing publish blocked by compliance scan',
      action_category: 'infraction',
      metadata: { title: title.value.slice(0, 80), flags: scan.flags.map((f) => f.id) },
    })
    return false
  }

  if (!images.ok) {
    reviewFlags.value = images.flags.map((f) => f.label)
  }

  return true
}

function submit () {
  if (!validate()) return
  published.value = true
  appendLocalActivity({
    user_id: 'seller',
    user_display_name: 'Seller',
    ip_address: 'browser-session',
    user_agent: navigator.userAgent,
    action: `Listing draft approved locally: ${title.value.slice(0, 80)}`,
    action_category: 'listing',
    metadata: { category: category.value, coa_serial: coaSerial.value || null },
  })
}
</script>

<template>
  <div class="space-y-5 text-sm max-w-xl">
    <div class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-white">
      <p class="font-semibold mb-1">Before you list</p>
      <ul class="list-disc list-inside space-y-1 text-white/90 text-xs">
        <li>No personal email, phone, or off-platform payment in listings.</li>
        <li>Collectibles and antiques need a Franks COA serial + legal-name e-signature.</li>
        <li>Counterfeit collectibles trigger automatic account freeze pending review.</li>
        <li>
          The Franks Standard guarantees authenticity processes — see
          <NuxtLink to="/terms" class="text-cyan-300 underline">Terms</NuxtLink>
          for seller responsibility and platform limits.
        </li>
      </ul>
    </div>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Title</span>
      <input v-model="title" type="text" class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white" placeholder="Item title">
    </label>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Description</span>
      <textarea v-model="description" rows="4" class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white" placeholder="Condition, provenance, shipping notes" />
    </label>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Category</span>
      <select v-model="category" class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white">
        <option v-for="c in LISTING_CATEGORIES" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Price (USD)</span>
      <input v-model="price" type="number" min="0" step="0.01" class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white" placeholder="0.00">
    </label>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Photos</span>
      <input type="file" multiple accept="image/*" class="mt-1 w-full text-white/80 text-xs" @change="onFiles">
      <p v-if="imageNames.length" class="text-xs text-white/55 mt-1">{{ imageNames.join(', ') }}</p>
    </label>

    <div class="border border-border rounded-lg p-4 space-y-3 bg-surface2/30">
      <p class="font-semibold text-white">COA (collectibles &amp; antiques)</p>
      <p class="text-xs text-white/70">
        Issue a serial on <NuxtLink to="/sell/coa" class="text-primary underline">COA workspace</NuxtLink> first, or enter below.
      </p>
      <input v-model="coaSerial" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="FS-2026-123456">
      <input v-model="sellerSignature" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="Legal name e-signature">
    </div>

    <pre v-if="blockMessage" class="text-xs text-red-300 whitespace-pre-wrap bg-red-950/30 p-3 rounded">{{ blockMessage }}</pre>
    <ul v-if="reviewFlags.length" class="text-xs text-amber-300 list-disc list-inside">
      <li v-for="(f, i) in reviewFlags" :key="i">{{ f }}</li>
    </ul>

    <p v-if="published" class="text-green-400 text-sm">
      Compliance passed on this device. Live publish connects when your seller account and Supabase listing API are linked.
    </p>

    <button type="button" class="px-5 py-2 bg-primary text-bg rounded font-medium" @click="submit">
      Check &amp; publish listing
    </button>

    <p class="text-xs text-white/50">
      <NuxtLink to="/prohibited-items" class="underline">Prohibited items</NuxtLink> ·
      <NuxtLink to="/seller-agreement" class="underline">Seller agreement</NuxtLink>
    </p>
  </div>
</template>
