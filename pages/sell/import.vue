<template>
  <div class="import-page">
    <div class="container narrow">
      <h1>AI inventory transfer</h1>
      <p class="lead text-muted">
        <strong>Move your catalog from eBay or CSV</strong> — titles, prices, and image URLs map in. Collectible categories need uploaded COA or Franks COA before publish; general merchandise does not. Off-platform contact or payment links are blocked automatically.
      </p>

      <div v-if="policyLoading" class="text-muted">Loading seller requirements…</div>
      <SellerPolicyAgreement v-else-if="needsPolicyAcceptance" @accepted="onPoliciesAccepted" />
      <template v-else>
      <div class="tabs">
        <button type="button" class="tab" :class="{ active: tab === 'csv' }" @click="tab = 'csv'">eBay CSV (best)</button>
        <button type="button" class="tab" :class="{ active: tab === 'ebay' }" @click="tab = 'ebay'">eBay HTML</button>
      </div>

      <div v-if="tab === 'csv'" class="card panel csv-panel">
        <h2>eBay Seller Hub → CSV (recommended)</h2>
        <ol class="easy-steps text-muted small">
          <li>Go to <a href="https://www.ebay.com/sh/reports/downloads" target="_blank" rel="noopener noreferrer">eBay Seller Hub downloads ↗</a></li>
          <li>Download <strong>Active listings</strong> (CSV file).</li>
          <li>Upload that file below — titles and prices import reliably.</li>
        </ol>
        <label class="upload-zone">
          <span class="upload-zone-title">Choose your eBay .csv file</span>
          <input type="file" accept=".csv,text/csv" class="upload-zone-input" @change="onCsvFile" />
        </label>
        <p v-if="csvUploadStatus" class="import-status">{{ csvUploadStatus }}</p>
        <label class="check-row mt-2">
          <input v-model="isDropshipCsv" type="checkbox" />
          This CSV is dropship inventory (Doba) — import as dropship drafts
        </label>
        <p v-if="isDropshipCsv" class="text-muted small">
          Dropship imports require a <strong>Supplier SKU</strong> per row. Wholesale cost is optional (recommended for accurate payout splits).
        </p>
        <p class="text-muted small mt-1">Also works: Doba / supplier CSV with Title and Price columns.</p>
      </div>

      <div v-else class="card panel easy-panel">
        <h2>eBay HTML (backup)</h2>
        <p class="text-muted small">If CSV fails, save your store page after listings load.</p>
        <div class="form-row">
          <input
            v-model="ebayUsername"
            class="input"
            placeholder="Your eBay username"
            autocomplete="off"
          />
          <a
            v-if="ebayUsername.trim()"
            class="btn btn-primary btn-sm"
            :href="ebayStoreUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Open store ↗</a>
        </div>
        <ol class="easy-steps text-muted small">
          <li>Scroll until all listings show. Wait 5 seconds.</li>
          <li><strong>Ctrl+S</strong> → <strong>Webpage, Complete</strong> (not HTML only).</li>
          <li>Upload below or paste HTML in Notepad copy.</li>
        </ol>
        <label class="upload-zone">
          <span class="upload-zone-title">Choose saved .html file</span>
          <input type="file" accept=".html,.htm,text/html" class="upload-zone-input" @change="onEbayHtmlFile" />
        </label>
        <details class="mt-1">
          <summary>Paste HTML instead</summary>
          <textarea v-model="htmlPaste" class="input paste-area" rows="5" />
          <button type="button" class="btn btn-outline btn-sm" :disabled="!htmlPaste.trim()" @click="parseHtmlPaste">Parse pasted HTML</button>
        </details>
        <p v-if="ebayUploadStatus" class="import-status">{{ ebayUploadStatus }}</p>
        <p v-if="previewError" class="error-text">{{ previewError }}</p>
      </div>

      <div v-if="previewItems.length" class="card panel mt-3">
        <div class="panel-head">
          <h2>{{ previewItems.length }} items</h2>
          <div class="panel-actions">
            <button type="button" class="btn btn-outline btn-sm" @click="selectAll(true)">Select all</button>
            <button type="button" class="btn btn-outline btn-sm" @click="selectAll(false)">Clear</button>
          </div>
        </div>

        <ul class="item-list">
          <li v-for="(item, idx) in previewItems" :key="item.external_id || idx" class="item-row">
            <label class="item-check">
              <input v-model="item.selected" type="checkbox" />
              <img v-if="item.image_url" :src="item.image_url" alt="" class="thumb" />
              <span v-else class="thumb placeholder">📦</span>
              <span class="item-meta">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-sub">
                  {{ item.price != null ? `$${item.price}` : 'No price — fix in CSV or skip' }}
                  <span v-if="item.external_id"> · ID {{ item.external_id }}</span>
                  <span v-if="isDropshipCsv && item.supplier_sku"> · SKU {{ item.supplier_sku }}</span>
                  <span v-if="isDropshipCsv && item.wholesale_cost != null"> · Cost ${{ item.wholesale_cost }}</span>
                </span>
              </span>
            </label>
          </li>
        </ul>

        <div class="import-options">
          <h3>Import options</h3>
          <div class="form-group">
            <label class="label">Default category for imported rows</label>
            <select v-model="importCategory" class="select">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <p class="text-muted small">
              {{ importNeedsCoa ? 'Collectible category — add uploaded COA or Franks COA on each listing before publish.' : 'General merchandise — no COA required.' }}
            </p>
          </div>
          <label class="check-row">
            <input v-model="publishNow" type="checkbox" />
            Publish immediately (otherwise save as drafts)
          </label>
          <p v-if="importNeedsCoa && publishNow" class="text-muted small">
            Collectible rows import as drafts until COA proof is added — publish now only works when proof is on file.
          </p>
        </div>

        <button
          type="button"
          class="btn btn-primary btn-lg"
          style="width:100%;margin-top:1rem"
          :disabled="importLoading"
          @click="runImport"
        >
          {{ importLoading ? 'Importing…' : 'Import selected' }}
        </button>

        <p v-if="importResult" class="result-text" role="status">
          Created {{ importResult.created }}, skipped {{ importResult.skipped }}, failed {{ importResult.failed }}.
          <span v-if="importResult.errors?.length"><br>{{ importResult.errors.slice(0, 3).join(' · ') }}</span>
        </p>
      </div>

      <div class="card panel buyer-box mt-3">
        <h2>For buyers switching from eBay</h2>
        <p class="text-muted">
          Search and buy on The Franks Standard — checkout holds funds in escrow until you confirm the item.
          Do not send PayPal “friends &amp; family” for listings you found here.
        </p>
        <NuxtLink to="/sellers/switch" class="btn btn-outline btn-sm">Switching guide</NuxtLink>
        <NuxtLink to="/browse" class="btn btn-primary btn-sm">Browse listings</NuxtLink>
      </div>

      <p class="text-muted small mt-3">
        <NuxtLink to="/sell/start">Manual listing</NuxtLink>
        ·
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { LISTING_CATEGORIES, categoryRequiresCoa } from '~/utils/marketplaceCategories'

definePageMeta({ middleware: 'requires-auth' })

const categories = LISTING_CATEGORIES
const importCategory = ref('General Merchandise')
const importNeedsCoa = computed(() => categoryRequiresCoa(importCategory.value))

const {
  needsAcceptance: needsPolicyAcceptance,
  loading: policyLoading,
  loadStatus: loadPolicyStatus,
} = useSellerPolicyAcceptance()

async function onPoliciesAccepted () {
  await loadPolicyStatus()
}

onMounted(() => loadPolicyStatus())

useSeoMeta({
  title: 'Import inventory — The Franks Standard',
  description: 'Import listings from eBay or CSV into The Franks Standard marketplace.',
})

const tab = ref('csv')
const htmlPaste = ref('')
const csvUploadStatus = ref('')
const ebayUsername = ref('')
const publishNow = ref(false)
const importResult = ref(null)
const isDropshipCsv = ref(false)
const ebayUploadStatus = ref('')

const {
  previewLoading,
  importLoading,
  previewError,
  previewItems,
  previewEbaySeller,
  previewEbayFromHtml,
  setCsvPreview,
  importSelected,
  parseInventoryCsv,
} = useInventoryImport()

const ebayStoreUrl = computed(() => {
  const u = ebayUsername.value.trim().replace(/^@/, '')
  if (!u) return 'https://www.ebay.com/'
  return `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(u)}&_ipg=120&rt=nc`
})

async function loadEbay () {
  importResult.value = null
  await previewEbaySeller(ebayUsername.value.trim())
}

function onEbayHtmlFile (e) {
  importResult.value = null
  const file = e.target.files?.[0]
  if (!file) {
    ebayUploadStatus.value = 'No file selected.'
    return
  }
  ebayUploadStatus.value = `Got it: ${file.name} — reading…`
  const reader = new FileReader()
  reader.onload = () => {
    const { hint } = previewEbayFromHtml(reader.result, 80)
    const n = previewItems.value.length
    ebayUploadStatus.value = n > 0
      ? `Done — ${n} items below. Select rows → Import selected.`
      : (hint || previewError.value || '0 items — use eBay CSV tab instead.')
  }
  reader.onerror = () => { ebayUploadStatus.value = 'Could not read file.' }
  reader.readAsText(file)
}

function parseHtmlPaste () {
  importResult.value = null
  ebayUploadStatus.value = 'Parsing pasted HTML…'
  const { hint } = previewEbayFromHtml(htmlPaste.value, 80)
  const n = previewItems.value.length
  ebayUploadStatus.value = n > 0 ? `Done — ${n} items.` : (hint || '0 items — use CSV tab.')
}

function onCsvFile (e) {
  importResult.value = null
  const file = e.target.files?.[0]
  if (!file) {
    csvUploadStatus.value = 'No file selected.'
    return
  }
  csvUploadStatus.value = `Reading ${file.name}…`
  const reader = new FileReader()
  reader.onload = () => {
    const items = parseInventoryCsv(reader.result)
    if (!items.length) {
      previewError.value = 'No rows found — need columns like Title and Price (eBay Active listings export).'
      csvUploadStatus.value = previewError.value
      return
    }
    setCsvPreview(items)
    csvUploadStatus.value = `Done — ${items.length} rows. Scroll down → Import selected.`
  }
  reader.readAsText(file)
}

function selectAll (on) {
  previewItems.value.forEach((i) => { i.selected = on })
}

async function runImport () {
  importResult.value = null
  const needsCoa = categoryRequiresCoa(importCategory.value)
  if (needsCoa && publishNow.value) {
    alert('Collectible imports cannot publish immediately without COA on file. Uncheck “Publish immediately” or use General Merchandise.')
    return
  }
  try {
    const coaType = needsCoa ? 'upload' : 'none'
    importResult.value = await importSelected({
      publish: publishNow.value,
      coaType,
      guaranteeSigned: false,
      sellerLegalName: '',
      defaultCategory: importCategory.value,
      importSource: tab.value === 'ebay' ? 'ebay' : (isDropshipCsv.value ? 'doba_csv' : 'csv'),
      listingMode: tab.value === 'csv' && isDropshipCsv.value ? 'dropship' : 'direct',
      dropshipProviderKey: tab.value === 'csv' && isDropshipCsv.value ? 'doba' : '',
      dropshipProviderName: tab.value === 'csv' && isDropshipCsv.value ? 'Doba' : '',
    })
    if (importResult.value.created > 0) {
      await navigateTo('/dashboard')
    }
  } catch (e) {
    alert(e.message || 'Import failed')
  }
}
</script>

<style scoped>
.import-page { padding: 48px 16px 80px; }
.narrow { max-width: 720px; margin: 0 auto; }
.lead { line-height: 1.6; margin-bottom: 1.5rem; }
.tabs { display: flex; gap: 8px; margin-bottom: 1rem; }
.tab {
  padding: 8px 16px;
  border: 1px solid var(--border, #333);
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
}
.tab.active { border-color: var(--gold); color: var(--gold); }
.panel { padding: 1.25rem; margin-bottom: 1rem; }
.panel h2 { font-size: 1.1rem; color: var(--gold); margin-bottom: 0.5rem; }
.form-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 0.75rem; }
.form-row .input { flex: 1; min-width: 200px; }
.error-text { color: #f87171; margin-top: 0.75rem; }
.panel-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.panel-actions { display: flex; gap: 8px; }
.item-list { list-style: none; padding: 0; margin: 1rem 0 0; max-height: 420px; overflow-y: auto; }
.item-row { border-bottom: 1px solid rgba(255,255,255,0.08); }
.item-check { display: flex; align-items: center; gap: 12px; padding: 10px 0; cursor: pointer; }
.thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 4px; }
.thumb.placeholder { display:flex;align-items:center;justify-content:center;background:#1f2937;font-size:1.5rem; }
.item-meta { display: flex; flex-direction: column; gap: 4px; }
.item-title { font-weight: 600; line-height: 1.3; }
.item-sub { font-size: 0.85rem; color: #9ca3af; }
.import-options { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); }
.check-row { display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
.result-text { margin-top: 1rem; color: var(--gold); }
.buyer-box h2 { font-size: 1rem; }
.mt-3 { margin-top: 1.25rem; }
.mt-2 { margin-top: 0.75rem; }
.small { font-size: 0.9rem; }
.ebay-fallback {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.ebay-fallback summary { cursor: pointer; font-weight: 600; color: var(--gold); }
.ebay-fallback ol { margin: 0.5rem 0; padding-left: 1.2rem; line-height: 1.55; }
.easy-panel { border-color: rgba(247, 202, 0, 0.35); }
.easy-panel h2 { color: var(--gold); }
.easy-steps { line-height: 1.65; padding-left: 1.2rem; margin: 0.75rem 0; }
.easy-steps li { margin-bottom: 0.65rem; }
.upload-zone {
  display: block;
  position: relative;
  padding: 1.5rem 1rem;
  margin-top: 10px;
  border: 2px dashed rgba(247, 202, 0, 0.5);
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
}
.upload-zone-title { color: var(--gold); font-weight: 700; }
.upload-zone-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.csv-panel h2 { color: var(--gold); }
.paste-area { width: 100%; margin-top: 8px; min-height: 100px; }
.import-status {
  margin-top: 12px;
  padding: 0.85rem 1rem;
  background: rgba(247, 202, 0, 0.15);
  border: 1px solid rgba(247, 202, 0, 0.45);
  border-radius: 8px;
  color: #fef3c7;
  font-size: 0.95rem;
}
</style>
