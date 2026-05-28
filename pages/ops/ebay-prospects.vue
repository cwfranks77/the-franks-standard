<template>
  <div class="prospect-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Find eBay sellers (easy mode)</h1>
      <p class="lead text-muted">
        Save an eBay search page, upload it here (or paste HTML). We list seller usernames for outreach.
      </p>
      <p class="page-id text-muted small">You are on: <strong>Find eBay sellers</strong> (not Import inventory).</p>

      <section class="card panel easy-hero">
        <h2>Upload your saved eBay page</h2>

        <label
          class="upload-zone"
          :class="{ 'upload-zone--drag': dragOver }"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
        >
          <span class="upload-zone-title">Tap or click here to choose your .html file</span>
          <span class="upload-zone-sub">Windows may open a file picker — or drag the file onto this box.</span>
          <input
            ref="fileInput"
            type="file"
            accept=".html,.htm,text/html"
            class="upload-zone-input"
            @change="onHtmlFile"
          />
        </label>

        <details class="paste-fallback">
          <summary>File picker not opening? Paste HTML instead</summary>
          <textarea
            v-model="htmlPaste"
            class="input paste-area"
            rows="6"
            placeholder="Open your saved .html file in Notepad, Ctrl+A, Ctrl+C, paste here"
          />
          <button type="button" class="btn btn-outline btn-sm mt-1" :disabled="loading || !htmlPaste.trim()" @click="parsePaste">
            Parse pasted HTML
          </button>
        </details>

        <div v-if="uploadStatus" class="status-banner" role="status">
          {{ uploadStatus }}
        </div>
        <p v-else-if="loading" class="status-banner">Reading your file…</p>

        <div v-if="lastUpload" class="upload-report">
          <p><strong>Last file:</strong> {{ lastUpload.fileName || '(pasted HTML)' }} — {{ formatKb(lastUpload.bytes) }}</p>
          <p class="small text-muted">
            Listings in file: {{ lastUpload.itemCount }} item links · {{ lastUpload.usrCount }} seller profile links
            <span v-if="lastUpload.hasSItem || lastUpload.hasSCard"> · eBay listing markup detected</span>
          </p>
        </div>
      </section>

      <section class="card panel steps-panel">
        <h2>Before you upload (on eBay)</h2>
        <ol class="easy-steps">
          <li>
            <a :href="searchUrl" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">Open eBay search ↗</a>
            Scroll until many listings show. Wait ~5 seconds.
          </li>
          <li><strong>Ctrl+S</strong> → try <strong>Webpage, Complete</strong> if <strong>HTML only</strong> gives 0 sellers.</li>
        </ol>
      </section>

      <p v-if="error" class="error-text" role="alert">{{ error }}</p>

      <section v-if="prospects.length" class="card panel results-panel">
        <div class="panel-head">
          <h2>{{ filteredProspects.length }} sellers found — you’re done</h2>
          <button type="button" class="btn btn-outline btn-sm" @click="copyCsv">
            {{ csvCopied ? 'Copied' : 'Copy CSV' }}
          </button>
        </div>
        <p class="text-muted small">
          <strong>Find on Google</strong> → IG, website, or phone. eBay username is backup only. Use Copy CSV to track who you contacted.
        </p>
        <div class="table-wrap">
          <table class="prospect-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Feedback</th>
                <th>Hits</th>
                <th>Sample</th>
                <th>Find contact</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredProspects" :key="row.username">
                <td>
                  <a :href="row.profile_url" target="_blank" rel="noopener noreferrer">{{ row.username }}</a>
                </td>
                <td>
                  <template v-if="row.feedback_pct != null">{{ row.feedback_pct }}%</template>
                  <span v-else>—</span>
                </td>
                <td>{{ row.listing_hits }}</td>
                <td class="sample">{{ row.sample_titles?.[0] || '—' }}</td>
                <td class="action-cell">
                  <a
                    :href="googleSearchUrl(row.username)"
                    class="link-sm link-google"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Google ↗</a>
                  <a :href="outreachMailto(row)" class="link-sm">Email draft</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="back-link">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
        ·
        <NuxtLink to="/sell/import">Import your listings</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { EBAY_PROSPECT_PRESETS, buildEbaySearchUrl } from '~/utils/ebaySearchUrls.js'
import { prospectsToCsv } from '~/utils/ebayProspectParse.js'
import { buildProspectOutreachMailto, buildSellerGoogleSearchUrl } from '~/utils/prospectOutreach.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Find eBay sellers — Ops', robots: 'noindex' })

const keywords = ref('sports cards PSA')
const categoryId = ref('2536')
const minFeedback = ref(0)
const csvCopied = ref(false)
const fileInput = ref(null)
const htmlPaste = ref('')
const dragOver = ref(false)
const uploadStatus = ref('')

const {
  loading,
  error: skimError,
  prospects,
  lastUpload,
  skimFromHtml,
} = useEbayProspectSkim()

const error = skimError

const searchUrl = computed(() =>
  buildEbaySearchUrl({ keywords: keywords.value, categoryId: categoryId.value, itemsPerPage: 120 }),
)

const filteredProspects = computed(() => {
  const min = Number(minFeedback.value) || 0
  return prospects.value.filter((p) => p.feedback_pct == null || p.feedback_pct >= min)
})

function formatKb (bytes) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} bytes`
  return `${(n / 1024).toFixed(1)} KB`
}

function readHtmlFile (file) {
  if (!file) {
    uploadStatus.value = 'No file selected — tap the gold box and pick your .html file again.'
    return
  }
  uploadStatus.value = `Got it: ${file.name} (${formatKb(file.size)}) — reading now…`
  const reader = new FileReader()
  reader.onload = () => {
    const { items, diag } = skimFromHtml(reader.result, 150, { fileName: file.name })
    const n = items?.length ?? 0
    if (n > 0) {
      uploadStatus.value = `Done — ${n} sellers found. Scroll down to the green table.`
    } else {
      uploadStatus.value = diag?.hint
        ? `Done — 0 sellers. ${diag.hint}`
        : 'Done — 0 sellers in that file. Re-save eBay (Webpage, Complete) and upload again.'
    }
  }
  reader.onerror = () => {
    uploadStatus.value = 'Could not read that file. Use “Paste HTML instead” below.'
  }
  reader.readAsText(file)
}

function onHtmlFile (e) {
  const file = e.target.files?.[0]
  readHtmlFile(file)
}

function onDrop (e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && /\.html?$/i.test(file.name)) {
    readHtmlFile(file)
  } else {
    error.value = 'Drop a .html or .htm file from your eBay save.'
  }
}

function parsePaste () {
  uploadStatus.value = 'Parsing pasted HTML…'
  const { items, diag } = skimFromHtml(htmlPaste.value, 150, { fileName: 'pasted.html' })
  const n = items?.length ?? 0
  uploadStatus.value = n > 0
    ? `Done — ${n} sellers found. Scroll down.`
    : (diag?.hint || 'Done — 0 sellers. Paste a fuller HTML save from Notepad.')
}

function googleSearchUrl (username) {
  return buildSellerGoogleSearchUrl(username)
}

function outreachMailto (row) {
  return buildProspectOutreachMailto(row)
}

async function copyCsv () {
  try {
    await navigator.clipboard.writeText(prospectsToCsv(filteredProspects.value))
    csvCopied.value = true
    setTimeout(() => { csvCopied.value = false }, 2500)
  } catch {}
}
</script>

<style scoped>
.prospect-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.lead { max-width: 720px; line-height: 1.6; margin: 0.75rem 0 1rem; }
.card.panel { padding: 1.25rem; margin-bottom: 1rem; }
.easy-hero { border-color: rgba(247, 202, 0, 0.35); }
.easy-hero h2 { color: var(--gold); margin-bottom: 1rem; }
.upload-zone {
  display: block;
  position: relative;
  padding: 2rem 1.25rem;
  border: 2px dashed rgba(247, 202, 0, 0.55);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  background: rgba(247, 202, 0, 0.06);
}
.upload-zone--drag { background: rgba(247, 202, 0, 0.14); border-color: var(--gold); }
.upload-zone-title { display: block; font-weight: 700; font-size: 1.05rem; color: var(--gold); }
.upload-zone-sub { display: block; margin-top: 8px; font-size: 0.88rem; color: #9ca3af; }
.upload-zone-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.paste-fallback { margin-top: 1rem; }
.paste-fallback summary { cursor: pointer; color: #93c5fd; font-size: 0.9rem; }
.paste-area { width: 100%; margin-top: 8px; font-family: inherit; min-height: 120px; }
.mt-1 { margin-top: 10px; }
.status-banner {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  background: rgba(247, 202, 0, 0.15);
  border: 1px solid rgba(247, 202, 0, 0.45);
  border-radius: 8px;
  color: #fef3c7;
  font-size: 0.95rem;
  line-height: 1.5;
}
.page-id { margin-bottom: 1rem; }
.upload-report {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  font-size: 0.9rem;
}
.steps-panel h2 { font-size: 1rem; color: var(--gold); }
.easy-steps { line-height: 1.65; padding-left: 1.2rem; margin: 0.5rem 0 0; }
.easy-steps li { margin-bottom: 0.65rem; }
.error-text { color: #f87171; padding: 0.75rem 1rem; background: rgba(248, 113, 113, 0.1); border-radius: 8px; }
.results-panel h2 { color: #86efac; }
.panel-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.table-wrap { overflow-x: auto; margin-top: 12px; }
.prospect-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.prospect-table th, .prospect-table td { padding: 8px 10px; border-bottom: 1px solid #374151; }
.sample { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.action-cell { white-space: nowrap; }
.action-cell .link-sm { margin-right: 10px; }
.link-sm { color: #93c5fd; }
.link-google { color: var(--gold); font-weight: 600; }
.back-link { margin-top: 1.5rem; }
.small { font-size: 0.85rem; }
</style>
