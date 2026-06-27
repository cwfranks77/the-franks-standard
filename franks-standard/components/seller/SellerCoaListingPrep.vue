<script setup>
import { coaReadyForPrint } from '~/utils/coaGatePolicy'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const config = useRuntimeConfig()

const listings = ref([])
const loading = ref(false)
const selectedId = ref('')
const photoFiles = ref([])
const photoPreviews = ref([])
const syncing = ref(false)
const statusMsg = ref('')
const statusError = ref(false)

const selectedListing = computed(() =>
  listings.value.find((l) => l.id === selectedId.value) || null,
)

function gateForListing (row, certPath) {
  return coaReadyForPrint(
    {
      image_paths: row.image_paths,
      description: row.description,
      coa_serial_number: row.coa_serial_number,
      coa_document_serial: row.coa_document_serial,
      coa_auth_status: row.coa_auth_status,
    },
    { primary_image_path: certPath || row.image_paths?.[0] || '', auth_status: row.coa_auth_status },
  )
}

async function loadListings () {
  if (!user.value?.id) return
  loading.value = true
  statusMsg.value = ''
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, coa_type, coa_serial_number, coa_document_serial, coa_auth_status, coa_certificate_id, image_paths, description, status')
      .eq('seller_id', user.value.id)
      .in('coa_type', ['franks_issued', 'upload'])
      .neq('status', 'removed')
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error

    const rows = data || []
    const certIds = rows.map((r) => r.coa_certificate_id).filter(Boolean)
    let certMap = {}
    if (certIds.length) {
      const { data: certs } = await supabase
        .from('coa_certificates')
        .select('id, primary_image_path')
        .in('id', certIds)
      certMap = Object.fromEntries((certs || []).map((c) => [c.id, c.primary_image_path]))
    }

    listings.value = rows.map((row) => {
      const certThumb = row.coa_certificate_id ? certMap[row.coa_certificate_id] : ''
      const gate = gateForListing(row, certThumb)
      return { ...row, certPrimaryImagePath: certThumb || '', printReady: gate.ok, lockReason: gate.reason || '' }
    })
  } catch (e) {
    statusMsg.value = e?.message || String(e)
    statusError.value = true
  } finally {
    loading.value = false
  }
}

function handlePhotos (e) {
  const files = [...(e.target.files || [])]
  for (const file of files) {
    photoFiles.value.push(file)
    photoPreviews.value.push(URL.createObjectURL(file))
  }
  e.target.value = ''
}

function removePhoto (idx) {
  photoFiles.value.splice(idx, 1)
  URL.revokeObjectURL(photoPreviews.value[idx])
  photoPreviews.value.splice(idx, 1)
}

async function uploadPhotosAndSync () {
  if (!selectedListing.value || !user.value?.id) return
  if (photoFiles.value.length < 1) {
    statusMsg.value = 'Add at least one item thumbnail photo first.'
    statusError.value = true
    return
  }
  if (String(selectedListing.value.description || '').trim().length < 20) {
    statusMsg.value = 'Edit the listing description (20+ characters) before syncing the COA.'
    statusError.value = true
    return
  }

  syncing.value = true
  statusMsg.value = ''
  statusError.value = false
  try {
    const listingId = selectedListing.value.id
    const base = `${user.value.id}/${listingId}`
    const existing = [...(selectedListing.value.image_paths || [])]
    const newPaths = [...existing]

    for (let i = 0; i < photoFiles.value.length; i++) {
      const file = photoFiles.value[i]
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg'
      const path = `${base}/item-${existing.length + i}.${ext}`
      const { error: upErr } = await supabase.storage.from('listings').upload(path, file, {
        upsert: true,
        contentType: file.type || undefined,
      })
      if (upErr) throw upErr
      newPaths.push(path)
    }

    const { error: updErr } = await supabase
      .from('listings')
      .update({ image_paths: newPaths })
      .eq('id', listingId)
    if (updErr) throw updErr

    if (selectedListing.value.coa_type === 'franks_issued') {
      const { data: { session } } = await supabase.auth.getSession()
      const fnBase = String(config.public.supabaseUrl || '').replace(/\/+$/, '')
      const res = await fetch(`${fnBase}/functions/v1/issue-coa-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ listing_id: listingId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body.message || body.error || 'COA sync failed after photo upload.')
      }
      statusMsg.value = body.print_ready
        ? 'Photos saved and COA thumbnail synced — print may unlock when all gates pass.'
        : `Photos saved. COA sync: ${body.print_lock_reason || 'complete remaining requirements.'}`
    } else {
      statusMsg.value = 'Item photos saved to listing. Re-register uploaded COA from the sell flow if needed.'
    }

    photoFiles.value = []
    photoPreviews.value.forEach((u) => URL.revokeObjectURL(u))
    photoPreviews.value = []
    await loadListings()
  } catch (e) {
    statusMsg.value = e?.message || String(e)
    statusError.value = true
  } finally {
    syncing.value = false
  }
}

watch(user, (u) => {
  if (u?.id) loadListings()
}, { immediate: true })
</script>

<template>
  <section class="coa-listing-prep">
    <h3 class="coa-listing-prep__title">Upload COA item photos (existing listings)</h3>
    <p class="coa-listing-prep__lead">
      Pick a collectible listing, upload thumbnail photos of the <strong>actual item</strong>, then sync so the certificate freezes photo 1 on the COA.
    </p>

    <p v-if="!user?.id" class="coa-listing-prep__signin">
      <NuxtLink to="/auth/login" class="text-secondary underline">Sign in</NuxtLink> to upload photos to your listings.
    </p>

    <template v-else>
      <p v-if="loading" class="text-white/70 text-xs">Loading your COA listings…</p>

      <label v-else-if="listings.length" class="block">
        <span class="text-white font-medium text-xs uppercase tracking-wide">Your listing</span>
        <select v-model="selectedId" class="mt-1 w-full rounded-md border border-border bg-surface2 px-3 py-2 text-white">
          <option value="">Select a listing…</option>
          <option v-for="row in listings" :key="row.id" :value="row.id">
            {{ row.title }} — {{ row.printReady ? 'Print ready' : 'Needs photos / sync' }}
          </option>
        </select>
      </label>

      <p v-else class="text-white/70 text-xs">
        No COA listings yet.
        <NuxtLink to="/sell/start?kind=collectible" class="text-secondary underline">Create a collectible listing</NuxtLink>
      </p>

      <p v-if="selectedListing && !selectedListing.printReady" class="coa-listing-prep__warn" role="status">
        Locked: {{ selectedListing.lockReason || 'Complete COA requirements.' }}
      </p>

      <div v-if="selectedListing" class="coa-listing-prep__upload">
        <label class="coa-listing-prep__add">
          <input type="file" accept="image/*" multiple hidden @change="handlePhotos">
          <span>+ Add item thumbnail photos</span>
        </label>
        <div class="coa-listing-prep__previews">
          <figure v-for="(src, idx) in photoPreviews" :key="idx">
            <img :src="src" alt="New thumbnail preview">
            <button type="button" @click="removePhoto(idx)">Remove</button>
          </figure>
        </div>
        <button
          type="button"
          class="px-4 py-2 rounded-md bg-primary text-bg font-medium text-sm disabled:opacity-40"
          :disabled="syncing || photoPreviews.length < 1"
          @click="uploadPhotosAndSync"
        >
          {{ syncing ? 'Uploading…' : 'Save photos & sync COA thumbnail' }}
        </button>
      </div>

      <p
        v-if="statusMsg"
        class="coa-listing-prep__status"
        :class="{ 'coa-listing-prep__status--err': statusError }"
        role="status"
      >
        {{ statusMsg }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.coa-listing-prep {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 14px;
  background: rgba(15, 20, 25, 0.5);
}
.coa-listing-prep__title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #fff;
}
.coa-listing-prep__lead {
  font-size: 0.82rem;
  line-height: 1.5;
  color: #d1d5db;
  margin: 0 0 12px;
}
.coa-listing-prep__signin { font-size: 0.82rem; color: #9ca3af; }
.coa-listing-prep__warn {
  font-size: 0.8rem;
  color: #fcd34d;
  margin: 10px 0;
}
.coa-listing-prep__upload { margin-top: 12px; }
.coa-listing-prep__add {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border: 1px dashed rgba(201, 168, 76, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #e8d5a3;
  margin-bottom: 10px;
}
.coa-listing-prep__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.coa-listing-prep__previews figure {
  margin: 0;
  width: 88px;
}
.coa-listing-prep__previews img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #374151;
}
.coa-listing-prep__previews button {
  font-size: 0.68rem;
  color: #f87171;
  margin-top: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.coa-listing-prep__status {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #6ee7b7;
}
.coa-listing-prep__status--err { color: #fca5a5; }
</style>
