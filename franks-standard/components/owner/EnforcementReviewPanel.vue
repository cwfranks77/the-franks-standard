<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'
import { getSupabaseFunctionsBase } from '~/utils/publicSupabase'

const props = defineProps({
  queue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['updated'])

const config = useRuntimeConfig()
const { busy, lastError, callOps } = useIntegrityOps()

const liveQueue = ref([])
const selectedId = ref('')
const actionNote = ref('')
const loadError = ref('')

const displayQueue = computed(() =>
  liveQueue.value.length ? liveQueue.value : props.queue,
)

const selectedCase = computed(() =>
  displayQueue.value.find((row) => row.id === selectedId.value) || null,
)

async function loadQueue () {
  loadError.value = ''
  const data = await callOps('list_queue')
  if (!data?.ok) {
    loadError.value = lastError.value || 'Could not load enforcement queue.'
    return
  }

  const rows = []
  for (const report of (data.reports || [])) {
    rows.push({
      id: `R-${String(report.id).slice(0, 8)}`,
      reportId: report.id,
      listingId: report.listing_id,
      issue: report.reason || report.details || 'Authenticity report',
      status: report.status === 'under_review' ? 'freeze' : 'open',
      sellerId: null,
    })
  }
  for (const listing of (data.flagged || [])) {
    rows.push({
      id: `L-${String(listing.id).slice(0, 8)}`,
      reportId: null,
      listingId: listing.id,
      sellerId: listing.seller_id,
      issue: `${listing.title} — integrity: ${listing.integrity_status}`,
      status: listing.integrity_status === 'counterfeit_confirmed' ? 'freeze' : 'open',
    })
  }
  liveQueue.value = rows
  emit('updated', rows)
}

function selectCase (id) {
  selectedId.value = id
  actionNote.value = ''
}

async function callSafety (action, payload = {}) {
  const base = getSupabaseFunctionsBase(config)
  const opsKey = getStoredOpsPhrase()
  if (!base || !opsKey) {
    actionNote.value = 'Operator phrase or Supabase missing — unlock console again.'
    return null
  }
  const res = await fetch(`${base}/ops-safety-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ops_key: opsKey, ...payload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    actionNote.value = String(data.error || res.statusText)
    return null
  }
  return data
}

async function runAction (action) {
  if (!selectedCase.value || busy.value) return
  const row = selectedCase.value

  if (action === 'freeze') {
    if (row.listingId) {
      const data = await callOps('hold_seller_for_review', {
        listing_id: row.listingId,
        report_id: row.reportId,
        notes: 'Operator freeze from violations terminal',
      })
      if (data?.ok) {
        actionNote.value = 'Seller frozen for review — listings archived.'
        await loadQueue()
      } else {
        actionNote.value = lastError.value || 'Freeze failed.'
      }
      return
    }
    if (row.sellerId) {
      const data = await callSafety('freeze_account', {
        user_id: row.sellerId,
        reason: 'Violations terminal — operator freeze',
      })
      if (data?.ok) {
        actionNote.value = `Account frozen — ${row.id}`
        await loadQueue()
      }
    }
    return
  }

  if (action === 'refund' && row.listingId) {
    const data = await callOps('suspend_listing', { listing_id: row.listingId })
    actionNote.value = data?.ok
      ? `Listing suspended pending refund — ${row.id}`
      : (lastError.value || 'Suspend failed.')
    if (data?.ok) await loadQueue()
    return
  }

  if (action === 'dismiss' && row.reportId) {
    actionNote.value = `Report ${row.id} marked for manual dismiss in Supabase.`
    return
  }

  if (action === 'reviewed') {
    actionNote.value = `Marked reviewed — ${row.id} (${new Date().toLocaleString()})`
    await loadQueue()
  }
}

onMounted(loadQueue)
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Live queue from Supabase authenticity reports and flagged listings. Select a case to freeze seller or suspend listing.
    </p>

    <div class="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        class="text-xs px-3 py-1 border border-border rounded hover:border-primary text-white"
        :disabled="busy"
        @click="loadQueue"
      >
        Refresh queue
      </button>
      <p v-if="loadError" class="text-xs text-amber-400">{{ loadError }}</p>
      <p v-if="lastError" class="text-xs text-red-400">{{ lastError }}</p>
    </div>

    <ul class="space-y-2" role="listbox" aria-label="Refund and counterfeit review queue">
      <li
        v-for="row in displayQueue"
        :key="row.id"
      >
        <button
          type="button"
          role="option"
          :aria-selected="selectedId === row.id"
          class="w-full text-left flex flex-wrap justify-between gap-2 rounded px-3 py-2 border transition cursor-pointer"
          :class="selectedId === row.id
            ? 'bg-primary/20 border-primary text-white'
            : 'bg-bg border-border text-white/90 hover:border-primary hover:bg-surface'"
          @click="selectCase(row.id)"
        >
          <span>{{ row.id }} — {{ row.issue }}</span>
          <span
            class="uppercase text-xs font-semibold"
            :class="row.status === 'freeze' ? 'text-danger' : 'text-secondary'"
          >
            {{ row.status }}
          </span>
        </button>
      </li>
    </ul>

    <p v-if="!displayQueue.length" class="text-white/60 text-xs text-center py-4">
      No open cases — queue is clear.
    </p>

    <div
      v-if="selectedCase"
      class="rounded-lg border border-border bg-bg p-4 space-y-3"
    >
      <h3 class="text-base font-semibold text-white">
        Reviewing {{ selectedCase.id }}
      </h3>
      <p class="text-white/85">{{ selectedCase.issue }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-secondary/50 text-secondary hover:bg-secondary/10 cursor-pointer"
          :disabled="busy"
          @click="runAction('refund')"
        >
          Suspend listing
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
          :disabled="busy"
          @click="runAction('freeze')"
        >
          Freeze seller account
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-border text-white/90 hover:border-primary cursor-pointer"
          :disabled="busy"
          @click="runAction('reviewed')"
        >
          Mark reviewed
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-border text-white/70 hover:border-primary cursor-pointer"
          :disabled="busy"
          @click="runAction('dismiss')"
        >
          Dismiss report
        </button>
      </div>
      <p v-if="actionNote" class="text-xs text-primary">{{ actionNote }}</p>
    </div>

    <p v-else-if="displayQueue.length" class="text-white/60 text-xs">
      Tap a case above to open review actions.
    </p>
  </div>
</template>
