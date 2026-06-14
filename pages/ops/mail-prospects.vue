<template>
  <div class="mail-prospects-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Mail physical eBay sellers</h1>
      <p class="lead text-muted">
        Postcard design → find store addresses → fill CSV → send 500 via Lob. eBay never gives street addresses; you confirm each shop on Google/Maps.
      </p>

      <section class="card panel hero-panel">
        <h2>1 — Postcard design &amp; tracking</h2>
        <p class="text-muted small">
          QR points to <code>/go/postcard</code> so signups store <code>ref</code> on their profile. Use a batch id (e.g. <code>pcard500</code>) — mail CSV includes per-seller <code>campaign_ref</code> and <code>tracking_url</code>.
        </p>
        <label class="batch-label">
          Batch ref
          <input v-model="batchRef" class="input batch-input" placeholder="pcard500" />
        </label>
        <p class="text-muted small track-line">
          Default QR URL: <a :href="defaultGoUrl" target="_blank" rel="noopener noreferrer">{{ defaultGoUrl }}</a>
        </p>
        <div class="hero-actions">
          <a href="/mail/postcard-design.html" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Open postcard design ↗</a>
          <button type="button" class="btn btn-outline btn-sm" @click="copyGoUrl">{{ copyState.goUrl ? 'Copied URL' : 'Copy QR URL' }}</button>
          <button type="button" class="btn btn-outline btn-sm" @click="copyText(postcardCopy)">{{ copyState.postcard ? 'Copied' : 'Copy back text' }}</button>
        </div>
      </section>

      <section class="card panel">
        <h2>2 — Pull eBay sellers from a saved search</h2>
        <p class="text-muted small">
          Same as eBay skim: save search results as HTML, upload here. <strong>eBay Store (/str/)</strong> rows sort first — more likely brick-and-mortar.
        </p>
        <label class="upload-zone" @dragover.prevent @drop.prevent="onDrop">
          <span class="upload-zone-title">Upload eBay .html file</span>
          <input type="file" accept=".html,.htm,text/html" class="upload-zone-input" @change="onHtmlFile" />
        </label>
        <label class="filter-stores">
          <input v-model="storesOnly" type="checkbox" />
          Show eBay Store (/str/) sellers only
        </label>
        <p v-if="uploadStatus" class="status-banner">{{ uploadStatus }}</p>
        <p v-if="skimError" class="error-text">{{ skimError }}</p>
        <p v-if="displayRows.length" class="text-muted small">
          {{ displayRows.length }} sellers · {{ storeCount }} eBay stores · {{ mailReadyCount }} ready to mail (saved addresses)
        </p>
      </section>

      <section v-if="displayRows.length" class="card panel results-panel">
        <div class="panel-head">
          <h2>3 — Find physical address (per seller)</h2>
          <div class="head-btns">
            <button type="button" class="btn btn-outline btn-sm" @click="copyResearchCsv">{{ copyState.research ? 'Copied' : 'Copy research CSV' }}</button>
            <button type="button" class="btn btn-primary btn-sm" @click="copyMailCsv">{{ copyState.mail ? 'Copied' : 'Copy mail CSV' }}</button>
          </div>
        </div>
        <p class="text-muted small">
          Tap <strong>Physical ↗</strong> then <strong>Maps ↗</strong>. Paste address below when confirmed. Check <strong>Mail ready</strong> only when the street address is verified.
        </p>
        <div class="table-wrap">
          <table class="prospect-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Find store</th>
                <th>Address (you fill)</th>
                <th>Ready</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in displayRows" :key="row.username" :class="{ 'row-store': row.is_ebay_store }">
                <td class="seller-cell">
                  <a :href="row.store_url" target="_blank" rel="noopener noreferrer">{{ row.username }}</a>
                  <span v-if="row.is_ebay_store" class="store-pill">Store</span>
                  <span v-if="row.feedback_pct != null" class="fb">{{ row.feedback_pct }}%</span>
                </td>
                <td class="link-cell">
                  <a :href="physicalUrl(row.username)" class="link-physical" target="_blank" rel="noopener noreferrer">Physical ↗</a>
                  <a :href="mapsUrl(row.username)" class="link-maps" target="_blank" rel="noopener noreferrer">Maps ↗</a>
                  <a :href="contactUrl(row.username)" class="link-contact" target="_blank" rel="noopener noreferrer">Contact ↗</a>
                </td>
                <td class="addr-cell">
                  <input
                    v-model="addresses[row.username].business_name"
                    class="input input-xs"
                    placeholder="Shop name"
                    @change="persistAddresses"
                  />
                  <input
                    v-model="addresses[row.username].address_line1"
                    class="input input-xs"
                    placeholder="Street"
                    @change="persistAddresses"
                  />
                  <div class="addr-row">
                    <input
                      v-model="addresses[row.username].address_city"
                      class="input input-xs"
                      placeholder="City"
                      @change="persistAddresses"
                    />
                    <input
                      v-model="addresses[row.username].address_state"
                      class="input input-xs input-state"
                      placeholder="ST"
                      maxlength="2"
                      @change="persistAddresses"
                    />
                    <input
                      v-model="addresses[row.username].address_zip"
                      class="input input-xs input-zip"
                      placeholder="ZIP"
                      @change="persistAddresses"
                    />
                  </div>
                </td>
                <td>
                  <label class="ready-check">
                    <input
                      v-model="addresses[row.username].mail_ready"
                      type="checkbox"
                      true-value="yes"
                      false-value=""
                      @change="persistAddresses"
                    />
                    Mail
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card panel">
        <h2>Maps-first (optional)</h2>
        <p class="text-muted small">Search card/coin/comic shops in your region, then confirm they sell on eBay.</p>
        <div class="maps-queries">
          <a
            v-for="q in mapsPresets"
            :key="q.label"
            :href="q.url"
            class="btn btn-outline btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >{{ q.label }} ↗</a>
        </div>
      </section>

      <section class="card panel">
        <h2>4 — Send batch (Lob)</h2>
        <pre class="mkt-code">npm run mail:lob-batch -- --csv ./mail-ready.csv --dry-run</pre>
        <p class="text-muted small">Paste mail CSV into <code>mail-ready.csv</code>. Set <code>mail_ready=yes</code> on rows with full address. Upload postcard front to Lob → <code>LOB_POSTCARD_FRONT_URL</code>.</p>
      </section>

      <p class="back-link">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
        · <NuxtLink to="/ops/ebay-prospects">eBay skim</NuxtLink>
        · See <code>docs/OUTREACH-TRACKING.md</code> in repo
      </p>
    </div>
  </div>
</template>

<script setup>
import { mailProspectsToCsv, mailProspectsToResearchCsv } from '~/utils/mailProspectCsv.js'
import {
  buildSellerGoogleSearchUrl,
  buildSellerGooglePhysicalSearchUrl,
  buildSellerMapsSearchUrl,
} from '~/utils/sellerGoogleSearch.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Mail physical sellers — Ops', robots: 'noindex, nofollow' })

const STORAGE_KEY = 'franks-mail-addresses-v1'
const batchRef = ref('pcard500')
const { buildGoUrl, siteOrigin } = useOutreachAttribution()

const defaultGoUrl = computed(() =>
  buildGoUrl('postcard', { ref: batchRef.value || 'postcard' }),
)

const postcardCopy = `THE FRANKS STANDARD — sell where proof is required

Why shops list here (not another bazaar):
• 4–5% sale fees by plan — not ~13% stacked fees elsewhere
• Free to list your first 10 items · import from eBay in minutes
• COA or signed in-platform guarantee on every listing
• Stripe escrow — paid when buyer confirms delivery
• AI store builder, video inspect, dropship tools
• FOUNDERS10: 3 months Pro FREE (limited)

thefranksstandard.com/sell · (877) 837-0527`

const storesOnly = ref(false)
const uploadStatus = ref('')
const copyState = reactive({ postcard: false, research: false, mail: false, goUrl: false })
const addresses = ref({})

const {
  error: skimError,
  prospects,
  skimFromHtml,
} = useEbayProspectSkim()

const displayRows = computed(() => {
  let rows = prospects.value
  if (storesOnly.value) rows = rows.filter((p) => p.is_ebay_store)
  return rows
})

const storeCount = computed(() => prospects.value.filter((p) => p.is_ebay_store).length)

const mailReadyCount = computed(() => {
  return displayRows.value.filter((r) => {
    const a = addresses.value[r.username]
    return a?.mail_ready === 'yes' && a?.address_line1 && a?.address_city && a?.address_state && a?.address_zip
  }).length
})

const mapsPresets = [
  { label: 'Sports card shop', url: 'https://www.google.com/maps/search/sports+card+shop+near+Lake+Charles+LA' },
  { label: 'Coin dealer', url: 'https://www.google.com/maps/search/coin+dealer+near+Lake+Charles+LA' },
  { label: 'Comic shop', url: 'https://www.google.com/maps/search/comic+book+store+near+Lake+Charles+LA' },
  { label: 'Pawn shop', url: 'https://www.google.com/maps/search/pawn+shop+near+Lake+Charles+LA' },
  { label: 'Antique mall', url: 'https://www.google.com/maps/search/antique+mall+near+Lake+Charles+LA' },
]

function emptyAddress () {
  return {
    business_name: '',
    address_line1: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    mail_ready: '',
    notes: '',
  }
}

function ensureAddressKeys () {
  for (const row of prospects.value) {
    if (!addresses.value[row.username]) {
      addresses.value[row.username] = emptyAddress()
    }
  }
}

function loadAddresses () {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) addresses.value = { ...JSON.parse(raw) }
  } catch {
    addresses.value = {}
  }
}

function persistAddresses () {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses.value))
  } catch {}
}

function readHtmlFile (file) {
  if (!file) return
  uploadStatus.value = 'Reading file…'
  const reader = new FileReader()
  reader.onload = () => {
    const { items, diag } = skimFromHtml(String(reader.result || ''), 200, { fileName: file.name })
    ensureAddressKeys()
    uploadStatus.value = items?.length
      ? `Found ${items.length} sellers (${items.filter((p) => p.is_ebay_store).length} eBay stores).`
      : (diag?.hint || '0 sellers — try Webpage, Complete save.')
  }
  reader.readAsText(file)
}

function onHtmlFile (e) {
  readHtmlFile(e.target.files?.[0])
}

function onDrop (e) {
  const file = e.dataTransfer?.files?.[0]
  if (file && /\.html?$/i.test(file.name)) readHtmlFile(file)
}

function physicalUrl (u) { return buildSellerGooglePhysicalSearchUrl(u) }
function mapsUrl (u) { return buildSellerMapsSearchUrl(u) }
function contactUrl (u) { return buildSellerGoogleSearchUrl(u) }

async function copyText (text) {
  try {
    await navigator.clipboard.writeText(text)
    copyState.postcard = true
    setTimeout(() => { copyState.postcard = false }, 2500)
  } catch {}
}

async function copyResearchCsv () {
  try {
    await navigator.clipboard.writeText(mailProspectsToResearchCsv(displayRows.value))
    copyState.research = true
    setTimeout(() => { copyState.research = false }, 2500)
  } catch {}
}

async function copyMailCsv () {
  try {
    await navigator.clipboard.writeText(mailProspectsToCsv(displayRows.value, addresses.value, {
      batchRef: batchRef.value || 'postcard',
      siteOrigin: siteOrigin(),
    }))
    copyState.mail = true
    setTimeout(() => { copyState.mail = false }, 2500)
  } catch {}
}

async function copyGoUrl () {
  try {
    await navigator.clipboard.writeText(defaultGoUrl.value)
    copyState.goUrl = true
    setTimeout(() => { copyState.goUrl = false }, 2500)
  } catch {}
}

onMounted(() => {
  loadAddresses()
})

watch(prospects, () => {
  ensureAddressKeys()
  persistAddresses()
}, { deep: true })
</script>

<style scoped>
.mail-prospects-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.lead { max-width: 760px; line-height: 1.6; }
.card.panel { padding: 1.25rem; margin-bottom: 1rem; }
.hero-panel h2 { color: var(--gold); font-size: 1.05rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.upload-zone {
  display: block; position: relative; padding: 1.5rem;
  border: 2px dashed rgba(247, 202, 0, 0.5); border-radius: 12px;
  text-align: center; cursor: pointer; margin-top: 10px;
}
.upload-zone-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-zone-title { font-weight: 700; color: var(--gold); }
.filter-stores { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 0.9rem; }
.status-banner {
  margin-top: 12px; padding: 0.75rem 1rem;
  background: rgba(247, 202, 0, 0.12); border: 1px solid rgba(247, 202, 0, 0.4);
  border-radius: 8px; color: #fef3c7;
}
.error-text { color: #f87171; margin-top: 10px; }
.results-panel h2 { color: #86efac; font-size: 1rem; }
.panel-head { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.head-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.table-wrap { overflow-x: auto; margin-top: 12px; }
.prospect-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.prospect-table th, .prospect-table td { padding: 8px; border-bottom: 1px solid #374151; vertical-align: top; }
.row-store { background: rgba(247, 202, 0, 0.06); }
.store-pill {
  display: inline-block; margin-left: 6px; padding: 2px 6px; border-radius: 4px;
  font-size: 0.65rem; font-weight: 800; background: rgba(247, 202, 0, 0.25); color: var(--gold);
}
.fb { margin-left: 6px; color: #9ca3af; font-size: 0.75rem; }
.link-cell a { display: inline-block; margin-right: 8px; font-weight: 700; font-size: 0.78rem; }
.link-physical { color: var(--gold); }
.link-maps { color: #67e8f9; }
.link-contact { color: #93c5fd; }
.addr-cell .input-xs {
  width: 100%; margin-bottom: 4px; padding: 4px 8px; font-size: 0.78rem;
  background: #111827; border: 1px solid #374151; border-radius: 6px; color: #f3f4f6;
}
.addr-row { display: flex; gap: 4px; }
.input-state { max-width: 48px; }
.input-zip { max-width: 72px; }
.ready-check { font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
.maps-queries { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.mkt-code {
  display: block; padding: 12px; background: #0f172a; border-radius: 8px;
  font-size: 0.8rem; overflow-x: auto; color: #e2e8f0;
}
.back-link { margin-top: 1.5rem; }
.small { font-size: 0.85rem; }
.batch-label { display: block; margin: 12px 0 8px; font-size: 0.85rem; font-weight: 700; }
.batch-input {
  display: block; width: 100%; max-width: 220px; margin-top: 6px;
  padding: 8px 10px; background: #111827; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;
}
.track-line { word-break: break-all; }
.track-line a { color: var(--gold); font-weight: 700; }
</style>
