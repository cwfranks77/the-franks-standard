<script setup lang="ts">
import { loadLocalActivity, type ActivityEvent } from '~/utils/platformActivity'

const infractions = ref<ActivityEvent[]>([])
const errors = ref<{ message: string; at: string }[]>([])
const autoFixLog = ref<string[]>([])

function reload () {
  const all = loadLocalActivity()
  infractions.value = all.filter((e) =>
    e.action_category === 'infraction'
    || e.action.includes('blocked')
    || e.action.includes('Counterfeit'),
  )
  try {
    errors.value = JSON.parse(localStorage.getItem('tfs-site-errors-v1') || '[]')
  } catch {
    errors.value = []
  }
  try {
    autoFixLog.value = JSON.parse(localStorage.getItem('tfs-auto-fix-log-v1') || '[]')
  } catch {
    autoFixLog.value = []
  }
}

async function runAutoRemediation () {
  const { callOps } = useIntegrityOps()
  const data = await callOps('scan_all', { limit: 500 })
  const results = (data?.results as { integrity_status?: string }[]) || []
  const flagged = results.filter((r) => r.integrity_status === 'review').length
  const line = data?.ok
    ? `[${new Date().toLocaleString()}] Auto-scan: ${data.scanned ?? results.length} scanned, ${flagged} in review`
    : `[${new Date().toLocaleString()}] Auto-scan skipped — ops backend unavailable`
  const log = [...autoFixLog.value, line].slice(-50)
  localStorage.setItem('tfs-auto-fix-log-v1', JSON.stringify(log))
  autoFixLog.value = log
}

function clearStaleErrors () {
  if (!import.meta.client) return
  localStorage.removeItem('tfs-site-errors-v1')
  errors.value = []
  reload()
}

onMounted(reload)
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Site-wide monitor: errors, policy infractions, and automated remediation (suspend blocked listings when backend is connected).
      Operator notifications appear here and in Site Activity Monitor.
    </p>
    <div class="flex flex-wrap gap-3">
      <button type="button" class="text-xs text-primary hover:underline" @click="reload">Refresh</button>
      <button
        type="button"
        class="text-xs px-3 py-1 border border-border rounded text-white hover:border-primary"
        @click="runAutoRemediation"
      >
        Run auto-fix scan now
      </button>
      <button
        type="button"
        class="text-xs px-3 py-1 border border-amber-700/50 rounded text-amber-200 hover:border-amber-500"
        @click="clearStaleErrors"
      >
        Clear old browser errors
      </button>
    </div>

    <section class="border border-border rounded-lg p-4 bg-bg/40">
      <h3 class="font-semibold text-white mb-2">Policy infractions</h3>
      <ul class="space-y-2 max-h-40 overflow-y-auto text-xs text-white/80">
        <li v-for="row in infractions" :key="row.id">
          {{ row.action }} — {{ new Date(row.created_at).toLocaleString() }}
        </li>
        <li v-if="!infractions.length" class="text-white/55">No infractions logged on this device yet.</li>
      </ul>
    </section>

    <section class="border border-border rounded-lg p-4 bg-bg/40">
      <h3 class="font-semibold text-white mb-2">JavaScript errors (this browser)</h3>
      <ul class="space-y-1 max-h-32 overflow-y-auto text-xs text-red-300 font-mono">
        <li v-for="(e, i) in errors" :key="i">{{ e.at }}: {{ e.message }}</li>
        <li v-if="!errors.length" class="text-white/55">No errors captured.</li>
      </ul>
    </section>

    <section class="border border-border rounded-lg p-4 bg-bg/40">
      <h3 class="font-semibold text-white mb-2">Auto-fix log</h3>
      <ul class="space-y-1 max-h-32 overflow-y-auto text-xs text-white/75 font-mono">
        <li v-for="(line, i) in autoFixLog" :key="i">{{ line }}</li>
        <li v-if="!autoFixLog.length" class="text-white/55">No automated actions yet.</li>
      </ul>
    </section>
  </div>
</template>
