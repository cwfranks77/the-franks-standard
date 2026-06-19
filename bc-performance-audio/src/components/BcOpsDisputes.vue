<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const rows = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const form = ref({
  orderId: '',
  buyerEmail: '',
  reason: 'non-shipment',
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
    const data = await opsFetch('/api/ops/bc-disputes')
    rows.value = data?.rows || []
    if (data?.message) error.value = data.message
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not load disputes.')
  } finally {
    loading.value = false
  }
}

async function openDispute () {
  message.value = ''
  error.value = ''
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — tap the B&C logo 5× and unlock first.'
    return
  }
  if (!form.value.orderId.trim()) {
    error.value = 'Enter an order ID.'
    return
  }
  loading.value = true
  try {
    await opsFetch('/api/ops/bc-disputes-open', { method: 'POST', body: { ...form.value } })
    message.value = 'Dispute opened.'
    form.value.orderId = ''
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not open dispute.')
  } finally {
    loading.value = false
  }
}

async function triage (row) {
  message.value = ''
  error.value = ''
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  loading.value = true
  try {
    const data = await opsFetch('/api/ops/bc-disputes-triage', {
      method: 'POST',
      body: { disputeId: row.id },
    })
    message.value = data?.autoRefund
      ? `Auto-refund applied (${data?.result?.decision}).`
      : `Triage: ${data?.result?.decision} — ${(data?.result?.reasons || []).join(', ')}`
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Triage failed.')
  } finally {
    loading.value = false
  }
}

async function resolveDispute (row) {
  message.value = ''
  error.value = ''
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  loading.value = true
  try {
    await opsFetch('/api/ops/bc-disputes-resolve', {
      method: 'POST',
      body: { disputeId: row.id, refundToBuyer: false, resolution: { by: 'owner', note: 'Resolved in console' } },
    })
    message.value = 'Dispute marked resolved.'
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Resolve failed.')
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
    <p class="bc-muted">Buyer protection disputes. AI triage runs rule-based checks unless you add an AI API key.</p>
    <p v-if="error" class="bc-alert bc-alert--err">{{ error }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>

    <div class="bc-form-stack">
      <label>Order ID<input v-model="form.orderId" class="input" type="text" placeholder="order uuid or id"></label>
      <label>Buyer email<input v-model="form.buyerEmail" class="input" type="email" placeholder="optional"></label>
      <label>Reason
        <select v-model="form.reason" class="input">
          <option value="non-shipment">Non-shipment</option>
          <option value="counterfeit">Counterfeit</option>
          <option value="damaged">Damaged in transit</option>
          <option value="not-as-described">Not as described</option>
        </select>
      </label>
      <button type="button" class="btn btn-primary btn-sm" :disabled="loading" @click="openDispute">Open dispute</button>
    </div>

    <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">
      {{ loading ? 'Loading…' : 'Refresh list' }}
    </button>

    <div v-if="rows.length" class="bc-table-wrap">
      <table class="bc-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Opened</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.order_id }}</td>
            <td>{{ row.reason }}</td>
            <td><span class="bc-status">{{ row.status }}</span></td>
            <td class="bc-muted small">{{ formatDate(row.opened_at) }}</td>
            <td class="bc-actions">
              <button v-if="row.status === 'open'" type="button" class="btn btn-outline btn-sm" @click="triage(row)">AI triage</button>
              <button v-if="row.status === 'open'" type="button" class="btn btn-outline btn-sm" @click="resolveDispute(row)">Resolve</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="bc-muted">No disputes yet.</p>
  </div>
</template>

<style scoped>
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; max-width: 420px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-table-wrap { overflow-x: auto; margin-top: 14px; }
.bc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-table th, .bc-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-status { text-transform: capitalize; color: #ff5252; font-weight: 600; }
.bc-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
.bc-muted.small { font-size: 0.78rem; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
</style>
