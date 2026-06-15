<script setup>
import { filterBcAudioProducts } from '~/utils/bcAudioOnlyCatalog.js'
import { markupPercent } from '~/utils/bcRetailPricing.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'
import { getSupabaseFunctionsBase } from '~/utils/publicSupabase.js'

const emit = defineEmits(['saved', 'error'])

const config = useRuntimeConfig()
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const loadError = ref('')
const search = ref('')
const rows = ref([])
const overrides = ref({})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value.slice(0, 60)
  return rows.value.filter((r) =>
    `${r.name} ${r.sku} ${r.category}`.toLowerCase().includes(q),
  ).slice(0, 80)
})

async function invokePricing (items) {
  const opsKey = getStoredOpsPhrase()
  if (!opsKey) throw new Error('Owner password needed — tap the B&C logo 5× and unlock.')
  const base = getSupabaseFunctionsBase(config)
  if (!base) throw new Error('Supabase not configured on this deploy.')
  const res = await fetch(`${base}/functions/v1/ops-cms-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_bc_catalog_pricing', ops_key: opsKey, items }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(String(data.error || res.statusText || 'Pricing lookup failed'))
  return data.rows || []
}

async function load () {
  loading.value = true
  loadError.value = ''
  message.value = ''
  try {
    const [catalogRes, cms] = await Promise.all([
      $fetch('/catalog/petra-products.json', { retry: 2 }),
      opsFetch('/api/ops/site-content', { query: { keys: 'bcPriceOverrides' } }),
    ])
    const catalog = filterBcAudioProducts(catalogRes?.products || [])
    overrides.value = (cms?.bcPriceOverrides && typeof cms.bcPriceOverrides === 'object')
      ? { ...cms.bcPriceOverrides }
      : {}
    const slice = catalog.slice(0, 120).map((p) => ({
      id: p.id,
      sku: p.sku || p.vendorSku,
      name: p.name,
      category: p.category,
      listedRetail: Number(p.retailPrice ?? p.price),
    }))
    rows.value = await invokePricing(slice)
  } catch (e) {
    loadError.value = e?.message || 'Could not load inventory pricing.'
    emit('error', loadError.value)
  } finally {
    loading.value = false
  }
}

async function searchCatalog () {
  loading.value = true
  loadError.value = ''
  try {
    const catalogRes = await $fetch('/catalog/petra-products.json', { retry: 2 })
    const catalog = filterBcAudioProducts(catalogRes?.products || [])
    const q = search.value.trim().toLowerCase()
    const matched = q
      ? catalog.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q))
      : catalog
    const slice = matched.slice(0, 80).map((p) => ({
      id: p.id,
      sku: p.sku || p.vendorSku,
      name: p.name,
      category: p.category,
      listedRetail: Number(p.retailPrice ?? p.price),
    }))
    rows.value = await invokePricing(slice)
  } catch (e) {
    loadError.value = e?.message || 'Search failed.'
  } finally {
    loading.value = false
  }
}

function setRetail (row, value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return
  row.retail = n
  row.markupPct = markupPercent(row.wholesale, n)
  overrides.value = { ...overrides.value, [row.id]: { retailPrice: n } }
}

function clearOverride (row) {
  const next = { ...overrides.value }
  delete next[row.id]
  overrides.value = next
  row.retail = row.suggestedRetail ?? row.listedRetail
  row.markupPct = markupPercent(row.wholesale, row.retail)
}

async function save () {
  saving.value = true
  message.value = ''
  loadError.value = ''
  if (!getStoredOpsPhrase()) {
    loadError.value = 'Owner password needed — tap the B&C logo 5×, unlock, then save again.'
    saving.value = false
    return
  }
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: 'bcPriceOverrides', payload: overrides.value },
    })
    message.value = 'Retail prices saved — customers never see wholesale costs.'
    emit('saved')
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Save failed'
    emit('error', loadError.value)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="bc-inv-pricing">
    <p v-if="loadError" class="bc-alert bc-alert--err">{{ loadError }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>
    <p class="bc-inv-pricing__note">
      <strong>Wholesale costs are owner-only.</strong> Shoppers see MSRP retail prices only. Edit retail to override the automatic markup.
    </p>
    <div class="bc-inv-pricing__search">
      <input v-model="search" class="input" type="search" placeholder="Search SKU or product name…" @keyup.enter="searchCatalog">
      <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="searchCatalog">Search</button>
      <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">Reload</button>
    </div>
    <div v-if="loading" class="bc-muted">Loading inventory…</div>
    <div v-else-if="filteredRows.length" class="bc-inv-pricing__table-wrap">
      <table class="bc-inv-pricing__table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Wholesale (you)</th>
            <th>Suggested retail</th>
            <th>Live retail</th>
            <th>Markup</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">
            <td>
              <strong>{{ row.name }}</strong>
              <div class="bc-muted small">{{ row.sku }} · {{ row.category }}</div>
            </td>
            <td>{{ row.wholesale != null ? ('$' + Number(row.wholesale).toFixed(2)) : '—' }}</td>
            <td>{{ row.suggestedRetail != null ? ('$' + Number(row.suggestedRetail).toFixed(2)) : '—' }}</td>
            <td>
              <input
                class="input bc-price-input"
                type="number"
                step="0.01"
                min="0"
                :value="row.retail"
                @change="setRetail(row, ($event.target).value)"
              >
            </td>
            <td>{{ row.markupPct != null ? (row.markupPct + '%') : '—' }}</td>
            <td>
              <button v-if="overrides[row.id]" type="button" class="btn btn-outline btn-sm" @click="clearOverride(row)">Reset</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="bc-muted">No products matched.</p>
    <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
      {{ saving ? 'Saving…' : 'Save retail prices' }}
    </button>
  </div>
</template>

<style scoped>
.bc-inv-pricing__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 12px; line-height: 1.5; }
.bc-inv-pricing__search { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.bc-inv-pricing__search .input { flex: 1 1 200px; }
.bc-inv-pricing__table-wrap { overflow-x: auto; margin-bottom: 12px; }
.bc-inv-pricing__table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-inv-pricing__table th, .bc-inv-pricing__table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; vertical-align: top; }
.bc-inv-pricing__table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-price-input { width: 96px; padding: 6px 8px; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
.bc-muted.small { font-size: 0.78rem; }
</style>
