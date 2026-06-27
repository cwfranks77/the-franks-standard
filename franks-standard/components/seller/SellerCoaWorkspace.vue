<script setup>
import {
  COA_NON_TRANSFERABLE_NOTICE,
  MIN_DESCRIPTION_CHARS,
  isValidElectronicSignature,
  normalizeSignerName,
} from '~/utils/coaIssuance'
import {
  COA_FRAUD_PROTECTION_BULLETS,
  COA_OWNER_MANAGER_LEAD,
  FRANKS_COA_SERIAL_FORMAT,
} from '~/utils/franksCoaModel.js'

const listingTitle = ref('')
const category = ref('Collectibles')
const signedName = ref('')
const descriptionExcerpt = ref('')
const photoFiles = ref([])
const photoPreviews = ref([])
const issueError = ref('')

const signatureValid = computed(() => isValidElectronicSignature(signedName.value))
const thumbnailCount = computed(() => photoPreviews.value.length)
const descriptionLength = computed(() => String(descriptionExcerpt.value || '').trim().length)

const mayContinueToSell = computed(() =>
  thumbnailCount.value >= 1
  && descriptionLength.value >= MIN_DESCRIPTION_CHARS
  && signatureValid.value
  && listingTitle.value.trim().length >= 3,
)

const sellContinueUrl = computed(() => {
  const q = new URLSearchParams({
    kind: 'collectible',
    coaType: 'franks_issued',
  })
  if (listingTitle.value.trim()) q.set('title', listingTitle.value.trim())
  return `/sell/start?${q.toString()}`
})

function handlePhotos (e) {
  const files = [...(e.target.files || [])]
  for (const file of files) {
    photoFiles.value.push(file)
    photoPreviews.value.push(URL.createObjectURL(file))
  }
  issueError.value = ''
  e.target.value = ''
}

function removePhoto (idx) {
  photoFiles.value.splice(idx, 1)
  URL.revokeObjectURL(photoPreviews.value[idx])
  photoPreviews.value.splice(idx, 1)
}

function onPrintBlocked () {
  issueError.value =
    'COA cannot be printed until item thumbnail photos, description, platform serial, and backend verification are complete on a published listing.'
}

function onTransferBlocked () {
  issueError.value =
    `${COA_NON_TRANSFERABLE_NOTICE} Transfer is never allowed — not before or after serial issue.`
}

function onContinueWithoutPhotos () {
  issueError.value = 'Upload at least one item thumbnail photo before continuing to your listing.'
}
</script>

<template>
  <div class="space-y-5 text-sm">
    <div class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-white">
      <p class="font-semibold mb-1">Fraud protection (strict — enforced by our servers)</p>
      <ul class="list-disc list-inside space-y-1 text-white/90 text-xs leading-relaxed">
        <li v-for="(line, i) in COA_FRAUD_PROTECTION_BULLETS" :key="i">{{ line }}</li>
      </ul>
    </div>

    <div class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-white">
      <p class="font-semibold mb-1">COA rules for every seller</p>
      <p class="text-xs text-amber-100/90 mb-2">{{ COA_OWNER_MANAGER_LEAD }}</p>
      <ul class="list-disc list-inside space-y-1 text-white/90 text-xs">
        <li><strong>Never transferable</strong> — a COA is permanently tied to one item and one listing. It cannot move to another item at any stage.</li>
        <li><strong>Item thumbnails required</strong> — upload real photos of the piece; photo 1 is frozen on the certificate.</li>
        <li><strong>Print locked</strong> until thumbnails, description, serial, signature, and backend verification are complete.</li>
        <li>Franks serials are issued by our server at publish — not from this preview screen.</li>
      </ul>
      <p class="text-xs text-amber-100/90 mt-2">{{ COA_NON_TRANSFERABLE_NOTICE }}</p>
    </div>

    <SellerCoaRequirementsChecklist
      :thumbnail-count="thumbnailCount"
      :description-length="descriptionLength"
      :has-serial="false"
      :has-signature="signatureValid"
      :auth-verified="false"
    />

    <section class="rounded-lg border border-border bg-surface2/50 p-4">
      <h3 class="font-semibold text-white mb-1">Step 1 — Upload item thumbnail photos (required)</h3>
      <p class="text-xs text-white/75 mb-3">
        Clear photos of the <strong>actual item</strong> — front, back, and any serial or grade label. These become the certified thumbnail on your COA.
      </p>
      <label class="coa-photo-add">
        <input type="file" accept="image/*" multiple hidden @change="handlePhotos">
        <span>+ Add item photos for COA</span>
      </label>
      <div v-if="photoPreviews.length" class="coa-photo-grid">
        <figure v-for="(src, idx) in photoPreviews" :key="idx">
          <img :src="src" :alt="`Item photo ${idx + 1}`">
          <figcaption v-if="idx === 0">Cover / COA thumbnail</figcaption>
          <button type="button" @click="removePhoto(idx)">Remove</button>
        </figure>
      </div>
      <p v-else class="text-amber-200 text-xs mt-2" role="alert">No photos yet — COA stays locked until you add at least one.</p>
    </section>

    <SellerCoaListingPrep />

    <div class="grid sm:grid-cols-2 gap-3">
      <label class="block">
        <span class="text-white font-medium text-xs uppercase tracking-wide">Item title</span>
        <input
          v-model="listingTitle"
          type="text"
          class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
          placeholder="e.g. 1952 Topps Mickey Mantle #311"
        >
      </label>
      <label class="block">
        <span class="text-white font-medium text-xs uppercase tracking-wide">Category</span>
        <input
          v-model="category"
          type="text"
          class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
          placeholder="Collectibles"
        >
      </label>
    </div>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Brief item description (min {{ MIN_DESCRIPTION_CHARS }} characters)</span>
      <textarea
        v-model="descriptionExcerpt"
        rows="3"
        class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
        placeholder="Describe the item, condition, and visible serial or grade…"
      />
      <p class="text-xs text-white/60 mt-1">{{ descriptionLength }} / {{ MIN_DESCRIPTION_CHARS }} characters minimum</p>
    </label>

    <label class="block">
      <span class="text-white font-medium text-xs uppercase tracking-wide">Electronic signature (full legal name)</span>
      <input
        v-model="signedName"
        type="text"
        autocomplete="name"
        class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white"
        placeholder="First Last"
      >
      <p class="text-xs text-white/75 mt-1">
        Stored with your server-issued serial when you publish with Franks COA.
      </p>
    </label>

    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-if="mayContinueToSell"
        :to="sellContinueUrl"
        class="px-4 py-2 rounded-md bg-primary text-bg font-medium text-sm"
      >
        Continue to full listing (add these photos there)
      </NuxtLink>
      <button
        v-else
        type="button"
        class="px-4 py-2 rounded-md bg-primary/40 text-bg/80 font-medium text-sm cursor-not-allowed"
        @click="onContinueWithoutPhotos"
      >
        Continue to listing (complete steps first)
      </button>
      <NuxtLink to="/sell/start?kind=collectible" class="px-4 py-2 rounded-md border border-border text-white text-sm">
        New collectible listing
      </NuxtLink>
      <button
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
        Transfer never allowed
      </button>
    </div>

    <p v-if="issueError" class="text-amber-200 text-xs" role="alert">{{ issueError }}</p>

    <div class="rounded-xl border border-border bg-surface2 p-5 opacity-80">
      <p class="text-xs uppercase tracking-wide text-white/70 mb-1">Certificate preview (not valid until server issue)</p>
      <p class="font-mono text-lg text-secondary mb-2">{{ FRANKS_COA_SERIAL_FORMAT }} — assigned at publish</p>
      <p class="text-white"><strong>Item:</strong> {{ listingTitle || '—' }}</p>
      <p class="text-white/85"><strong>Thumbnails:</strong> {{ thumbnailCount }} photo(s) selected here</p>
      <p class="text-white/85"><strong>Seller signature:</strong> {{ signatureValid ? normalizeSignerName(signedName) : '—' }}</p>
      <p class="text-white/70 text-xs mt-3 border-t border-border pt-3">
        {{ COA_NON_TRANSFERABLE_NOTICE }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.coa-photo-add {
  display: inline-flex;
  padding: 10px 14px;
  border: 1px dashed rgba(201, 168, 76, 0.55);
  border-radius: 6px;
  cursor: pointer;
  color: #e8d5a3;
  font-size: 0.85rem;
}
.coa-photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}
.coa-photo-grid figure {
  margin: 0;
  width: 100px;
}
.coa-photo-grid img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid rgba(201, 168, 76, 0.4);
}
.coa-photo-grid figcaption {
  font-size: 0.65rem;
  color: #6ee7b7;
  margin-top: 4px;
}
.coa-photo-grid button {
  font-size: 0.68rem;
  color: #f87171;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-top: 2px;
}
</style>
