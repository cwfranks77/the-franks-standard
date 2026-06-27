<script setup lang="ts">
const { busy, lastError, callTriageOps } = useDisputeTriageOps()

const disputes = ref<Record<string, unknown>[]>([])
const auditLogs = ref<Record<string, unknown>[]>([])
const lastResult = ref('')
const selectedDisputeId = ref('')

function shortId (id: unknown) {
  const s = String(id || '')
  return s.length > 14 ? `${s.slice(0, 8)}…` : s
}

function decisionLabel (d: unknown) {
  const v = String(d || '—')
  if (v === 'auto_refund') return 'Auto refund'
  if (v === 'hold_for_review') return 'Hold for review'
  if (v === 'deny') return 'Deny'
  return v
}

function decisionClass (d: unknown) {
  const v = String(d || '')
  if (v === 'auto_refund') return 'bg-emerald-900/50 text-emerald-200 border-emerald-700'
  if (v === 'deny') return 'bg-red-900/40 text-red-200 border-red-800'
  return 'bg-amber-900/40 text-amber-100 border-amber-700'
}

async function loadOpen () {
  lastResult.value = ''
  const data = await callTriageOps('list_open', { limit: 30 })
  if (data?.disputes) disputes.value = data.disputes as Record<string, unknown>[]
}

async function loadAudit () {
  const data = await callTriageOps('list_audit', { limit: 40 })
  if (data?.logs) auditLogs.value = data.logs as Record<string, unknown>[]
}

async function triageOne (disputeId: string, executeAuto = true) {
  lastResult.value = ''
  selectedDisputeId.value = disputeId
  const data = await callTriageOps('triage', { dispute_id: disputeId, execute_auto: executeAuto })
  if (data?.results) {
    lastResult.value = JSON.stringify(data.results, null, 2)
    await loadOpen()
    await loadAudit()
  }
}

async function sweepAll () {
  if (!confirm('Run AI triage on open disputes? Orders under the auto-refund cap may be refunded automatically.')) return
  lastResult.value = ''
  const data = await callTriageOps('sweep', { limit: 15, execute_auto: true })
  if (data?.results) {
    lastResult.value = `Processed ${data.processed} dispute(s).`
    await loadOpen()
    await loadAudit()
  }
}

onMounted(() => {
  loadOpen()
  loadAudit()
})
</script>

<template>
  <div class="space-y-6 text-sm text-stone-200">
    <p class="text-stone-400 leading-relaxed">
      AI reviews open buyer disputes and recommends <strong class="text-stone-200">auto refund</strong>,
      <strong class="text-stone-200">hold for review</strong>, or <strong class="text-stone-200">deny</strong>.
      When auto-refund is enabled and the order total is under your cap, Stripe refunds run automatically.
      Every decision is saved to the audit log.
    </p>

    <div v-if="lastError" class="rounded border border-red-800 bg-red-950/40 px-3 py-2 text-red-200">
      {{ lastError }}
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded bg-amber-700 px-3 py-1.5 text-white hover:bg-amber-600 disabled:opacity-50"
        :disabled="busy"
        @click="loadOpen"
      >
        Refresh disputes
      </button>
      <button
        type="button"
        class="rounded bg-emerald-800 px-3 py-1.5 text-white hover:bg-emerald-700 disabled:opacity-50"
        :disabled="busy"
        @click="sweepAll"
      >
        Sweep &amp; auto-resolve
      </button>
      <button
        type="button"
        class="rounded border border-stone-600 px-3 py-1.5 hover:bg-stone-800 disabled:opacity-50"
        :disabled="busy"
        @click="loadAudit"
      >
        Refresh audit log
      </button>
    </div>

    <section>
      <h3 class="mb-2 font-semibold text-amber-100">
        Open disputes ({{ disputes.length }})
      </h3>
      <div v-if="!disputes.length" class="rounded border border-stone-700 bg-stone-900/50 px-3 py-4 text-stone-400">
        No open disputes right now.
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="d in disputes"
          :key="String(d.id)"
          class="flex flex-wrap items-center justify-between gap-2 rounded border border-stone-700 bg-stone-900/60 px-3 py-2"
        >
          <div class="min-w-0 flex-1">
            <div class="font-mono text-xs text-stone-400">
              {{ shortId(d.id) }} · order {{ shortId(d.order_id) }}
            </div>
            <div class="mt-0.5">
              <span class="text-stone-200">{{ d.reason }}</span>
              <span
                v-if="d.ai_decision"
                class="ml-2 inline-block rounded border px-1.5 py-0.5 text-xs"
                :class="decisionClass(d.ai_decision)"
              >
                {{ decisionLabel(d.ai_decision) }}
              </span>
            </div>
          </div>
          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded bg-stone-700 px-2 py-1 text-xs hover:bg-stone-600 disabled:opacity-50"
              :disabled="busy"
              @click="triageOne(String(d.id), false)"
            >
              Triage only
            </button>
            <button
              type="button"
              class="rounded bg-amber-800 px-2 py-1 text-xs text-white hover:bg-amber-700 disabled:opacity-50"
              :disabled="busy"
              @click="triageOne(String(d.id), true)"
            >
              Triage + refund
            </button>
          </div>
        </li>
      </ul>
    </section>

    <section v-if="lastResult">
      <h3 class="mb-2 font-semibold text-amber-100">
        Last run
      </h3>
      <pre class="max-h-48 overflow-auto rounded border border-stone-700 bg-black/40 p-3 text-xs text-stone-300">{{ lastResult }}</pre>
    </section>

    <section>
      <h3 class="mb-2 font-semibold text-amber-100">
        Recent audit entries
      </h3>
      <ul v-if="auditLogs.length" class="max-h-56 space-y-1 overflow-auto text-xs">
        <li
          v-for="log in auditLogs"
          :key="String(log.id)"
          class="rounded border border-stone-800 bg-stone-950/50 px-2 py-1.5"
        >
          <span class="text-stone-500">{{ log.created_at }}</span>
          <span class="mx-1 text-amber-600">·</span>
          <span class="text-stone-300">{{ log.actor_type }}</span>
          <span class="mx-1">→</span>
          <span class="text-stone-200">{{ log.action }}</span>
          <span v-if="log.target_id" class="text-stone-500"> ({{ shortId(log.target_id) }})</span>
        </li>
      </ul>
      <p v-else class="text-stone-500">
        No audit entries yet.
      </p>
    </section>
  </div>
</template>
