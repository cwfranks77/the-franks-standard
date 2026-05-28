<template>
  <div class="import-page">
    <div class="container narrow">
      <h1>Import inventory</h1>
      <p class="lead text-muted">
        Easiest: save your eBay active listings page and upload it here (no developer account).
        Or use CSV from Seller Hub. Review, then publish on The Franks Standard with Stripe escrow.
      </p>

      <div class="tabs">
        <button type="button" class="tab" :class="{ active: tab === 'ebay' }" @click="tab = 'ebay'">eBay (easy)</button>
        <button type="button" class="tab" :class="{ active: tab === 'csv' }" @click="tab = 'csv'">CSV upload</button>
      </div>

      <div v-if="tab === 'ebay'" class="card panel easy-panel">
        <h2>Easy import (2 minutes)</h2>
        <ol class="easy-steps text-muted small">
          <li>
            <a
              v-if="ebayUsername.trim()"
              class="btn btn-primary btn-sm"
              :href="ebayStoreUrl"
              target="_blank"
              rel="noopener noreferrer"
            >Open your eBay store ↗</a>
            <span v-else>Enter your eBay username below, then open your store.</span>
            Scroll until listings show.
          </li>
          <li><strong>Ctrl+S</strong> → save as <strong>Webpage, HTML only</strong>.</li>
          <li>Upload that file in the box below (we read it in your browser — eBay cannot block this).</li>
        </ol>
        <input type="file" accept=".html,.htm,text/html" class="file-block" @change="onEbayHtmlFile" />

        <details class="ebay-fallback mt-2">
          <summary>Optional: username preview (needs server eBay API keys)</summary>
        <p class="text-muted small">
          Enter your eBay seller username and click <strong>Preview listings</strong> when API keys are configured.
        </p>
        <div class="form-row">
          <input
            v-model="ebayUsername"
            class="input"
            placeholder="e.g. your_ebay_store_name"
            autocomplete="off"
          />
          <button type="button" class="btn btn-primary" :disabled="previewLoading" @click="loadEbay">
            {{ previewLoading ? 'Loading…' : 'Preview listings' }}
          </button>
          <a
            v-if="ebayUsername.trim()"
            class="btn btn-outline btn-sm"
            :href="ebayStoreUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Open eBay store ↗</a>
        </div>
        <p v-if="previewError" class="error-text">{{ previewError }}</p>

        </details>
      </div>

      <div v-else class="card panel">
        <h2>CSV file</h2>
        <p class="text-muted small">
          Upload a CSV export. We support eBay exports and most supplier exports (Doba / Inventory Source) as long as it includes a Title/Name,
          a Retail/Price column, and a Supplier SKU.
        </p>
        <input type="file" accept=".csv,text/csv" @change="onCsvFile" />
        <label class="check-row mt-2">
          <input v-model="isDropshipCsv" type="checkbox" />
          This CSV is dropship inventory (Doba) — import as dropship drafts
        </label>
        <p v-if="isDropshipCsv" class="text-muted small">
          Dropship imports require a <strong>Supplier SKU</strong> per row. Wholesale cost is optional (recommended for accurate payout splits).
        </p>
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
          <label class="check-row">
            <input v-model="publishNow" type="checkbox" />
            Publish immediately (otherwise save as drafts)
          </label>
          <label class="check-row">
            <input v-model="useGuarantee" type="checkbox" />
            Use Franks Standard signed guarantee (required for public listings)
          </label>
          <div v-if="useGuarantee" class="form-group">
            <label class="label">Legal name (for guarantee)</label>
            <input v-model="sellerLegalName" class="input" placeholder="Your full legal name" />
          </div>
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
        <NuxtLink to="/sell">Manual listing</NuxtLink>
        ·
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'requires-auth' })

useSeoMeta({
  title: 'Import inventory — The Franks Standard',
  description: 'Import listings from eBay or CSV into The Franks Standard marketplace.',
})

const tab = ref('ebay')
const ebayUsername = ref('')
const publishNow = ref(false)
const useGuarantee = ref(true)
const sellerLegalName = ref('')
const importResult = ref(null)
const isDropshipCsv = ref(false)

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
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    previewEbayFromHtml(reader.result, 60)
  }
  reader.readAsText(file)
}

function onCsvFile (e) {
  importResult.value = null
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const items = parseInventoryCsv(reader.result)
    if (!items.length) {
      previewError.value = 'No rows found — check CSV headers (Title, Price, PicURL).'
      return
    }
    setCsvPreview(items)
  }
  reader.readAsText(file)
}

function selectAll (on) {
  previewItems.value.forEach((i) => { i.selected = on })
}

async function runImport () {
  importResult.value = null
  if (useGuarantee.value && !sellerLegalName.value.trim()) {
    alert('Enter your legal name for the signed guarantee, or turn off guarantee (you will need COA before publishing).')
    return
  }
  try {
    const coaType = useGuarantee.value ? 'guarantee' : 'upload'
    importResult.value = await importSelected({
      publish: publishNow.value,
      coaType,
      guaranteeSigned: useGuarantee.value,
      sellerLegalName: sellerLegalName.value.trim(),
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
.file-block { display: block; margin-top: 10px; }
</style>
