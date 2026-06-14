<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Ops — Dropship store control', robots: 'noindex, nofollow' })

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const error = ref('')
const source = ref('')

const store = ref({
  id: 'bc-performance-audio',
  slug: 'bc-performance-audio',
  name: '',
  tagline: '',
  accent: '#d32f2f',
  is_live: true,
  hero_json: { eyebrow: '', slogan: '' },
})

const items = ref([])

async function load () {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch('/api/ops/dropship-store')
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
    error.value = e?.data?.statusMessage || e?.message || 'Could not load dropship store'
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
  error.value = ''
  try {
    const data = await $fetch('/api/ops/dropship-store', {
      method: 'PUT',
      body: { store: store.value, items: items.value },
    })
    source.value = data.source || 'supabase'
    message.value = 'Dropship store saved. Live storefront updates within ~1 minute.'
    await load()
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="ops-cms">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Dropship store control</h1>
      <p class="text-muted lead">
        Edit B&amp;C Performance Audio catalog, pricing, branding, and live toggle. Changes apply to
        <NuxtLink to="/shop">/shop</NuxtLink> immediately after save.
      </p>
      <p v-if="source" class="small text-muted">Data source: {{ source }} · requires migration <code>037_owner_cms.sql</code> + <code>SUPABASE_SERVICE_ROLE_KEY</code> for persistence.</p>

      <p v-if="error" class="alert alert-err" role="alert">{{ error }}</p>
      <p v-if="message" class="alert alert-ok" role="status">{{ message }}</p>

      <div v-if="loading" class="text-muted">Loading store…</div>

      <template v-else>
        <section class="card panel">
          <div class="panel-head">
            <h2>Store settings</h2>
            <label class="live-toggle">
              <input v-model="store.is_live" type="checkbox">
              <span>{{ store.is_live ? 'Live on site' : 'Hidden (maintenance)' }}</span>
            </label>
          </div>
          <div class="form-grid">
            <label>Store name<input v-model="store.name" class="input" type="text"></label>
            <label>Tagline<input v-model="store.tagline" class="input" type="text"></label>
            <label>Accent color<input v-model="store.accent" class="input" type="text"></label>
            <label>Hero eyebrow<input v-model="store.hero_json.eyebrow" class="input" type="text"></label>
            <label>Hero slogan<input v-model="store.hero_json.slogan" class="input" type="text"></label>
          </div>
        </section>

        <section class="card panel">
          <div class="panel-head">
            <h2>Catalog ({{ items.length }} items)</h2>
            <button type="button" class="btn btn-outline btn-sm" @click="addItem">+ Add product</button>
          </div>

          <div v-for="(item, index) in items" :key="item.item_id" class="item-card">
            <div class="item-card-head">
              <strong>{{ item.name || 'Untitled' }}</strong>
              <div class="item-card-actions">
                <label class="live-toggle small"><input v-model="item.is_active" type="checkbox"> Active</label>
                <button type="button" class="btn btn-outline btn-sm" @click="removeItem(index)">Remove</button>
              </div>
            </div>
            <div class="form-grid">
              <label>SKU / ID<input v-model="item.item_id" class="input" type="text"></label>
              <label>Brand<input v-model="item.brand" class="input" type="text"></label>
              <label>Name<input v-model="item.name" class="input" type="text"></label>
              <label>Category<input v-model="item.category" class="input" type="text"></label>
              <label>Retail $<input v-model.number="item.retail_price" class="input" type="number" step="0.01"></label>
              <label>Wholesale $<input v-model.number="item.wholesale_cost" class="input" type="number" step="0.01"></label>
              <label>Badge<input v-model="item.badge" class="input" type="text"></label>
              <label>Image URL<input v-model="item.image" class="input" type="text"></label>
              <label class="span-2">Tagline<input v-model="item.tagline" class="input" type="text"></label>
              <label class="span-2">Specs (one per line)<textarea class="input area" :value="specsText(item)" rows="3" @input="setSpecs(item, $event.target.value)" /></label>
            </div>
          </div>
        </section>

        <div class="save-row">
          <button type="button" class="btn btn-primary btn-lg" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : 'Save dropship store' }}
          </button>
          <NuxtLink to="/shop" class="btn btn-outline btn-lg" target="_blank">Preview /shop ↗</NuxtLink>
          <NuxtLink to="/ops/dropship" class="btn btn-outline btn-lg">Order queue</NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ops-cms { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.lead { max-width: 760px; margin-bottom: 16px; }
.card.panel { padding: 20px; margin-bottom: 18px; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.panel-head h2 { margin: 0; font-size: 1.05rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-faint); }
.span-2 { grid-column: 1 / -1; }
.input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
.area { min-height: 72px; resize: vertical; }
.live-toggle { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; }
.live-toggle.small { font-size: 0.75rem; text-transform: none; }
.item-card { border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 12px; background: var(--surface-sunken); }
.item-card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.item-card-actions { display: flex; align-items: center; gap: 10px; }
.save-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
.alert { padding: 12px 14px; border-radius: 8px; margin-bottom: 12px; }
.alert-err { background: #fff1f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert-ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
@media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } }
</style>
