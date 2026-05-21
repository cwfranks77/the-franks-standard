<template>
  <section class="trust-counter-section" aria-label="Platform snapshot">
    <div class="container">
      <p class="tc-eyebrow text-center">Where the floor stands today</p>
      <p class="tc-note text-center">
        Real counts from our database — no inflated launch numbers.
      </p>
      <div class="trust-counter-grid">
        <div class="tc-item" v-for="c in counters" :key="c.label">
          <p class="tc-value">{{ c.display }}</p>
          <p class="tc-label">{{ c.label }}</p>
        </div>
      </div>
      <p v-if="loadError" class="tc-error text-center">{{ loadError }}</p>
    </div>
  </section>
</template>

<script setup>
const supabase = useSupabaseClient()
const loadError = ref('')

const counters = ref([
  { label: 'Published listings on the floor', display: '…', key: 'listings' },
  { label: 'Seller accounts registered', display: '…', key: 'sellers' },
  { label: 'Listings with uploaded COA', display: '…', key: 'coas' },
  { label: 'Completed sales (all time)', display: '—', key: 'sales' },
])

async function countExact (table, filters = []) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  for (const [col, val] of filters) {
    q = q.eq(col, val)
  }
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

onMounted(async () => {
  if (!import.meta.client) return
  loadError.value = ''
  try {
    const [listings, sellers, coas] = await Promise.all([
      countExact('listings', [['status', 'published']]),
      countExact('profiles', [['account_type', 'seller']]),
      countExact('listings', [['status', 'published'], ['coa_type', 'upload']]),
    ])
    counters.value = counters.value.map((c) => {
      if (c.key === 'listings') return { ...c, display: String(listings) }
      if (c.key === 'sellers') return { ...c, display: String(sellers) }
      if (c.key === 'coas') return { ...c, display: String(coas) }
      if (c.key === 'sales') {
        return {
          ...c,
          display: '—',
          label: 'Completed sales (private until checkout is public)',
        }
      }
      return c
    })
  } catch (e) {
    loadError.value = 'Counts unavailable right now.'
    counters.value = counters.value.map((c) => ({
      ...c,
      display: c.key === 'sales' ? '—' : '?',
    }))
  }
})
</script>

<style scoped>
.trust-counter-section {
  padding: 32px 0 24px;
  border-top: 1px solid rgba(0, 245, 160, 0.12);
  border-bottom: 1px solid rgba(0, 245, 160, 0.12);
  background: linear-gradient(180deg, rgba(0, 245, 160, 0.03), transparent);
}
.tc-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyan);
  margin: 0 0 8px;
}
.tc-note {
  font-size: 0.88rem;
  margin: 0 auto 20px;
  max-width: 520px;
  color: #6b7280 !important;
  -webkit-text-fill-color: #6b7280 !important;
  font-weight: 600;
  line-height: 1.5;
  text-transform: none;
  letter-spacing: normal;
}
.trust-counter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.tc-item {
  text-align: center;
  padding: 16px 10px;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.2);
}
.tc-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--trust-green);
  font-family: 'Cinzel', serif;
  margin: 0;
}
.tc-label {
  font-size: 0.78rem;
  color: var(--stone-400);
  margin: 6px 0 0;
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 600;
  line-height: 1.4;
}
.tc-error {
  margin-top: 12px;
  font-size: 0.85rem;
  color: #b91c1c;
}
@media (max-width: 768px) {
  .trust-counter-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 400px) {
  .trust-counter-grid { grid-template-columns: 1fr; }
}
</style>
