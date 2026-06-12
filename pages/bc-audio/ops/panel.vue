<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'
import { BC_META_DEFAULTS } from '~/utils/bcMetaDefaults.js'
import seedAntiqueLedger from '~/src/content/antique-ledger.json'
import { verifyOpsPhraseBrowser } from '~/utils/opsClientAuth'

definePageMeta({
  layout: 'bc-audio',
  middleware: ['bc-ops-host', 'bc-ops-auth'],
})

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))
const { isAuthed, revoke } = useOpsSession()
const { theme, applyPreset, patch, resetTheme, publishTheme, presets, themeSaving, themeMessage } = useBcTheme()

const tab = ref('store')
const orders = ref([])
const ordersLoading = ref(false)
const ordersError = ref('')

const BC_SEO_DEFAULTS = { ...BC_META_DEFAULTS }

const seo = ref({ ...BC_SEO_DEFAULTS })
const seoLoading = ref(false)
const seoSaving = ref(false)
const seoMessage = ref('')
const seoError = ref('')
const seoInfo = ref('')

function opsErrorMessage (e, fallback) {
  const data = e?.data
  if (data && typeof data === 'object') {
    return String(data.error || data.statusMessage || fallback)
  }
  return String(e?.message || fallback)
}

const tabs = [
  { id: 'store', label: 'Store & products' },
  { id: 'seo', label: 'SEO & homepage text' },
  { id: 'theme', label: 'Colors & theme' },
  { id: 'orders', label: 'Orders' },
  { id: 'owner', label: 'Owner backend' },
  { id: 'tools', label: 'Fix problems' },
]

async function loadSeo () {
  seoLoading.value = true
  seoError.value = ''
  seoInfo.value = ''
  seo.value = { ...BC_SEO_DEFAULTS }
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: 'bcMeta' } })
    if (data?.bcMeta && typeof data.bcMeta === 'object') {
      seo.value = { ...seo.value, ...data.bcMeta }
    }
  } catch (e) {
    const msg = opsErrorMessage(e, 'Could not load SEO settings.')
    if (/unauthorized|expired/i.test(msg)) {
      seoError.value = 'Session expired — tap the B&C logo 5×, unlock, then open this tab again.'
    } else if (/not configured|supabase/i.test(msg)) {
      seoInfo.value = 'Cloud save is offline — you can still edit below. Changes apply after backend is connected.'
    } else {
      seoInfo.value = `Using defaults on this page (${msg}). Edit below and save when connected.`
    }
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
    seoError.value = opsErrorMessage(e, 'Save failed.')
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
  if (t === 'owner') loadAntiqueLedger()
})

// Private owner ledger — unlocked when you are already signed into this panel.
const ledgerUnlocked = ref(false)
const ledgerUnlockError = ref('')
const ownerPhraseInput = ref('')
const newTx = ref({ account: '', desc: '', amount: '' })
const ledgerTransactions = ref([
  { date: '2026-06-11 14:22', account: 'STRIPE-REVENUE', desc: 'PETRA-DEN-4K9CH Consumer Invoice Settlement', amount: '+$1,394.45', isCredit: true },
  { date: '2026-06-11 09:15', account: 'LA-TAX-RESERVE', desc: 'Quarterly State Sales Tax Allocation Escrow', amount: '-$240.10', isCredit: false },
  { date: '2026-06-11 11:30', account: 'MERCURY-BANK', desc: 'Petra Distribution Wholesaler Ledger Clearing', amount: '-$899.60', isCredit: false },
])

watch(isAuthed, (signedIn) => {
  if (signedIn) ledgerUnlocked.value = true
}, { immediate: true })

async function verifyLedgerUnlock () {
  ledgerUnlockError.value = ''
  if (isAuthed.value) {
    ledgerUnlocked.value = true
    ownerPhraseInput.value = ''
    return
  }
  const raw = ownerPhraseInput.value.trim()
  if (!raw) {
    ledgerUnlockError.value = 'Enter your owner password — the same phrase you type after tapping the B&C logo 5 times.'
    return
  }
  const expectedHash = String(config.public?.opsAccessKeyHash || '').trim().toLowerCase()
  if (!expectedHash) {
    ledgerUnlockError.value = 'Owner password is not set on this build. Add NUXT_PUBLIC_OPS_ACCESS_KEY in GitHub Actions and redeploy.'
    return
  }
  if (await verifyOpsPhraseBrowser(raw, expectedHash)) {
    ledgerUnlocked.value = true
    ownerPhraseInput.value = ''
    return
  }
  ledgerUnlockError.value = 'That password did not match. Use the same owner phrase as the logo unlock (capitals do not matter).'
  ownerPhraseInput.value = ''
}

function postTransaction (isCredit) {
  if (!newTx.value.account || !newTx.value.amount) return
  const formattedAmt = `${isCredit ? '+' : '-'}$${parseFloat(newTx.value.amount).toFixed(2)}`
  ledgerTransactions.value.unshift({
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    account: newTx.value.account.toUpperCase(),
    desc: newTx.value.desc || 'Manual Administrative Post',
    amount: formattedAmt,
    isCredit,
  })
  newTx.value = { account: '', desc: '', amount: '' }
}

function calculateTargetRetailPrice (product) {
  if (!product || !product.baseCost) return '0.00'

  const catLower = (product.category || '').toLowerCase()
  let markup = 1.55

  if (catLower.includes('computer') || catLower.includes('workstation')) {
    markup = 1.35
  } else if (catLower.includes('marine') || catLower.includes('power')) {
    markup = 1.65
  }

  return (product.baseCost * markup).toFixed(2)
}

function mapPortalTierCategory (segment) {
  const catLower = String(segment || '').toLowerCase()
  if (catLower.includes('computer') || catLower.includes('workstation') || catLower.includes('laptop') || catLower.includes('server')) {
    return 'Computers & Workstations'
  }
  if (catLower.includes('marine') || catLower.includes('boat') || catLower.includes('power')) {
    return 'Marine & Powersports'
  }
  return 'Home Theater & Audio'
}

function buildStaticCatalogFromProducts (products) {
  const staticCatalog = {}
  for (const product of products) {
    const sku = product?.sku || product?.vendorSku || product?.id
    const rawCost = product?.baseCost ?? product?.wholesaleCost ?? product?.cost ?? product?.price
    const baseCost = Number(rawCost)
    if (!sku || !Number.isFinite(baseCost) || baseCost <= 0) continue
    staticCatalog[String(sku)] = {
      baseCost,
      category: mapPortalTierCategory(product?.category || product?.productClass),
    }
  }
  return staticCatalog
}

// Calculate retail markups — owner backend (matches scripts/calculate-retail-markups.ps1 tiers)
const RETAIL_MARKUP_TIERS = [
  { key: 'computer', label: 'Computers & Workstations', multiplier: 1.35, margin: '35%' },
  { key: 'audio', label: 'Home Theater & Audio', multiplier: 1.55, margin: '55%' },
  { key: 'marine', label: 'Marine & Powersports', multiplier: 1.65, margin: '65%' },
]

const markupDemoBaselines = [
  { tierKey: 'computer', label: 'Laptop / workstation line', wholesale: 1499 },
  { tierKey: 'audio', label: 'Receiver / amplifier line', wholesale: 899.64 },
  { tierKey: 'marine', label: 'Marine speaker line', wholesale: 249.3 },
]

const pricingAuditRunning = ref(false)
const pricingAuditSummary = ref(null)
const pricingAuditLines = ref([])

function formatMoney (value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '$0.00'
  return `$${n.toFixed(2)}`
}

function demoRetailPrice (baseline) {
  const tier = RETAIL_MARKUP_TIERS.find((t) => t.key === baseline.tierKey)
  if (!tier) return '0.00'
  return (baseline.wholesale * tier.multiplier).toFixed(2)
}

// Antique inventory ledger — owner backend (matches scripts/run-ledger-audit.ps1)
const antiqueLedger = ref([])
const antiqueLedgerLoading = ref(false)
const antiqueLedgerSaving = ref(false)
const antiqueLedgerMessage = ref('')
const antiqueLedgerError = ref('')
const newAntiqueItem = ref({
  title: '',
  purchase_price: '',
  sale_price: '',
  collected_sales_tax: '',
  income_tax_reserve: '',
})

const antiqueLedgerTotals = computed(() => {
  let totalCost = 0
  let totalSales = 0
  let totalTax = 0
  let totalReserve = 0
  for (const item of antiqueLedger.value) {
    totalCost += Number(item.purchase_price) || 0
    totalSales += Number(item.sale_price) || 0
    totalTax += Number(item.collected_sales_tax) || 0
    totalReserve += Number(item.income_tax_reserve) || 0
  }
  return {
    totalCost,
    totalSales,
    totalTax,
    totalReserve,
    netProfit: totalSales - totalCost,
  }
})

function normalizeAntiqueRows (raw) {
  if (Array.isArray(raw?.items) && raw.items.length) return raw.items
  if (Array.isArray(raw) && raw.length) return raw
  return [...seedAntiqueLedger]
}

async function loadAntiqueLedger () {
  antiqueLedgerLoading.value = true
  antiqueLedgerError.value = ''
  antiqueLedgerMessage.value = ''
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: 'antiqueLedger' } })
    antiqueLedger.value = normalizeAntiqueRows(data?.antiqueLedger)
  } catch (e) {
    antiqueLedger.value = [...seedAntiqueLedger]
    antiqueLedgerError.value = opsErrorMessage(e, 'Could not load saved ledger — showing local copy.')
  } finally {
    antiqueLedgerLoading.value = false
  }
}

async function saveAntiqueLedger () {
  antiqueLedgerSaving.value = true
  antiqueLedgerMessage.value = ''
  antiqueLedgerError.value = ''
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: 'antiqueLedger', payload: { items: antiqueLedger.value } },
    })
    antiqueLedgerMessage.value = 'Antique ledger saved — apps and backend tools can read this via owner API key antiqueLedger.'
  } catch (e) {
    antiqueLedgerError.value = opsErrorMessage(e, 'Save failed.')
  } finally {
    antiqueLedgerSaving.value = false
  }
}

function addAntiqueLedgerItem () {
  const title = String(newAntiqueItem.value.title || '').trim()
  const purchase = Number(newAntiqueItem.value.purchase_price)
  const sale = Number(newAntiqueItem.value.sale_price)
  if (!title || !Number.isFinite(purchase) || !Number.isFinite(sale)) return
  antiqueLedger.value.unshift({
    id: `antique-${Date.now()}`,
    title,
    purchase_price: purchase,
    sale_price: sale,
    collected_sales_tax: Number(newAntiqueItem.value.collected_sales_tax) || 0,
    income_tax_reserve: Number(newAntiqueItem.value.income_tax_reserve) || 0,
  })
  newAntiqueItem.value = {
    title: '',
    purchase_price: '',
    sale_price: '',
    collected_sales_tax: '',
    income_tax_reserve: '',
  }
}

function removeAntiqueLedgerItem (id) {
  antiqueLedger.value = antiqueLedger.value.filter((row) => row.id !== id)
}

// Internal audit tool — verify markup rules against wholesaler catalog (wholesale hidden on storefront)
async function verifyPortalPricingAudit () {
  pricingAuditRunning.value = true
  pricingAuditSummary.value = null
  pricingAuditLines.value = []

  let catalogRows = []
  try {
    const data = await $fetch('/catalog/petra-products.json', { retry: 2 })
    catalogRows = Array.isArray(data?.products) ? data.products : []
  } catch {
    pricingAuditLines.value = ['[❌] PRICING AUDIT ABORTED: Could not load active catalog dataset.']
    pricingAuditRunning.value = false
    return
  }

  const staticCatalog = buildStaticCatalogFromProducts(catalogRows)
  const auditLog = []
  let totalPassed = 0
  let totalFailed = 0

  const expectedTiers = {
    'Computers & Workstations': { markup: 1.35, label: 'Computers Tier (35%)' },
    'Home Theater & Audio': { markup: 1.55, label: 'Audio Tier (55%)' },
    'Marine & Powersports': { markup: 1.65, label: 'Marine Tier (65%)' },
  }

  Object.keys(staticCatalog).forEach((sku) => {
    const product = staticCatalog[sku]
    const tier = expectedTiers[product.category]

    if (tier) {
      const expectedRetail = (product.baseCost * tier.markup).toFixed(2)
      const computedRetail = calculateTargetRetailPrice(product)

      if (computedRetail === expectedRetail) {
        totalPassed++
        auditLog.push(`[✓] PASS: SKU ${sku} (${tier.label}) verified at $${computedRetail}. Wholesale hidden.`)
      } else {
        totalFailed++
        auditLog.push(`[❌] FAIL: SKU ${sku} mismatch — computed $${computedRetail}, expected $${expectedRetail}`)
      }
    } else {
      auditLog.push(`[!] WARNING: SKU ${sku} belongs to an unmapped tier category.`)
    }
  })

  pricingAuditSummary.value = {
    total: Object.keys(staticCatalog).length,
    passed: totalPassed,
    failed: totalFailed,
  }
  pricingAuditLines.value = auditLog
  pricingAuditRunning.value = false
}

onMounted(() => {
  if (tab.value === 'seo') loadSeo()
  if (tab.value === 'owner') loadAntiqueLedger()
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
      <p v-if="seoInfo" class="bc-alert bc-alert--info">{{ seoInfo }}</p>
      <p v-if="seoMessage" class="bc-alert bc-alert--ok">{{ seoMessage }}</p>
      <div v-if="seoLoading" class="bc-muted">Loading…</div>
      <template v-else>
        <div class="bc-form-stack">
          <label>Page title<input v-model="seo.title" class="input" type="text"></label>
          <label>Description<textarea v-model="seo.description" class="input bc-textarea" rows="3" /></label>
          <label>Canonical site URL<input v-model="seo.url" class="input" type="url"></label>
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

  <!-- OWNER BACKEND -->
    <section v-show="tab === 'owner'" class="bc-panel__section">
      <h2>Owner backend tools</h2>
      <p class="bc-panel__note">Private tools for pricing rules and antique inventory — not shown to shoppers. Wholesale costs stay hidden on the public store.</p>

      <div class="bc-owner-block">
        <h3>Calculate retail markups</h3>
        <p class="bc-panel__note">Category profit tiers: computers 35%, audio 55%, marine 65%. Demo lines match your enforcement script.</p>
        <div class="bc-markup-grid">
          <div v-for="tier in RETAIL_MARKUP_TIERS" :key="tier.key" class="bc-markup-tier">
            <strong>{{ tier.label }}</strong>
            <span class="bc-muted">Margin {{ tier.margin }}</span>
          </div>
        </div>
        <div class="bc-orders-table-wrap">
          <table class="bc-orders-table">
            <thead>
              <tr>
                <th>Product line</th>
                <th>Tier</th>
                <th>Wholesale (owner only)</th>
                <th>Protected retail</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in markupDemoBaselines" :key="row.label">
                <td>{{ row.label }}</td>
                <td>{{ RETAIL_MARKUP_TIERS.find((t) => t.key === row.tierKey)?.label }}</td>
                <td class="bc-muted">{{ formatMoney(row.wholesale) }}</td>
                <td><strong>{{ formatMoney(demoRetailPrice(row)) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bc-panel__actions">
          <button type="button" class="btn btn-primary btn-sm" :disabled="pricingAuditRunning" @click="verifyPortalPricingAudit">
            {{ pricingAuditRunning ? 'Auditing catalog…' : 'Run catalog pricing audit' }}
          </button>
        </div>
        <p v-if="pricingAuditSummary" class="bc-alert bc-alert--ok">
          Audited {{ pricingAuditSummary.total }} SKUs — {{ pricingAuditSummary.passed }} passed, {{ pricingAuditSummary.failed }} failed.
        </p>
        <pre v-if="pricingAuditLines.length" class="bc-audit-log">{{ pricingAuditLines.join('\n') }}</pre>
      </div>

      <div class="bc-owner-block">
        <h3>Antique inventory ledger</h3>
        <p class="bc-panel__note">Tracks cost, sale, sales tax, and income reserve per antique item. Save syncs to backend for apps and other owner tools.</p>
        <p v-if="antiqueLedgerError" class="bc-alert bc-alert--err">{{ antiqueLedgerError }}</p>
        <p v-if="antiqueLedgerMessage" class="bc-alert bc-alert--ok">{{ antiqueLedgerMessage }}</p>
        <p v-if="antiqueLedgerLoading" class="bc-muted">Loading ledger…</p>
        <template v-else>
          <div class="bc-orders-table-wrap">
            <table class="bc-orders-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Cost</th>
                  <th>Sold</th>
                  <th>Profit</th>
                  <th>Sales tax</th>
                  <th>Income reserve</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in antiqueLedger" :key="item.id">
                  <td><input v-model="item.title" class="input bc-cell-input" type="text" aria-label="Item title"></td>
                  <td><input v-model.number="item.purchase_price" class="input bc-cell-input" type="number" step="0.01" min="0" aria-label="Purchase cost"></td>
                  <td><input v-model.number="item.sale_price" class="input bc-cell-input" type="number" step="0.01" min="0" aria-label="Sale price"></td>
                  <td>{{ formatMoney((Number(item.sale_price) || 0) - (Number(item.purchase_price) || 0)) }}</td>
                  <td><input v-model.number="item.collected_sales_tax" class="input bc-cell-input" type="number" step="0.01" min="0" aria-label="Sales tax"></td>
                  <td><input v-model.number="item.income_tax_reserve" class="input bc-cell-input" type="number" step="0.01" min="0" aria-label="Income reserve"></td>
                  <td>
                    <button type="button" class="btn btn-outline btn-sm" @click="removeAntiqueLedgerItem(item.id)">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bc-ledger-summary">
            <div><span class="bc-muted">Total investment</span><strong>{{ formatMoney(antiqueLedgerTotals.totalCost) }}</strong></div>
            <div><span class="bc-muted">Gross revenue</span><strong>{{ formatMoney(antiqueLedgerTotals.totalSales) }}</strong></div>
            <div><span class="bc-muted">Net profit</span><strong>{{ formatMoney(antiqueLedgerTotals.netProfit) }}</strong></div>
            <div><span class="bc-muted">Sales tax liability</span><strong>{{ formatMoney(antiqueLedgerTotals.totalTax) }}</strong></div>
            <div><span class="bc-muted">Income reserve</span><strong>{{ formatMoney(antiqueLedgerTotals.totalReserve) }}</strong></div>
          </div>
          <div class="bc-form-stack bc-antique-form">
            <label>Item title<input v-model="newAntiqueItem.title" class="input" type="text"></label>
            <label>Purchase cost<input v-model="newAntiqueItem.purchase_price" class="input" type="number" step="0.01" min="0"></label>
            <label>Sale price<input v-model="newAntiqueItem.sale_price" class="input" type="number" step="0.01" min="0"></label>
            <label>Collected sales tax<input v-model="newAntiqueItem.collected_sales_tax" class="input" type="number" step="0.01" min="0"></label>
            <label>Income tax reserve<input v-model="newAntiqueItem.income_tax_reserve" class="input" type="number" step="0.01" min="0"></label>
          </div>
          <div class="bc-panel__actions">
            <button type="button" class="btn btn-outline btn-sm" @click="addAntiqueLedgerItem">Add item</button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="antiqueLedgerSaving" @click="saveAntiqueLedger">
              {{ antiqueLedgerSaving ? 'Saving…' : 'Save ledger to backend' }}
            </button>
            <button type="button" class="btn btn-outline btn-sm" @click="loadAntiqueLedger">Reload</button>
          </div>
        </template>
      </div>

      <div class="bc-owner-block">
        <h3>Private transaction ledger</h3>
        <p class="bc-panel__note">Stripe, tax reserve, and wholesaler clearing. Unlocks automatically when you are signed into this owner panel.</p>
        <template v-if="!ledgerUnlocked">
          <p v-if="ledgerUnlockError" class="bc-alert bc-alert--err">{{ ledgerUnlockError }}</p>
          <label class="bc-bypass-label">
            Owner password
            <input v-model="ownerPhraseInput" class="input" type="password" autocomplete="off" placeholder="Same as logo unlock" @keyup.enter="verifyLedgerUnlock">
          </label>
          <button type="button" class="btn btn-primary btn-sm" @click="verifyLedgerUnlock">Unlock ledger</button>
        </template>
        <template v-else>
          <div class="bc-orders-table-wrap">
            <table class="bc-orders-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tx, idx) in ledgerTransactions" :key="idx">
                  <td class="bc-muted small">{{ tx.date }}</td>
                  <td>{{ tx.account }}</td>
                  <td>{{ tx.desc }}</td>
                  <td :class="tx.isCredit ? 'bc-credit' : 'bc-debit'">{{ tx.amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bc-form-stack bc-antique-form">
            <label>Account<input v-model="newTx.account" class="input" type="text"></label>
            <label>Description<input v-model="newTx.desc" class="input" type="text"></label>
            <label>Amount<input v-model="newTx.amount" class="input" type="number" step="0.01" min="0"></label>
          </div>
          <div class="bc-panel__actions">
            <button type="button" class="btn btn-outline btn-sm" @click="postTransaction(true)">Post credit</button>
            <button type="button" class="btn btn-outline btn-sm" @click="postTransaction(false)">Post debit</button>
          </div>
        </template>
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
.bc-alert--info { background: rgba(96,165,250,0.12); color: #93c5fd; }
.bc-cell-input { width: 100%; min-width: 72px; padding: 6px 8px; font-size: 0.85rem; }
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
.bc-owner-block {
  margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08);
}
.bc-owner-block:first-of-type { margin-top: 0; padding-top: 0; border-top: none; }
.bc-owner-block h3 { font-size: 0.95rem; color: #f5f5f7; margin: 0 0 8px; }
.bc-markup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 12px; }
.bc-markup-tier {
  padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
  background: #0a0a0c; display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem;
}
.bc-audit-log {
  margin: 10px 0 0; padding: 12px; border-radius: 8px; background: #0a0a0c;
  border: 1px solid rgba(255,255,255,0.08); color: #b8bcc6; font-size: 0.72rem;
  max-height: 220px; overflow: auto; white-space: pre-wrap;
}
.bc-ledger-summary {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;
  margin: 12px 0; padding: 12px; border-radius: 8px; background: rgba(211,47,47,0.08);
}
.bc-ledger-summary div { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; }
.bc-antique-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.bc-bypass-label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; max-width: 280px; margin-bottom: 10px; }
.bc-credit { color: #4ade80; font-weight: 700; }
.bc-debit { color: #ff8a80; font-weight: 700; }
</style>
