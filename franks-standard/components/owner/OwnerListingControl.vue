<script setup lang="ts">
import { appendLocalActivity } from '~/utils/platformActivity'

const config = useRuntimeConfig()
const pending = ref(false)
const loadError = ref('')
const listings = ref<Record<string, unknown>[]>([])
const actionMsg = ref('')

const { busy, lastError, callOps } = useIntegrityOps()

const filter = ref('published')

async function loadListings () {
  pending.value = true
  loadError.value = ''
  const base = String(config.public.supabaseUrl || '').replace(/\/$/, '')
  const key = String(config.public.supabaseKey || '')
  if (!base || !key) {
    loadError.value = 'Supabase not configured — connect database for live listing control.'
    pending.value = false
    return
  }
  try {
    const params = new URLSearchParams({
      select: 'id,title,category,status,integrity_status,price,created_at,seller_id,coa_serial_number',
      order: 'created_at.desc',
      limit: '80',
    })
    if (filter.value !== 'all') params.set('status', `eq.${filter.value}`)
    const res = await fetch(`${base}/rest/v1/listings?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!res.ok) throw new Error('Could not load listings')
    listings.value = await res.json()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Load failed'
    listings.value = []
  } finally {
    pending.value = false
  }
}

async function removeListing (id: string, title: string) {
  if (!confirm(`Remove listing "${title}" from the marketplace?`)) return
  const data = await callOps('delete_listing', { listing_id: id })
  if (data?.ok) {
    actionMsg.value = `Removed listing ${id.slice(0, 8)}…`
    appendLocalActivity({
      user_id: 'operator',
      user_display_name: 'Operator',
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: `Removed listing ${id}`,
      action_category: 'owner',
      metadata: { listing_id: id },
    })
    await loadListings()
  }
}

async function suspendListing (id: string) {
  const data = await callOps('suspend_listing', { listing_id: id })
  if (data?.ok) {
    actionMsg.value = `Suspended listing ${id.slice(0, 8)}…`
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
    appendLocalActivity({
      user_id: 'operator',
      user_display_name: 'Operator',
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: `Counterfeit confirmed — auto freeze ${id}`,
      action_category: 'infraction',
      metadata: { listing_id: id },
    })
    await loadListings()
  }
}

async function runScanAll () {
  const data = await callOps('scan_all', { limit: 200 })
  if (data?.ok) actionMsg.value = `Scanned ${data.scanned ?? 'all'} listings for integrity flags.`
  await loadListings()
}

onMounted(loadListings)
watch(filter, loadListings)
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Remove or suspend listings. Counterfeit collectibles/antiques trigger automatic seller account freeze pending review.
    </p>

    <div class="flex flex-wrap gap-2 items-center">
      <select v-model="filter" class="bg-bg border border-border rounded px-2 py-1 text-white text-xs">
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
        <option value="all">All (latest 80)</option>
      </select>
      <button type="button" class="text-xs text-primary hover:underline" @click="loadListings">Refresh</button>
      <button
        type="button"
        class="text-xs px-3 py-1 border border-border rounded hover:border-primary text-white"
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

    <div class="max-h-[28rem] overflow-y-auto space-y-2">
      <div
        v-for="row in listings"
        :key="String(row.id)"
        class="border border-border rounded p-3 bg-bg/50"
      >
        <p class="text-white font-medium">{{ row.title }}</p>
        <p class="text-xs text-white/55">
          {{ row.category }} · {{ row.status }} · integrity: {{ row.integrity_status || 'clear' }}
        </p>
        <p class="text-xs text-white/45 font-mono">{{ row.id }}</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            class="px-2 py-1 text-xs border border-border rounded hover:border-primary text-white"
            @click="suspendListing(String(row.id))"
          >
            Suspend
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
      <p v-if="!pending && !listings.length" class="text-white/60 text-center py-6">No listings in this filter.</p>
    </div>
  </div>
</template>
