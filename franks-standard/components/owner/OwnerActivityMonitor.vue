<script setup>
const { pending, loadError, source, activity, reload } = useOwnerOpsFeed()

const filter = ref('all')
const categories = [
  { id: 'all', label: 'All' },
  { id: 'auth', label: 'Sign-in' },
  { id: 'transaction', label: 'Transactions' },
  { id: 'message', label: 'Messages' },
  { id: 'sell', label: 'Selling' },
  { id: 'owner', label: 'Operator' },
]

const filtered = computed(() => {
  const rows = activity.value || []
  if (filter.value === 'all') return rows
  return rows.filter((r) => r.action_category === filter.value)
})

const signedInOnly = computed(() => filtered.value.filter((r) => r.user_id))

</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Activity from <strong>signed-in account holders</strong> includes display name and IP.
      Anonymous page views are not named. Source: <span class="text-primary">{{ source }}</span>.
    </p>
    <p v-if="loadError" class="text-xs text-amber-400">{{ loadError }}</p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="c in categories"
        :key="c.id"
        type="button"
        class="px-3 py-1 rounded-full border text-xs"
        :class="filter === c.id ? 'border-primary text-primary bg-primary/10' : 'border-border text-white/70'"
        @click="filter = c.id"
      >
        {{ c.label }}
      </button>
      <button type="button" class="ml-auto text-xs text-primary hover:underline" @click="reload">
        Refresh
      </button>
    </div>

    <p v-if="pending" class="text-white/60">Loading activity…</p>

    <div v-else class="max-h-[28rem] overflow-y-auto space-y-2 border border-border rounded-lg p-2 bg-bg/50">
      <p v-if="!signedInOnly.length" class="text-white/60 p-3 text-center">
        No signed-in activity in this filter yet.
      </p>
      <div
        v-for="row in signedInOnly"
        :key="row.id"
        class="border border-border rounded px-3 py-2 bg-surface2/50"
      >
        <div class="flex flex-wrap justify-between gap-2 mb-1">
          <span class="font-medium text-white">
            {{ row.user_display_name || 'Account holder' }}
          </span>
          <span class="text-xs text-white/50">{{ new Date(row.created_at).toLocaleString() }}</span>
        </div>
        <p class="text-white/85">{{ row.action }}</p>
        <p class="text-xs text-white/55 mt-1">
          <span class="uppercase text-primary">{{ row.action_category }}</span>
          · IP {{ row.ip_address || '—' }}
          <template v-if="row.user_id"> · ID {{ String(row.user_id).slice(0, 8) }}…</template>
        </p>
      </div>
    </div>
  </div>
</template>
