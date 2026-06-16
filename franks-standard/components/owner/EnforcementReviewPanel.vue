<script setup>
const props = defineProps({
  queue: {
    type: Array,
    default: () => [],
  },
})

const selectedId = ref('')
const actionNote = ref('')

const selectedCase = computed(() =>
  props.queue.find((row) => row.id === selectedId.value) || null,
)

function selectCase (id) {
  selectedId.value = id
  actionNote.value = ''
}

function runAction (action) {
  if (!selectedCase.value) return
  const label = {
    refund: 'Forced refund approved',
    dismiss: 'Report dismissed',
    freeze: 'Seller account frozen',
    reviewed: 'Marked reviewed',
  }[action]
  actionNote.value = `${label} — ${selectedCase.value.id} (${new Date().toLocaleString()})`
}
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">
      Select a case below to review counterfeit reports and seller-at-fault refunds.
    </p>

    <ul class="space-y-2" role="listbox" aria-label="Refund and counterfeit review queue">
      <li
        v-for="row in queue"
        :key="row.id"
      >
        <button
          type="button"
          role="option"
          :aria-selected="selectedId === row.id"
          class="w-full text-left flex flex-wrap justify-between gap-2 rounded px-3 py-2 border transition cursor-pointer"
          :class="selectedId === row.id
            ? 'bg-primary/20 border-primary text-white'
            : 'bg-bg border-border text-white/90 hover:border-primary hover:bg-surface'"
          @click="selectCase(row.id)"
        >
          <span>{{ row.id }} — {{ row.issue }}</span>
          <span
            class="uppercase text-xs font-semibold"
            :class="row.status === 'freeze' ? 'text-danger' : 'text-secondary'"
          >
            {{ row.status }}
          </span>
        </button>
      </li>
    </ul>

    <div
      v-if="selectedCase"
      class="rounded-lg border border-border bg-bg p-4 space-y-3"
    >
      <h3 class="text-base font-semibold text-white">
        Reviewing {{ selectedCase.id }}
      </h3>
      <p class="text-white/85">{{ selectedCase.issue }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-secondary/50 text-secondary hover:bg-secondary/10 cursor-pointer"
          @click="runAction('refund')"
        >
          Approve forced refund
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
          @click="runAction('freeze')"
        >
          Freeze seller account
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-border text-white/90 hover:border-primary cursor-pointer"
          @click="runAction('reviewed')"
        >
          Mark reviewed
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded border border-border text-white/70 hover:border-primary cursor-pointer"
          @click="runAction('dismiss')"
        >
          Dismiss report
        </button>
      </div>
      <p v-if="actionNote" class="text-xs text-primary">{{ actionNote }}</p>
      <p class="text-xs text-white/60">
        Production: these actions connect to Stripe refunds and account freeze in Supabase ops tools.
      </p>
    </div>

    <p v-else class="text-white/60 text-xs">
      Tap a case above to open review actions.
    </p>
  </div>
</template>
