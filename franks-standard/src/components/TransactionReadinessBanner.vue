<template>
  <div class="readiness-banner" :class="bannerClass">
    <div class="readiness-head">
      <span class="readiness-pill">{{ readinessLabel }}</span>
      <NuxtLink v-if="showOwnerLink" to="/ops/status" class="readiness-owner-link">Owner: full checklist →</NuxtLink>
    </div>
    <p class="readiness-summary">{{ readinessSummary }}</p>
    <ul v-if="showDetails" class="readiness-checks">
      <li v-for="c in checks" :key="c.id" :class="{ ok: c.ok, pending: !c.ok }">
        <span class="readiness-icon">{{ c.ok ? '✓' : '○' }}</span>
        <span>
          <strong>{{ c.label }}</strong>
          <span class="readiness-detail"> — {{ c.detail }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  showDetails: { type: Boolean, default: false },
  showOwnerLink: { type: Boolean, default: false },
})

const { checks, readinessLabel, readinessSummary, canRunFullTransactions, canCollectFees } = usePlatformReadiness()

const bannerClass = computed(() => {
  if (canRunFullTransactions.value) return 'readiness-full'
  if (canCollectFees.value) return 'readiness-partial'
  return 'readiness-setup'
})
</script>

<style scoped>
.readiness-banner {
  padding: 16px 18px;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid #d7dde6;
  margin-bottom: 1.5rem;
  line-height: 1.55;
}
.readiness-partial {
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(255, 193, 7, 0.06));
  border-color: rgba(201, 168, 76, 0.35);
}
.readiness-setup {
  background: #f8f9fb;
}
.readiness-full {
  background: linear-gradient(135deg, rgba(16, 255, 176, 0.08), rgba(201, 168, 76, 0.06));
  border-color: rgba(16, 255, 176, 0.3);
}
.readiness-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.readiness-pill {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.06);
  color: #111827;
}
.readiness-owner-link {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gold);
}
.readiness-summary {
  margin: 0;
  font-size: 0.92rem;
  color: #1f2937;
}
.readiness-checks {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  font-size: 0.85rem;
}
.readiness-checks li {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  color: #4b5563;
}
.readiness-checks li.ok { color: #065f46; }
.readiness-checks li.pending strong { color: #92400e; }
.readiness-icon { flex: 0 0 auto; font-weight: 800; }
.readiness-detail { font-weight: 400; }
</style>
