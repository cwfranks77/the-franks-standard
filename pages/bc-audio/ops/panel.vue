<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'
import metaDefaults from '~/content/meta-config.json'

definePageMeta({
  layout: 'bc-audio',
  middleware: ['bc-ops-host', 'bc-ops-auth'],
})

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))
const { revoke } = useOpsSession()
const { theme, applyPreset, patch, resetTheme, publishTheme, presets, themeSaving, themeMessage } = useBcTheme()

const tab = ref('store')
const orders = ref([])
const ordersLoading = ref(false)
const ordersError = ref('')

const seo = ref({
  title: metaDefaults.title,
  description: metaDefaults.description,
  image: metaDefaults.image,
  parentCompany: metaDefaults.parentCompany || 'The Franks Standard LLC',
})
const seoLoading = ref(false)
const seoSaving = ref(false)
const seoMessage = ref('')
const seoError = ref('')

const tabs = [
  { id: 'store', label: 'Store & products' },
  { id: 'seo', label: 'SEO & homepage text' },
  { id: 'theme', label: 'Colors & theme' },
  { id: 'orders', label: 'Orders' },
  { id: 'tools', label: 'Fix problems' },
]

async function loadSeo () {
  seoLoading.value = true
  seoError.value = ''
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: 'bcMeta' } })
    if (data?.bcMeta) {
      seo.value = { ...seo.value, ...data.bcMeta }
    }
  } catch (e) {
    seoError.value = e?.data?.statusMessage || 'Could not load SEO settings.'
  } finally {
    seoLoading.value = false
  }
}

async function saveSeo () {
  seoSaving.value = true
  seoMessage.value = ''
  seoError.value = ''
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: 'bcMeta', payload: seo.value },
    })
    seoMessage.value = 'SEO saved — search engines and social previews update after the next deploy/cache refresh.'
  } catch (e) {
    seoError.value = e?.data?.statusMessage || 'Save failed.'
  } finally {
    seoSaving.value = false
  }
}

async function loadOrders () {
  ordersLoading.value = true
  ordersError.value = ''
  try {
    const data = await opsFetch('/api/ops/bc-orders')
    orders.value = data?.rows || []
  } catch (e) {
    ordersError.value = e?.data?.statusMessage || 'Could not load orders.'
  } finally {
    ordersLoading.value = false
  }
}

function formatDate (v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

async function signOut () {
  await revoke()
  navigateTo('/bc-audio')
}

function clearSiteCache () {
  if (!import.meta.client) return
  try {
    localStorage.removeItem('bc-audio-theme-v1')
    sessionStorage.clear()
    caches?.keys?.().then((keys) => keys.forEach((k) => caches.delete(k)))
    navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()))
  } finally {
    window.location.reload()
  }
}

watch(tab, (t) => {
  if (t === 'orders') loadOrders()
  if (t === 'seo') loadSeo()
})

useSeoMeta({
  title: `B&C Owner Console — ${BC_BRAND.full}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="bc-panel">
    <header class="bc-panel__head">
      <div>
        <p class="bc-panel__eyebrow">B&amp;C website owner console</p>
        <h1>Run your storefront</h1>
        <p class="bc-panel__sub">Edit products, turn the store on/off, change colors, and track orders — everything shoppers see on bcpoweraudio.com.</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
    </header>

    <nav class="bc-panel__tabs" aria-label="Owner console sections">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="bc-panel__tab"
        :class="{ active: tab === t.id }"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </nav>

  <!-- STORE & PRODUCTS -->
    <section v-show="tab === 'store'" class="bc-panel__section">
      <h2>Your B&amp;C megastore</h2>
      <p class="bc-panel__note">This controls the live catalog, prices, hero text, and whether the store is open or in maintenance mode.</p>
      <BcOpsStoreEditor />
    </section>

  <!-- SEO -->
    <section v-show="tab === 'seo'" class="bc-panel__section">
      <h2>Search &amp; social (Google, Facebook)</h2>
      <p class="bc-panel__note">Title and description shown in Google results and when someone shares your link.</p>
      <p v-if="seoError" class="bc-alert bc-alert--err">{{ seoError }}</p>
      <p v-if="seoMessage" class="bc-alert bc-alert--ok">{{ seoMessage }}</p>
      <div v-if="seoLoading" class="bc-muted">Loading…</div>
      <template v-else>
        <div class="bc-form-stack">
          <label>Page title<input v-model="seo.title" class="input" type="text"></label>
          <label>Description<textarea v-model="seo.description" class="input bc-textarea" rows="3" /></label>
          <label>Share image URL<input v-model="seo.image" class="input" type="url"></label>
          <label>Parent company line<input v-model="seo.parentCompany" class="input" type="text"></label>
        </div>
        <button type="button" class="btn btn-primary btn-sm" :disabled="seoSaving" @click="saveSeo">
          {{ seoSaving ? 'Saving…' : 'Save SEO' }}
        </button>
      </template>
    </section>

  <!-- THEME -->
    <section v-show="tab === 'theme'" class="bc-panel__section">
      <h2>Store colors</h2>
      <p class="bc-panel__note">Pick a look, then click <strong>Publish theme</strong> so every visitor sees it — not just your browser.</p>
      <p v-if="themeMessage" class="bc-alert bc-alert--ok">{{ themeMessage }}</p>
      <div class="bc-panel__presets">
        <button
          v-for="p in presets"
          :key="p.id"
          type="button"
          class="bc-preset"
          :class="{ active: theme.presetId === p.id }"
          :style="{ '--swatch': p.accent }"
          @click="applyPreset(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="bc-panel__colors">
        <label>Main red<input type="color" :value="theme.accent" @input="patch({ accent: $event.target.value })"></label>
        <label>Bright red<input type="color" :value="theme.accentBright" @input="patch({ accentBright: $event.target.value })"></label>
        <label>Background<input type="color" :value="theme.bg" @input="patch({ bg: $event.target.value })"></label>
        <label>Cards<input type="color" :value="theme.bgCard" @input="patch({ bgCard: $event.target.value })"></label>
      </div>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-primary btn-sm" :disabled="themeSaving" @click="publishTheme">
          {{ themeSaving ? 'Publishing…' : 'Publish theme for all visitors' }}
        </button>
        <button type="button" class="btn btn-outline btn-sm" @click="resetTheme">Reset to classic red</button>
      </div>
    </section>

  <!-- ORDERS -->
    <section v-show="tab === 'orders'" class="bc-panel__section">
      <h2>Recent orders</h2>
      <p class="bc-panel__note">Dropship orders from checkout. Refresh after a customer buys.</p>
      <button type="button" class="btn btn-outline btn-sm" :disabled="ordersLoading" @click="loadOrders">
        {{ ordersLoading ? 'Loading…' : 'Refresh orders' }}
      </button>
      <p v-if="ordersError" class="bc-alert bc-alert--err">{{ ordersError }}</p>
      <p v-if="!ordersLoading && !orders.length && !ordersError" class="bc-muted">No orders yet.</p>
      <div v-if="orders.length" class="bc-orders-table-wrap">
        <table class="bc-orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in orders" :key="row.id">
              <td>
                <div>{{ row.listing?.title || 'B&C order' }}</div>
                <div class="bc-muted small">{{ row.order?.buyer_email || row.order_id }}</div>
              </td>
              <td><span class="bc-status">{{ row.provider_status || 'queued' }}</span></td>
              <td>
                <span v-if="row.order?.tracking_number">{{ row.order.tracking_carrier || 'Carrier' }} #{{ row.order.tracking_number }}</span>
                <span v-else class="bc-muted">—</span>
              </td>
              <td class="bc-muted small">{{ formatDate(row.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  <!-- TOOLS -->
    <section v-show="tab === 'tools'" class="bc-panel__section">
      <h2>Fix problems</h2>
      <ul class="bc-tools-list">
        <li><strong>Store looks old?</strong> Click “Clear cache & reload” below, or open the site in a private window.</li>
        <li><strong>Changes not saving?</strong> Sign out, tap the logo 5×, unlock again, then save.</li>
        <li><strong>Support line on site:</strong> {{ support.phoneDisplay }}</li>
        <li><strong>Checkout broken?</strong> Confirm Supabase secrets are set in GitHub Actions for the B&amp;C deploy.</li>
      </ul>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-outline btn-sm" @click="clearSiteCache">Clear cache &amp; reload</button>
        <NuxtLink to="/bc-audio" class="btn btn-outline btn-sm">Open storefront</NuxtLink>
        <NuxtLink to="/bc-audio/open-door" class="btn btn-outline btn-sm">Open Door page</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bc-panel { max-width: 960px; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
.bc-panel__head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem; }
.bc-panel__eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.14em; color: #ff5252; margin: 0 0 6px; }
.bc-panel__head h1 { font-size: 1.6rem; margin: 0 0 8px; }
.bc-panel__sub { color: #9ca3af; font-size: 0.92rem; margin: 0; max-width: 36rem; line-height: 1.5; }
.bc-panel__tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }
.bc-panel__tab {
  padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
  background: #16161c; color: #b8bcc6; font-size: 0.82rem; font-weight: 700; cursor: pointer;
}
.bc-panel__tab.active { background: rgba(211,47,47,0.2); border-color: #ff5252; color: #fff; }
.bc-panel__section {
  padding: 1.25rem 1.5rem; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; background: var(--bc-bg-card, #16161c);
}
.bc-panel__section h2 { font-size: 1.05rem; color: #ff5252; margin: 0 0 8px; }
.bc-panel__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 14px; line-height: 1.5; }
.bc-panel__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-textarea { min-height: 80px; resize: vertical; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
.bc-muted.small { font-size: 0.78rem; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.bc-panel__presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.bc-preset {
  padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
  background: #0a0a0c; color: #f5f5f7; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
}
.bc-preset::before { content: ''; width: 12px; height: 12px; border-radius: 50%; background: var(--swatch); }
.bc-preset.active { border-color: #ff5252; }
.bc-panel__colors { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 12px; }
.bc-panel__colors label { font-size: 0.78rem; color: #9ca3af; display: flex; flex-direction: column; gap: 6px; }
.bc-panel__colors input[type="color"] { width: 100%; height: 36px; border: none; border-radius: 8px; cursor: pointer; }
.bc-orders-table-wrap { overflow-x: auto; margin-top: 14px; }
.bc-orders-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-orders-table th, .bc-orders-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-orders-table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-status { text-transform: capitalize; color: #ff5252; font-weight: 600; }
.bc-tools-list { margin: 0 0 16px; padding-left: 1.2rem; color: #b8bcc6; line-height: 1.6; font-size: 0.9rem; }
</style>
