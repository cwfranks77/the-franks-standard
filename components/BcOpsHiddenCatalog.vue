<script setup>
import { filterBcAudioProducts } from '~/utils/bcAudioOnlyCatalog.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const emit = defineEmits(['saved', 'error'])

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const loadError = ref('')
const search = ref('')
const hiddenIds = ref([])
const catalog = ref([])

const visibleProducts = computed(() => {
  const hidden = new Set(hiddenIds.value.map(String))
  const q = search.value.trim().toLowerCase()
  return catalog.value
    .filter((p) => !hidden.has(String(p.id)))
    .filter((p) => !q || `${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(q))
    .slice(0, 80)
})

const hiddenProducts = computed(() => {
  const hidden = new Set(hiddenIds.value.map(String))
  return catalog.value.filter((p) => hidden.has(String(p.id))).slice(0, 40)
})

async function load () {
  loading.value = true
  loadError.value = ''
  message.value = ''
  try {
    const [catalogRes, cms] = await Promise.all([
      $fetch('/catalog/petra-products.json', { retry: 2 }),
      opsFetch('/api/ops/site-content', { query: { keys: 'bcHiddenCatalog' } }),
    ])
    catalog.value = filterBcAudioProducts(catalogRes?.products || [])
    const ids = cms?.bcHiddenCatalog?.productIds
    hiddenIds.value = Array.isArray(ids) ? ids.map(String) : []
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Could not load catalog.'
    emit('error', loadError.value)
  } finally {
    loading.value = false
  }
}

function hideProduct (id) {
  const key = String(id)
  if (!hiddenIds.value.includes(key)) hiddenIds.value = [...hiddenIds.value, key]
}

function restoreProduct (id) {
  const key = String(id)
  hiddenIds.value = hiddenIds.value.filter((x) => x !== key)
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
      body: {
        contentKey: 'bcHiddenCatalog',
        payload: { productIds: hiddenIds.value.map(String) },
      },
    })
    message.value = `Saved — ${hiddenIds.value.length} product(s) hidden from the live storefront.`
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
  <div class="bc-hide-catalog">
    <p v-if="loadError" class="bc-alert bc-alert--err">{{ loadError }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>
    <p class="bc-hide-catalog__note">
      Hide Petra items from bcpoweraudio.com without deleting them from the wholesaler feed.
      Hidden count: <strong>{{ hiddenIds.length }}</strong>
    </p>
    <div v-if="loading" class="bc-muted">Loading catalog…</div>
    <template v-else>
      <input v-model="search" class="input" type="search" placeholder="Search name, brand, category…">
      <div class="bc-hide-catalog__grid">
        <div>
          <h3>Visible on site</h3>
          <ul class="bc-hide-list">
            <li v-for="p in visibleProducts" :key="p.id">
              <span>{{ p.name }}</span>
              <button type="button" class="btn btn-outline btn-sm" @click="hideProduct(p.id)">Hide</button>
            </li>
          </ul>
        </div>
        <div>
          <h3>Hidden from site</h3>
          <ul class="bc-hide-list">
            <li v-for="p in hiddenProducts" :key="p.id">
              <span>{{ p.name }}</span>
              <button type="button" class="btn btn-outline btn-sm" @click="restoreProduct(p.id)">Restore</button>
            </li>
            <li v-if="!hiddenProducts.length" class="bc-muted">None hidden yet.</li>
          </ul>
        </div>
      </div>
      <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
        {{ saving ? 'Saving…' : 'Save hidden list' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.bc-hide-catalog__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 12px; line-height: 1.5; }
.bc-hide-catalog__grid { display: grid; gap: 1rem; grid-template-columns: 1fr; margin: 12px 0; }
@media (min-width: 760px) { .bc-hide-catalog__grid { grid-template-columns: 1fr 1fr; } }
.bc-hide-list { list-style: none; margin: 0; padding: 0; max-height: 320px; overflow: auto; }
.bc-hide-list li {
  display: flex; justify-content: space-between; gap: 8px; align-items: center;
  padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem;
}
.bc-hide-list span { flex: 1; min-width: 0; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
h3 { font-size: 0.95rem; color: #ff5252; margin: 0 0 8px; }
</style>
