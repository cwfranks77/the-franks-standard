<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const loading = ref(false)
const error = ref('')
const feed = ref({ audit: [], orders: [], profiles: [], dropship: [] })

function opsErrorMessage (e, fallback) {
  const data = e?.data
  if (data && typeof data === 'object') return String(data.error || data.statusMessage || fallback)
  return String(e?.message || fallback)
}

function formatDate (v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

function money (cents) {
  const n = Number(cents)
  if (!Number.isFinite(n)) return '—'
  return `$${(n / 100).toFixed(2)}`
}

async function load () {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — tap the B&C logo 5× and unlock first.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await opsFetch('/api/ops/bc-activity')
    feed.value = {
      audit: data?.audit || [],
      orders: data?.orders || [],
      profiles: data?.profiles || [],
      dropship: data?.dropship || [],
    }
    if (data?.message) error.value = data.message
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not load activity.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <p class="bc-muted">Whole-site activity: new accounts, orders, dropship updates, and owner actions.</p>
    <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">
      {{ loading ? 'Loading…' : 'Refresh activity' }}
    </button>
    <p v-if="error" class="bc-alert bc-alert--err">{{ error }}</p>

    <h3 class="bc-h3">Recent orders</h3>
    <ul v-if="feed.orders.length" class="bc-list">
      <li v-for="row in feed.orders" :key="row.id">{{ formatDate(row.created_at) }} — {{ row.buyer_email || row.id }} — {{ money(row.total_cents) }} ({{ row.status }})</li>
    </ul>
    <p v-else class="bc-muted">No orders in database yet.</p>

    <h3 class="bc-h3">Customer signups</h3>
    <ul v-if="feed.profiles.length" class="bc-list">
      <li v-for="row in feed.profiles" :key="row.id">{{ formatDate(row.created_at) }} — {{ row.email }} — {{ row.status }}</li>
    </ul>
    <p v-else class="bc-muted">No customer accounts yet.</p>

    <h3 class="bc-h3">Dropship queue</h3>
    <ul v-if="feed.dropship.length" class="bc-list">
      <li v-for="row in feed.dropship" :key="row.id">{{ formatDate(row.updated_at) }} — {{ row.order_id }} — {{ row.provider_status }}</li>
    </ul>
    <p v-else class="bc-muted">No dropship rows yet.</p>

    <h3 class="bc-h3">Owner audit log</h3>
    <ul v-if="feed.audit.length" class="bc-list">
      <li v-for="row in feed.audit" :key="row.id">{{ formatDate(row.created_at) }} — {{ row.action }} ({{ row.target_type || '—' }})</li>
    </ul>
    <p v-else class="bc-muted">No audit entries yet.</p>
  </div>
</template>

<style scoped>
.bc-muted { color: #7a8190; font-size: 0.88rem; margin: 10px 0; }
.bc-h3 { font-size: 0.92rem; color: #ff8a80; margin: 1rem 0 6px; }
.bc-list { margin: 0 0 12px; padding-left: 1.1rem; color: #b8bcc6; font-size: 0.85rem; line-height: 1.55; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
</style>
