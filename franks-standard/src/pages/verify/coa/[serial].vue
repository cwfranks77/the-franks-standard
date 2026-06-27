<template>
  <div class="verify-page">
    <div class="container" style="padding: 48px 16px 80px; max-width: 520px;">
      <p class="eyebrow">COA verification</p>
      <h1>Franks Standard COA</h1>
      <p class="serial-display">{{ serial }}</p>

      <div v-if="loading" class="text-muted">Checking registry…</div>
      <div v-else-if="error" class="verify-card invalid">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="result" class="verify-card" :class="result.valid ? 'valid' : 'invalid'">
        <p class="status-line">{{ result.message }}</p>
        <img v-if="result.image_url" :src="result.image_url" alt="Item on certificate" class="verify-img" />
        <dl class="verify-meta">
          <dt>Floor office #</dt>
          <dd>{{ result.floor_slot_code || serial }}</dd>
          <dt>Office paired</dt>
          <dd>{{ result.office_paired ? 'Yes — COA matches listing slot & photos' : 'No — see message' }}</dd>
          <dt>Item unchanged</dt>
          <dd>{{ result.item_unchanged ? 'Yes' : 'Photos/description changed since issue' }}</dd>
          <dt>Certificate</dt>
          <dd>{{ result.certificate_status }}</dd>
          <dt>Listing</dt>
          <dd>{{ result.listing_title || '—' }}</dd>
          <dt>Issued</dt>
          <dd>{{ issuedLabel }}</dd>
        </dl>
        <p v-if="result.non_transferable" class="non-transfer-notice text-muted small">
          This certificate is <strong>non-transferable</strong> — permanently bound to one listing and item snapshot.
        </p>
        <p v-if="result.certified_description" class="cert-desc text-muted small">
          <strong>Certified description (excerpt):</strong> {{ result.certified_description }}
        </p>
        <NuxtLink v-if="result.listing_url" :to="result.listing_url.replace('https://thefranksstandard.com', '')" class="btn btn-primary btn-sm">
          View listing
        </NuxtLink>
      </div>
      <CoaSellerDisclosure variant="full" class="mt-3" />
      <p class="text-muted small mt-3">
        Each listing is a <strong>floor office</strong> with number <code>FS-YYYY-NNNNNN</code>. The COA serial is that office number.
        The item in the photos at issue time is the only item that certificate covers — not a lookalike in another slot.
      </p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const serial = computed(() => String(route.params.serial || '').toUpperCase())

const loading = ref(true)
const error = ref('')
const result = ref(null)

const issuedLabel = computed(() => {
  if (!result.value?.issued_at) return '—'
  return new Date(result.value.issued_at).toLocaleDateString()
})

async function verify () {
  loading.value = true
  error.value = ''
  result.value = null
  try {
    const base = String(config.public.supabaseUrl || '').replace(/\/+$/, '')
    const res = await fetch(`${base}/functions/v1/verify-coa-serial?serial=${encodeURIComponent(serial.value)}`)
    const data = await res.json()
    if (!res.ok) {
      error.value = data.message || data.error || 'Verification failed.'
      return
    }
    result.value = data
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

onMounted(verify)

useSeoMeta({
  title: () => `Verify COA ${serial.value} | The Franks Standard`,
  robots: 'noindex',
})
</script>

<style scoped>
.verify-page h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; }
.eyebrow { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #92400e; }
.serial-display { font-family: ui-monospace, monospace; font-size: 1.25rem; font-weight: 800; color: #111827; margin-bottom: 20px; }
.verify-card { padding: 20px; border-radius: 12px; border: 2px solid #e5e7eb; }
.verify-card.valid { border-color: #047857; background: #ecfdf5; }
.verify-card.invalid { border-color: #b91c1c; background: #fef2f2; }
.status-line { font-weight: 700; margin: 0 0 12px; }
.verify-img { width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; margin-bottom: 12px; background: #f3f4f6; }
.verify-meta { display: grid; grid-template-columns: 100px 1fr; gap: 6px 12px; font-size: 0.9rem; margin: 0 0 16px; }
.verify-meta dt { font-weight: 700; color: #6b7280; }
</style>
