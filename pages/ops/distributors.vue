<template>
  <div class="ops-tool-page">
    <div class="container narrow">
      <header class="tool-head">
        <p class="eyebrow">Distributor engine</p>
        <h1>Distributor inventory sync</h1>
        <p class="text-muted">
          Run wholesale catalog ingestion, verify distributor connectivity, and log sync results for audit.
        </p>
      </header>

      <section class="card">
        <h2>Run sync</h2>
        <p class="text-muted small">
          The current engine records a structured sync run and is ready for REST API or SFTP/CSV adapters.
        </p>
        <label class="check-row">
          <input v-model="dryRun" type="checkbox" />
          Dry run only
        </label>
        <button type="button" class="btn btn-primary mt-1" :disabled="loading" @click="runSync">
          {{ loading ? 'Running...' : 'Run distributor sync' }}
        </button>
        <p v-if="message" class="status-msg" :class="{ error: !!errorMessage }">{{ message }}</p>
      </section>

      <section v-if="result" class="card">
        <h2>Last run</h2>
        <dl class="result-list">
          <div><dt>Distributor</dt><dd>{{ result.distributor }}</dd></div>
          <div><dt>Status</dt><dd>{{ result.status }}</dd></div>
          <div><dt>Products parsed</dt><dd>{{ result.productsParsed }}</dd></div>
          <div><dt>Inventory updates</dt><dd>{{ result.inventoryUpdates }}</dd></div>
          <div><dt>Connection</dt><dd>{{ result.connectionType }}</dd></div>
          <div><dt>Timestamp</dt><dd>{{ result.timestamp }}</dd></div>
        </dl>
      </section>

      <div class="actions">
        <NuxtLink to="/ops/panel" class="btn btn-outline">Back to operator console</NuxtLink>
        <NuxtLink to="/ops/status" class="btn btn-outline">Transaction readiness</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Distributor sync - The Franks Standard', robots: 'noindex, nofollow' })

const config = useRuntimeConfig()
const loading = ref(false)
const dryRun = ref(false)
const message = ref('')
const errorMessage = ref('')
const result = ref(null)

function functionsBase () {
  const url = String(config.public?.supabaseUrl || '').replace(/\/+$/, '')
  return `${url}/functions/v1`
}

async function runSync () {
  loading.value = true
  message.value = ''
  errorMessage.value = ''
  result.value = null
  const opsKey = window.prompt('Ops access key (same as toolkit unlock):')
  if (!opsKey) {
    loading.value = false
    return
  }
  try {
    const res = await fetch(`${functionsBase()}/distributor-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ops_key: opsKey, dry_run: dryRun.value }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) {
      throw new Error(data.detail || data.error || res.statusText)
    }
    result.value = data.data
    message.value = `Sync complete: ${data.data.productsParsed} parsed, ${data.data.inventoryUpdates} updates.`
  } catch (err) {
    errorMessage.value = err?.message || 'Distributor sync failed.'
    message.value = errorMessage.value
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ops-tool-page { padding: 2rem 0 3rem; }
.narrow { max-width: 840px; }
.tool-head { margin-bottom: 1.5rem; }
.card { margin-bottom: 1rem; padding: 1.25rem; }
.check-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; }
.mt-1 { margin-top: 1rem; }
.status-msg { margin-top: 0.75rem; color: var(--trust-green); font-weight: 700; }
.status-msg.error { color: var(--alert-red); }
.result-list { display: grid; gap: 0.6rem; }
.result-list div { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.45rem; }
.result-list dt { font-weight: 800; color: #111827; }
.result-list dd { margin: 0; color: #374151; text-align: right; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
</style>
