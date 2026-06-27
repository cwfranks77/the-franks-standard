<template>
  <div class="coa-doc-page">
    <div v-if="loading" class="coa-doc-status">
      <p>Preparing your registered COA copy…</p>
    </div>
    <div v-else-if="error" class="coa-doc-status coa-doc-status--error">
      <h1>COA locked</h1>
      <p>{{ error }}</p>
      <p class="coa-doc-status__hint">
        Required before print: item thumbnail photo on the listing, brief description, assigned serial, and backend verification.
      </p>
      <NuxtLink to="/" class="btn btn-outline btn-sm">Home</NuxtLink>
    </div>
    <template v-else-if="doc">
      <div class="coa-doc-toolbar no-print">
        <p class="coa-doc-toolbar__note">
          This copy is watermarked with ID <strong>{{ doc.copyToken }}</strong> and logged in our registry.
          Unauthorized photocopies will not verify.
        </p>
        <button type="button" class="btn btn-primary btn-sm" :disabled="!doc.primaryImageUrl" @click="requestPrintCopy">
          Print registered copy
        </button>
        <NuxtLink :to="`/verify/coa/${serial}?copy=${encodeURIComponent(doc.copyToken)}`" class="btn btn-outline btn-sm">
          Verify this copy
        </NuxtLink>
      </div>

      <CoaCertificateTemplate
        :serial="doc.serial"
        :copy-token="doc.copyToken"
        :copy-number="doc.copyNumber"
        :title="doc.title"
        :description-excerpt="doc.descriptionExcerpt"
        :seller-name="doc.sellerName"
        :seller-signed-at="doc.sellerSignedAt"
        :issued-at="doc.issuedAt"
        :floor-slot="doc.floorSlot"
        :verify-url="doc.verifyUrl"
        :copy-verify-url="doc.copyVerifyUrl"
        :third-party-serial="doc.thirdPartySerial"
        :document-source="doc.documentSource"
        :primary-image-url="doc.primaryImageUrl"
      />
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const { publicUrlForPath } = useListingImageUrl()

const serial = computed(() => String(route.params.serial || '').toUpperCase())
const loading = ref(true)
const error = ref('')
const doc = ref(null)

async function issueCopy (copyType) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    await navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return null
  }
  const base = String(config.public.supabaseUrl || '').replace(/\/+$/, '')
  const existingCopy = String(route.query.copy || '').trim()
  const res = await fetch(`${base}/functions/v1/issue-coa-print-copy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      serial: serial.value,
      listing_id: String(route.query.listing || ''),
      copy_type: copyType,
      copy_token: existingCopy && copyType === 'view' ? existingCopy : undefined,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Could not issue a registered COA copy.')
  }
  return data
}

function mapDocument (payload) {
  const d = payload.document || {}
  const primaryImageUrl = d.primary_image_path ? publicUrlForPath(d.primary_image_path) : ''
  if (!primaryImageUrl) {
    throw new Error('Item thumbnail is not on this certificate yet. Add listing photos, then re-publish or re-sync the COA.')
  }
  if (!String(d.description_excerpt || '').trim() || String(d.description_excerpt).trim().length < 20) {
    throw new Error('Brief item description is required on the listing before COA print.')
  }
  return {
    serial: d.serial || serial.value,
    copyToken: payload.copy_token,
    copyNumber: payload.copy_number,
    title: d.title || '',
    descriptionExcerpt: d.description_excerpt || '',
    sellerName: d.seller_name || '',
    sellerSignedAt: d.seller_signed_at || '',
    issuedAt: d.issued_at || '',
    floorSlot: d.floor_slot || d.serial || '',
    verifyUrl: d.verify_url || '',
    copyVerifyUrl: d.copy_verify_url || '',
    thirdPartySerial: d.third_party_serial || '',
    documentSource: d.document_source || 'franks_issued',
    primaryImageUrl,
  }
}

async function loadDocument () {
  loading.value = true
  error.value = ''
  doc.value = null
  try {
    const payload = await issueCopy(route.query.print === '1' ? 'print' : 'view')
    if (!payload) return
    doc.value = mapDocument(payload)

    if (route.query.print === '1' && import.meta.client && doc.value.primaryImageUrl) {
      await nextTick()
      setTimeout(() => window.print(), 400)
    }
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

async function requestPrintCopy () {
  if (!doc.value?.primaryImageUrl) {
    alert('Item thumbnail must be on the certificate before print.')
    return
  }
  try {
    const payload = await issueCopy('print')
    if (!payload) return
    doc.value = mapDocument(payload)
    await nextTick()
    window.print()
  } catch (e) {
    alert(e?.message || String(e))
  }
}

onMounted(loadDocument)

useSeoMeta({
  title: `COA document ${serial.value} | The Franks Standard`,
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.coa-doc-page {
  min-height: 100vh;
  background: #e5e7eb;
  padding: 24px 16px 48px;
}
.coa-doc-status {
  max-width: 520px;
  margin: 48px auto;
  text-align: center;
  color: #374151;
}
.coa-doc-status--error h1 { font-size: 1.25rem; margin-bottom: 8px; }
.coa-doc-status__hint {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 12px 0 16px;
  color: #6b7280;
}
.coa-doc-toolbar {
  max-width: 8.5in;
  margin: 0 auto 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.coa-doc-toolbar__note {
  flex: 1 1 100%;
  font-size: 0.82rem;
  color: #374151;
  margin: 0 0 4px;
}
@media print {
  .coa-doc-page { background: #fff; padding: 0; }
  .no-print { display: none !important; }
}
</style>
