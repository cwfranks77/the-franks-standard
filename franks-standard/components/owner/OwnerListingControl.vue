<script setup lang="ts">
import { appendLocalActivity } from '~/utils/platformActivity'
import { publicListingImageUrl } from '~/utils/listingImageUrl'

type ListingRow = Record<string, unknown>

const config = useRuntimeConfig()
const pending = ref(false)
const loadError = ref('')
const listings = ref<ListingRow[]>([])
const actionMsg = ref('')
const search = ref('')
const filter = ref('published')
const editingId = ref('')
const editForm = reactive({
  title: '',
  description: '',
  category: '',
  price: '',
  status: 'published',
})

const { busy, lastError, callOps } = useIntegrityOps()

const supabaseUrl = computed(() => String(config.public.supabaseUrl || '').replace(/\/$/, ''))

const filteredListings = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return listings.value
  return listings.value.filter((row) => {
    const title = String(row.title || '').toLowerCase()
    const category = String(row.category || '').toLowerCase()
    const id = String(row.id || '').toLowerCase()
    return title.includes(q) || category.includes(q) || id.includes(q)
  })
})

function rowImage (row: ListingRow) {
  const paths = row.image_paths
  const first = Array.isArray(paths) ? String(paths[0] || '') : ''
  return publicListingImageUrl(supabaseUrl.value, first)
}

function money (row: ListingRow) {
  const n = Number(row.price)
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : '—'
}

function shortId (id: string) {
  return id ? `${id.slice(0, 8)}…` : '—'
}

async function loadListings () {
  pending.value = true
  loadError.value = ''
  actionMsg.value = ''
  try {
    const data = await callOps('list_listings', {
      status: filter.value,
      search: search.value.trim(),
      limit: 120,
    })
    if (!data?.ok) {
      if (!lastError.value) loadError.value = 'Could not load listings.'
      listings.value = []
      return
    }
    listings.value = (data.listings as ListingRow[]) || []
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Load failed'
    listings.value = []
  } finally {
    pending.value = false
  }
}

function startEdit (row: ListingRow) {
  editingId.value = String(row.id)
  editForm.title = String(row.title || '')
  editForm.description = String(row.description || '')
  editForm.category = String(row.category || '')
  editForm.price = row.price != null ? String(row.price) : ''
  editForm.status = String(row.status || 'published')
}

function cancelEdit () {
  editingId.value = ''
}

async function saveEdit () {
  if (!editingId.value) return
  const price = editForm.price.trim() === '' ? null : Number(editForm.price)
  if (price != null && !Number.isFinite(price)) {
    actionMsg.value = 'Enter a valid price or leave blank.'
    return
  }
  const data = await callOps('update_listing', {
    listing_id: editingId.value,
    title: editForm.title.trim(),
    description: editForm.description.trim(),
    category: editForm.category.trim(),
    price,
    status: editForm.status,
  })
  if (data?.ok) {
    const savedId = editingId.value
    actionMsg.value = `Saved changes to "${editForm.title.trim()}".`
    editingId.value = ''
    appendLocalActivity({
      user_id: 'operator',
      user_display_name: 'Operator',
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: `Updated listing ${savedId}`,
      action_category: 'owner',
      metadata: { listing_id: savedId },
    })
    await loadListings()
  }
}

async function removeListing (id: string, title: string) {
  if (!confirm(`Remove "${title}" from the marketplace?`)) return
  const data = await callOps('delete_listing', { listing_id: id })
  if (data?.ok) {
    actionMsg.value = data.archived
      ? `Archived "${title}" — it had order history so it was hidden instead of permanently deleted.`
      : `Permanently removed "${title}".`
    appendLocalActivity({
      user_id: 'operator',
      user_display_name: 'Operator',
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: data.archived ? `Archived listing ${id}` : `Deleted listing ${id}`,
      action_category: 'owner',
      metadata: { listing_id: id },
    })
    if (editingId.value === id) editingId.value = ''
    await loadListings()
  }
}

async function suspendListing (id: string, title: string) {
  const data = await callOps('suspend_listing', { listing_id: id })
  if (data?.ok) {
    actionMsg.value = `Suspended "${title}" — hidden from buyers.`
    await loadListings()
  }
}

async function republishListing (id: string, title: string) {
  const data = await callOps('update_listing', {
    listing_id: id,
    status: 'published',
    integrity_status: 'clear',
  })
  if (data?.ok) {
    actionMsg.value = `Republished "${title}".`
    await loadListings()
  }
}

async function confirmCounterfeit (id: string) {
  if (!confirm('Confirm counterfeit? Seller account will be frozen pending review (automatic).')) return
  const data = await callOps('confirm_counterfeit', {
    listing_id: id,
    ban_immediately: false,
    notes: 'Operator confirmed counterfeit — auto integrity hold',
  })
  if (data?.ok) {
    actionMsg.value = data.integrity_hold
      ? 'Counterfeit confirmed — seller frozen pending review.'
      : 'Counterfeit confirmed — listing archived.'
    await loadListings()
  }
}

async function runScanAll () {
  const data = await callOps('scan_all', { limit: 200 })
  if (data?.ok) actionMsg.value = `Scanned ${data.scanned ?? 'all'} listings for integrity flags.`
  await loadListings()
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadListings(), 350)
})
watch(filter, loadListings)

onMounted(loadListings)
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Search, edit, hide, or remove <strong>any</strong> seller listing — yours or someone else&apos;s.
      Listings tied to past orders are archived (hidden) instead of permanently deleted.
    </p>

    <div class="flex flex-wrap gap-2 items-center">
      <input
        v-model="search"
        type="search"
        placeholder="Search title, category, or ID…"
        class="flex-1 min-w-[200px] bg-bg border border-border rounded px-3 py-1.5 text-white text-xs"
      >
      <select v-model="filter" class="bg-bg border border-border rounded px-2 py-1.5 text-white text-xs">
        <option value="published">Published (live)</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived / hidden</option>
        <option value="all">All statuses</option>
      </select>
      <button
        type="button"
        class="text-xs px-3 py-1.5 border border-border rounded hover:border-primary text-white"
        :disabled="pending || busy"
        @click="loadListings"
      >
        Refresh
      </button>
      <button
        type="button"
        class="text-xs px-3 py-1.5 border border-border rounded hover:border-primary text-white"
        :disabled="busy"
        @click="runScanAll"
      >
        Scan all listings
      </button>
    </div>

    <p v-if="pending" class="text-white/60">Loading listings…</p>
    <p v-if="loadError" class="text-amber-400 text-xs">{{ loadError }}</p>
    <p v-if="lastError" class="text-red-400 text-xs">{{ lastError }}</p>
    <p v-if="actionMsg" class="text-green-400 text-xs">{{ actionMsg }}</p>

    <div class="max-h-[32rem] overflow-y-auto space-y-3">
      <div
        v-for="row in filteredListings"
        :key="String(row.id)"
        class="border border-border rounded p-3 bg-bg/50"
      >
        <div class="flex gap-3">
          <img
            :src="rowImage(row)"
            alt=""
            class="w-16 h-16 rounded object-cover border border-border shrink-0 bg-surface"
            loading="lazy"
          >
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium">{{ row.title }}</p>
            <p class="text-xs text-white/55">
              {{ money(row) }} · {{ row.category }} · {{ row.status }}
              · integrity: {{ row.integrity_status || 'clear' }}
            </p>
            <p class="text-xs text-white/45">
              Seller {{ shortId(String(row.seller_id || '')) }}
              · ID {{ shortId(String(row.id || '')) }}
            </p>
          </div>
        </div>

        <div v-if="editingId === String(row.id)" class="mt-3 space-y-2 border-t border-border pt-3">
          <label class="block text-xs text-white/70">
            Title
            <input v-model="editForm.title" class="mt-1 w-full bg-bg border border-border rounded px-2 py-1 text-white">
          </label>
          <label class="block text-xs text-white/70">
            Description
            <textarea v-model="editForm.description" rows="3" class="mt-1 w-full bg-bg border border-border rounded px-2 py-1 text-white" />
          </label>
          <div class="grid sm:grid-cols-3 gap-2">
            <label class="block text-xs text-white/70">
              Category
              <input v-model="editForm.category" class="mt-1 w-full bg-bg border border-border rounded px-2 py-1 text-white">
            </label>
            <label class="block text-xs text-white/70">
              Price
              <input v-model="editForm.price" type="number" step="0.01" min="0" class="mt-1 w-full bg-bg border border-border rounded px-2 py-1 text-white">
            </label>
            <label class="block text-xs text-white/70">
              Status
              <select v-model="editForm.status" class="mt-1 w-full bg-bg border border-border rounded px-2 py-1 text-white">
                <option value="published">published</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </label>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-3 py-1 text-xs bg-primary text-bg rounded font-medium" :disabled="busy" @click="saveEdit">
              Save changes
            </button>
            <button type="button" class="px-3 py-1 text-xs border border-border rounded text-white" @click="cancelEdit">
              Cancel
            </button>
          </div>
        </div>

        <div v-else class="flex flex-wrap gap-2 mt-3">
          <NuxtLink
            :to="`/listing/${row.id}`"
            target="_blank"
            class="px-2 py-1 text-xs border border-border rounded hover:border-primary text-white"
          >
            View live
          </NuxtLink>
          <button
            type="button"
            class="px-2 py-1 text-xs border border-border rounded hover:border-primary text-white"
            @click="startEdit(row)"
          >
            Edit
          </button>
          <button
            v-if="row.status !== 'published'"
            type="button"
            class="px-2 py-1 text-xs border border-green-700 text-green-300 rounded"
            @click="republishListing(String(row.id), String(row.title))"
          >
            Republish
          </button>
          <button
            type="button"
            class="px-2 py-1 text-xs border border-border rounded hover:border-primary text-white"
            @click="suspendListing(String(row.id), String(row.title))"
          >
            Hide
          </button>
          <button
            type="button"
            class="px-2 py-1 text-xs border border-red-700 text-red-300 rounded"
            @click="removeListing(String(row.id), String(row.title))"
          >
            Remove
          </button>
          <button
            type="button"
            class="px-2 py-1 text-xs bg-red-900/60 border border-red-700 text-white rounded"
            @click="confirmCounterfeit(String(row.id))"
          >
            Counterfeit → freeze seller
          </button>
        </div>
      </div>
      <p v-if="!pending && !filteredListings.length" class="text-white/60 text-center py-6">
        No listings match this filter.
      </p>
    </div>
  </div>
</template>
