<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const rows = ref([])
const pending = ref(0)
const loading = ref(false)
const error = ref('')
const message = ref('')

function opsErrorMessage (e, fallback) {
  const data = e?.data
  if (data && typeof data === 'object') return String(data.error || data.statusMessage || fallback)
  return String(e?.message || fallback)
}

async function load () {
  loading.value = true
  error.value = ''
  try {
    const data = await opsFetch('/api/ops/bc-customer-accounts')
    rows.value = data?.rows || []
    pending.value = data?.pending || 0
    if (data?.message) error.value = data.message
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not load accounts.')
  } finally {
    loading.value = false
  }
}

async function setStatus (row, status) {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — tap the B&C logo 5× and unlock first.'
    return
  }
  loading.value = true
  message.value = ''
  try {
    await opsFetch('/api/ops/bc-customer-accounts', {
      method: 'POST',
      body: { profileId: row.id, status },
    })
    message.value = status === 'approved' ? `${row.email} approved — they can checkout now.` : `Account updated to ${status}.`
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Update failed.')
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
    <p class="bc-muted">
      <strong>{{ pending }}</strong> waiting for approval.
      Shoppers cannot checkout until you approve them here.
    </p>
    <p v-if="error" class="bc-alert bc-alert--err">{{ error }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>
    <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">
      {{ loading ? 'Loading…' : 'Refresh accounts' }}
    </button>

    <div v-if="rows.length" class="bc-table-wrap">
      <table class="bc-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Requested</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.full_name || '—' }}</td>
            <td>{{ row.email }}</td>
            <td><span class="bc-status">{{ row.status }}</span></td>
            <td class="bc-muted small">{{ formatDate(row.created_at) }}</td>
            <td class="bc-actions">
              <button v-if="row.status !== 'approved'" type="button" class="btn btn-primary btn-sm" @click="setStatus(row, 'approved')">Approve</button>
              <button v-if="row.status !== 'blocked'" type="button" class="btn btn-outline btn-sm" @click="setStatus(row, 'blocked')">Block</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="bc-muted">No customer accounts yet.</p>
  </div>
</template>

<style scoped>
.bc-muted { color: #7a8190; font-size: 0.88rem; margin-bottom: 10px; }
.bc-muted.small { font-size: 0.78rem; }
.bc-table-wrap { overflow-x: auto; margin-top: 14px; }
.bc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-table th, .bc-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-status { text-transform: capitalize; color: #ff5252; font-weight: 600; }
.bc-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
</style>
