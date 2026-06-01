<template>
  <div class="incidents">
    <div class="container">
      <header class="head">
        <div>
          <p class="eyebrow">Ops monitoring</p>
          <h1>Incidents</h1>
          <p class="text-muted">
            Client errors, health-check failures, and edge issues land here. Critical/high incidents ping your phone when
            <code>OPS_NOTIFY_ENABLED=true</code>.
          </p>
        </div>
        <div class="head-actions">
          <NuxtLink to="/ops/panel" class="btn btn-outline btn-sm">← Panel</NuxtLink>
          <button type="button" class="btn btn-outline btn-sm" :disabled="busy" @click="refresh">
            {{ busy ? 'Loading…' : 'Refresh' }}
          </button>
          <button type="button" class="btn btn-primary btn-sm" :disabled="busy" @click="fireTest">
            Test phone alert
          </button>
        </div>
      </header>

      <p v-if="lastError" class="alert alert-error">{{ lastError }}</p>
      <p v-if="testResult" class="alert alert-ok">{{ testResult }}</p>

      <section v-if="!incidents.length && !busy" class="empty card">
        <p>No incidents yet. Run <code>npm run ops:notify:test</code> or trigger a test from here.</p>
      </section>

      <section v-for="row in incidents" :key="row.id" class="card incident">
        <div class="incident-top">
          <span class="badge" :class="'sev-' + row.severity">{{ row.severity }}</span>
          <span class="badge status">{{ row.status }}</span>
          <span class="source">{{ row.source }}</span>
          <time>{{ formatWhen(row.created_at) }}</time>
        </div>
        <p class="message">{{ row.message }}</p>
        <p v-if="row.url" class="meta"><strong>URL:</strong> {{ row.url }}</p>
        <p v-if="row.root_cause" class="meta"><strong>Cause:</strong> {{ row.root_cause }}</p>
        <p v-if="row.fix_summary" class="meta"><strong>Fix:</strong> {{ row.fix_summary }}</p>
        <p v-if="row.resolved_at" class="meta"><strong>Resolved:</strong> {{ formatWhen(row.resolved_at) }}</p>
        <details v-if="row.stack" class="stack">
          <summary>Stack trace</summary>
          <pre>{{ row.stack }}</pre>
        </details>
        <div class="actions">
          <button
            v-if="row.status !== 'triaging'"
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="busy"
            @click="setStatus(row.id, 'triaging')"
          >
            Triaging
          </button>
          <button
            v-if="row.status !== 'fixing'"
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="busy"
            @click="setStatus(row.id, 'fixing')"
          >
            Fixing
          </button>
          <button
            v-if="row.status !== 'resolved'"
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="busy"
            @click="resolve(row)"
          >
            Mark resolved
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'ops-auth' })

const { busy, lastError, incidents, loadIncidents, updateStatus, testNotify } = useOpsIncidents()
const testResult = ref('')

function formatWhen (iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

async function refresh () {
  testResult.value = ''
  await loadIncidents()
}

async function fireTest () {
  testResult.value = ''
  const data = await testNotify('new')
  if (data?.notify) {
    const n = data.notify
    testResult.value = `Test sent via: ${(n.sent || []).join(', ') || 'none'}. ${(n.warnings || []).join(' ')}`
  }
}

async function setStatus (id: string, status: string) {
  await updateStatus(id, status)
  await refresh()
}

async function resolve (row: { id: string; root_cause?: string | null }) {
  const fix = window.prompt('Fix summary (shown in phone alert):', row.root_cause || 'Issue corrected')
  if (fix === null) return
  const cause = window.prompt('Root cause (optional):', row.root_cause || '') ?? undefined
  await updateStatus(row.id, 'resolved', {
    fix_summary: fix,
    root_cause: cause || undefined,
  })
  await refresh()
}

onMounted(() => {
  refresh()
})

useSeoMeta({
  title: 'Ops incidents — The Franks Standard',
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.incidents { padding: 2rem 0 4rem; }
.head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.head-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-start; }
.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: #94a3b8; margin: 0 0 0.25rem; }
.card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.incident-top { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem; font-size: 0.85rem; }
.badge { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; text-transform: uppercase; }
.sev-critical, .sev-high { background: #7f1d1d; color: #fecaca; }
.sev-medium { background: #78350f; color: #fde68a; }
.sev-low, .sev-info { background: #1e3a5f; color: #bfdbfe; }
.status { background: #334155; color: #e2e8f0; }
.source { color: #94a3b8; }
.message { margin: 0 0 0.5rem; font-weight: 500; }
.meta { margin: 0.25rem 0; font-size: 0.88rem; color: #cbd5e1; word-break: break-word; }
.stack pre { white-space: pre-wrap; font-size: 0.75rem; max-height: 200px; overflow: auto; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
.alert-error { background: rgba(127,29,29,0.35); border: 1px solid #991b1b; }
.alert-ok { background: rgba(20,83,45,0.35); border: 1px solid #166534; }
.empty p { margin: 0; color: #94a3b8; }
</style>
