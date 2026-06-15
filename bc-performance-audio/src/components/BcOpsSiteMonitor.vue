<script setup>
import { getPublicSupabaseUrl } from '~/utils/publicSupabase.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const config = useRuntimeConfig()
const loading = ref(false)
const loadError = ref('')
const incidents = ref([])

async function load () {
  loading.value = true
  loadError.value = ''
  incidents.value = []
  const opsKey = getStoredOpsPhrase()
  if (!opsKey) {
    loadError.value = 'Owner password needed — tap the B&C logo 5× and unlock first.'
    loading.value = false
    return
  }
  const base = getPublicSupabaseUrl(config)
  if (!base) {
    loadError.value = 'Supabase URL not configured on this deploy.'
    loading.value = false
    return
  }
  try {
    const res = await fetch(`${base}/functions/v1/ops-incident-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', ops_key: opsKey, limit: 80 }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      loadError.value = data.error || res.statusText || 'Could not load site errors.'
      return
    }
    incidents.value = data.incidents || []
  } catch (e) {
    loadError.value = e?.message || 'Could not load site errors.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="bc-monitor">
    <p class="bc-monitor__note">
      Visitor errors and checkout failures captured from the live storefront (ops-error-capture plugin).
    </p>
    <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">
      {{ loading ? 'Loading…' : 'Refresh traffic & errors' }}
    </button>
    <p v-if="loadError" class="bc-alert bc-alert--err">{{ loadError }}</p>
    <p v-if="!loading && !loadError && !incidents.length" class="bc-muted">No incidents recorded yet.</p>
    <div v-if="incidents.length" class="bc-monitor__table-wrap">
      <table class="bc-monitor__table">
        <thead>
          <tr>
            <th>When</th>
            <th>Status</th>
            <th>Message</th>
            <th>Page</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in incidents" :key="row.id">
            <td class="bc-muted small">{{ row.created_at ? new Date(row.created_at).toLocaleString() : '—' }}</td>
            <td>{{ row.status || 'open' }}</td>
            <td>{{ row.title || row.message || '—' }}</td>
            <td class="bc-muted small">{{ row.url || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bc-monitor__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 12px; line-height: 1.5; }
.bc-monitor__table-wrap { overflow-x: auto; margin-top: 12px; }
.bc-monitor__table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-monitor__table th, .bc-monitor__table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; vertical-align: top; }
.bc-monitor__table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
.bc-muted.small { font-size: 0.78rem; }
</style>
