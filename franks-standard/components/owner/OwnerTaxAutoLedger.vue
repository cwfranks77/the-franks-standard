<script setup lang="ts">
const INCOME_TAX_RATE = 0.25
const LA_SALES_TAX_EST = 0.0975

const { transactions, pending, reload, source } = useOwnerOpsFeed()

const ledger = computed(() => {
  return (transactions.value || []).map((tx) => {
    const amount = Number(tx.amount || 0)
    const salesTax = Math.round(amount * LA_SALES_TAX_EST * 100) / 100
    const incomeReserve = Math.round(amount * INCOME_TAX_RATE * 100) / 100
    const netAfter = Math.round((amount - salesTax - incomeReserve) * 100) / 100
    return {
      ...tx,
      amount,
      salesTax,
      incomeReserve,
      netAfter,
    }
  })
})

const totals = computed(() => {
  const rows = ledger.value
  return {
    gross: rows.reduce((s, r) => s + r.amount, 0),
    tax: rows.reduce((s, r) => s + r.salesTax, 0),
    reserve: rows.reduce((s, r) => s + r.incomeReserve, 0),
  }
})

function money (n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Automatic transaction and tax reserve log — 25% Louisiana business income reserve and estimated sales tax
      (shipping destination zip; 9.75% placeholder for LA). Recorded from live orders when Supabase is connected.
    </p>
    <p class="text-xs text-white/55">Source: {{ source }}</p>
    <button type="button" class="text-xs text-primary hover:underline" @click="reload">Refresh</button>

    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="border border-border rounded p-2 bg-bg/50">
        <p class="text-xs text-white/55">Gross</p>
        <p class="text-white font-semibold">{{ money(totals.gross) }}</p>
      </div>
      <div class="border border-border rounded p-2 bg-bg/50">
        <p class="text-xs text-white/55">Sales tax (est.)</p>
        <p class="text-white font-semibold">{{ money(totals.tax) }}</p>
      </div>
      <div class="border border-border rounded p-2 bg-bg/50">
        <p class="text-xs text-white/55">25% income reserve</p>
        <p class="text-white font-semibold">{{ money(totals.reserve) }}</p>
      </div>
    </div>

    <p v-if="pending" class="text-white/60">Loading…</p>
    <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
      <li
        v-for="row in ledger"
        :key="String(row.id)"
        class="border border-border rounded px-3 py-2 bg-surface2/40 text-xs"
      >
        <p class="text-white">{{ money(row.amount) }} · {{ row.status }}</p>
        <p class="text-white/55">
          Tax {{ money(row.salesTax) }} · Reserve {{ money(row.incomeReserve) }} · Net {{ money(row.netAfter) }}
        </p>
        <p class="text-white/45">{{ new Date(String(row.created_at)).toLocaleString() }}</p>
      </li>
    </ul>
  </div>
</template>
