<script setup>
const emit = defineEmits(['saved', 'error'])

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const loadError = ref('')
const source = ref('')

const store = ref({
  id: 'bc-performance-audio',
  slug: 'bc-performance-audio',
  name: 'B&C Performance Audio',
  tagline: '',
  accent: '#d32f2f',
  is_live: true,
  hero_json: { eyebrow: '', slogan: '' },
})

const items = ref([])

async function load () {
  loading.value = true
  loadError.value = ''
  message.value = ''
  try {
    const data = await opsFetch('/api/ops/dropship-store', { query: { storeId: 'bc-performance-audio' } })
    store.value = {
      ...store.value,
      ...data.store,
      hero_json: data.store?.hero_json || store.value.hero_json,
      is_live: data.store?.is_live !== false,
    }
    items.value = (data.items || []).map((row) => ({
      item_id: row.item_id || row.id,
      brand: row.brand || '',
      name: row.name || '',
      tagline: row.tagline || '',
      retail_price: Number(row.retail_price ?? row.retailPrice ?? 0),
      wholesale_cost: Number(row.wholesale_cost ?? row.wholesaleCost ?? 0),
      category: row.category || '',
      badge: row.badge || '',
      image: row.image || '/img/hero-showcase-v2.svg',
      specs: Array.isArray(row.specs) ? [...row.specs] : [],
      is_active: row.is_active !== false,
    }))
    source.value = data.source || ''
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Could not load store. Sign out and unlock again.'
    emit('error', loadError.value)
  } finally {
    loading.value = false
  }
}

function addItem () {
  items.value.push({
    item_id: `prod-${Date.now()}`,
    brand: '',
    name: 'New product',
    tagline: '',
    retail_price: 0,
    wholesale_cost: 0,
    category: 'Subwoofers',
    badge: '',
    image: '/img/hero-showcase-v2.svg',
    specs: [],
    is_active: true,
  })
}

function removeItem (index) {
  items.value.splice(index, 1)
}

function specsText (item) {
  return (item.specs || []).join('\n')
}

function setSpecs (item, text) {
  item.specs = String(text).split('\n').map((s) => s.trim()).filter(Boolean)
}

async function save () {
  saving.value = true
  message.value = ''
  loadError.value = ''
  try {
    const data = await opsFetch('/api/ops/dropship-store', {
      method: 'PUT',
      body: { store: store.value, items: items.value },
    })
    source.value = data.source || 'supabase'
    message.value = 'Saved — your B&C storefront updates within about a minute.'
    emit('saved')
    await load()
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Save failed'
    emit('error', loadError.value)
  } finally {
    saving.value = false
  }
}

onMounted(load)

defineExpose({ load, save })
</script>

<template>
  <div class="bc-store-editor">
    <p v-if="loadError" class="bc-alert bc-alert--err" role="alert">{{ loadError }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok" role="status">{{ message }}</p>
    <p v-if="source" class="bc-store-editor__meta">Database: {{ source }}</p>

    <div v-if="loading" class="bc-store-editor__loading">Loading your B&amp;C store…</div>

    <template v-else>
      <div class="bc-store-editor__live">
        <label class="bc-live-toggle">
          <input v-model="store.is_live" type="checkbox">
          <span>{{ store.is_live ? 'Store is LIVE — customers can shop' : 'Store is HIDDEN — maintenance mode' }}</span>
        </label>
      </div>

      <div class="bc-form-grid">
        <label>Store name<input v-model="store.name" class="input" type="text"></label>
        <label>Tagline<input v-model="store.tagline" class="input" type="text"></label>
        <label>Hero eyebrow<input v-model="store.hero_json.eyebrow" class="input" type="text" placeholder="e.g. Competition car audio"></label>
        <label>Hero slogan<input v-model="store.hero_json.slogan" class="input" type="text"></label>
        <label>Accent color<input v-model="store.accent" class="input" type="color"></label>
      </div>

      <div class="bc-store-editor__catalog-head">
        <h3>Products on your storefront ({{ items.length }})</h3>
        <button type="button" class="btn btn-outline btn-sm" @click="addItem">+ Add product</button>
      </div>

      <div v-for="(item, index) in items" :key="item.item_id + index" class="bc-item-card">
        <div class="bc-item-card__head">
          <strong>{{ item.name || 'Untitled product' }}</strong>
          <div class="bc-item-card__actions">
            <label class="bc-live-toggle bc-live-toggle--sm">
              <input v-model="item.is_active" type="checkbox"> Show on site
            </label>
            <button type="button" class="btn btn-outline btn-sm" @click="removeItem(index)">Remove</button>
          </div>
        </div>
        <div class="bc-form-grid">
          <label>Product ID<input v-model="item.item_id" class="input" type="text"></label>
          <label>Brand<input v-model="item.brand" class="input" type="text"></label>
          <label>Product name<input v-model="item.name" class="input" type="text"></label>
          <label>Category<input v-model="item.category" class="input" type="text"></label>
          <label>Retail price $<input v-model.number="item.retail_price" class="input" type="number" step="0.01"></label>
          <label>Wholesale cost $<input v-model.number="item.wholesale_cost" class="input" type="number" step="0.01"></label>
          <label>Image URL<input v-model="item.image" class="input" type="text"></label>
          <label>Badge<input v-model="item.badge" class="input" type="text" placeholder="e.g. Best seller"></label>
          <label class="bc-span-2">Short description<input v-model="item.tagline" class="input" type="text"></label>
          <label class="bc-span-2">Specs (one per line)
            <textarea class="input bc-textarea" :value="specsText(item)" rows="3" @input="setSpecs(item, $event.target.value)" />
          </label>
        </div>
      </div>

      <div class="bc-store-editor__save">
        <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save store & products' }}
        </button>
        <NuxtLink to="/bc-audio" class="btn btn-outline" target="_blank">Preview storefront ↗</NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bc-store-editor__meta { font-size: 0.78rem; color: #7a8190; margin: 0 0 12px; }
.bc-store-editor__loading { color: #9ca3af; padding: 20px 0; }
.bc-store-editor__live { margin-bottom: 16px; padding: 12px 14px; border-radius: 10px; background: rgba(211,47,47,0.1); border: 1px solid rgba(211,47,47,0.3); }
.bc-live-toggle { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; }
.bc-live-toggle--sm { font-size: 0.78rem; font-weight: 600; }
.bc-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.bc-form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; }
.bc-span-2 { grid-column: 1 / -1; }
.bc-textarea { min-height: 72px; resize: vertical; }
.bc-store-editor__catalog-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin: 20px 0 12px; }
.bc-store-editor__catalog-head h3 { margin: 0; font-size: 1rem; color: #ff5252; }
.bc-item-card { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; margin-bottom: 12px; background: #0a0a0c; }
.bc-item-card__head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.bc-item-card__actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bc-store-editor__save { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; border: 1px solid rgba(211,47,47,0.4); }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
@media (max-width: 640px) { .bc-form-grid { grid-template-columns: 1fr; } }
</style>
