<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const rows = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const form = ref({
  title: '',
  productId: '',
  reservePrice: 0,
  minIncrement: 5,
  days: 7,
})

function opsErrorMessage (e, fallback) {
  const data = e?.data
  if (data && typeof data === 'object') return String(data.error || data.statusMessage || fallback)
  return String(e?.message || fallback)
}

async function load () {
  loading.value = true
  error.value = ''
  try {
    const data = await opsFetch('/api/ops/bc-auctions')
    rows.value = data?.rows || []
    if (data?.message) error.value = data.message
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not load auctions.')
  } finally {
    loading.value = false
  }
}

async function createAuction () {
  message.value = ''
  error.value = ''
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — tap the B&C logo 5× and unlock first.'
    return
  }
  if (!form.value.title.trim()) {
    error.value = 'Enter an auction title.'
    return
  }
  loading.value = true
  const endTime = new Date(Date.now() + Number(form.value.days || 7) * 24 * 60 * 60 * 1000)
  try {
    await opsFetch('/api/ops/bc-auctions', {
      method: 'POST',
      body: {
        title: form.value.title,
        productId: form.value.productId || form.value.title,
        reservePrice: Number(form.value.reservePrice || 0),
        minIncrement: Number(form.value.minIncrement || 1),
        endTime: endTime.toISOString(),
        status: 'active',
      },
    })
    message.value = 'Auction created.'
    form.value.title = ''
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not create auction.')
  } finally {
    loading.value = false
  }
}

async function closeAuction (row) {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  loading.value = true
  try {
    const data = await opsFetch('/api/ops/bc-auctions-close', {
      method: 'POST',
      body: { auctionId: row.id },
    })
    message.value = data?.winnerEmail
      ? `Closed — winner: ${data.winnerEmail}`
      : 'Auction closed (no winning bid).'
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Close failed.')
  } finally {
    loading.value = false
  }
}

async function runJobs () {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  loading.value = true
  try {
    const data = await opsFetch('/api/ops/bc-owner-jobs', { method: 'POST', body: {} })
    message.value = `Jobs ran — closed ${data?.auctions?.closed || 0} auctions, resolved ${data?.disputes?.resolved || 0} disputes.`
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Jobs failed.')
  } finally {
    loading.value = false
  }
}

function formatDate (v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

onMounted(load)
</script>

<template>
  <div>
    <p class="bc-muted">Competition auctions for rare gear. Ended auctions auto-close when you run background jobs.</p>
    <p v-if="error" class="bc-alert bc-alert--err">{{ error }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>

    <div class="bc-form-stack">
      <label>Title<input v-model="form.title" class="input" type="text" placeholder="e.g. Sundown SA-12 pair"></label>
      <label>Product ID (optional)<input v-model="form.productId" class="input" type="text"></label>
      <label>Reserve ($)<input v-model.number="form.reservePrice" class="input" type="number" min="0" step="1"></label>
      <label>Min bid step ($)<input v-model.number="form.minIncrement" class="input" type="number" min="1" step="1"></label>
      <label>Days until end<input v-model.number="form.days" class="input" type="number" min="1" max="30"></label>
      <button type="button" class="btn btn-primary btn-sm" :disabled="loading" @click="createAuction">Start auction</button>
    </div>

    <div class="bc-panel__actions">
      <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">Refresh</button>
      <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="runJobs">Run auto-close jobs</button>
    </div>

    <div v-if="rows.length" class="bc-table-wrap">
      <table class="bc-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Ends</th>
            <th>Reserve</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.title }}</td>
            <td><span class="bc-status">{{ row.status }}</span></td>
            <td class="bc-muted small">{{ formatDate(row.end_time) }}</td>
            <td>${{ Number(row.reserve_price || 0).toFixed(0) }}</td>
            <td>
              <button v-if="row.status === 'active'" type="button" class="btn btn-outline btn-sm" @click="closeAuction(row)">Close now</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="bc-muted">No auctions yet.</p>
  </div>
</template>

<style scoped>
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; max-width: 420px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-panel__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.bc-table-wrap { overflow-x: auto; margin-top: 14px; }
.bc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-table th, .bc-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-status { text-transform: capitalize; color: #ff5252; font-weight: 600; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
.bc-muted.small { font-size: 0.78rem; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
</style>
