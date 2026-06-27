<script setup lang="ts">
const { pending, transactions, reload, source } = useOwnerOpsFeed()

function money (n: number) {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      All financial transactions on the platform — sales, escrow holds, refunds, and tax reserves.
      Buyer/seller emails are never shown here.
    </p>
    <div class="flex justify-between items-center">
      <span class="text-xs text-white/50">Source: {{ source }}</span>
      <button type="button" class="text-xs text-primary hover:underline" @click="reload">Refresh</button>
    </div>
    <p v-if="pending" class="text-white/60">Loading transactions…</p>
    <ul v-else class="space-y-2 max-h-[28rem] overflow-y-auto">
      <li
        v-for="tx in transactions"
        :key="tx.id"
        class="flex flex-wrap justify-between gap-2 bg-bg border border-border rounded px-3 py-2"
      >
        <span>
          <span class="text-primary uppercase text-xs">{{ tx.status }}</span>
          · Order {{ String(tx.id).slice(0, 8) }}…
        </span>
        <span class="text-white/70">
          {{ money(tx.amount) }} · {{ new Date(tx.created_at).toLocaleDateString() }}
        </span>
      </li>
      <li v-if="!transactions.length" class="text-white/60 text-center py-4">
        No transactions loaded. Connect Supabase ops feed for live orders.
      </li>
    </ul>
  </div>
</template>
