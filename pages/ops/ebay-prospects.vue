<template>
  <div class="prospect-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Find eBay sellers (easy mode)</h1>
      <p class="lead text-muted">
        No developer account required. Open eBay, save one page, upload it here — we pull seller names for outreach.
      </p>

      <section class="card panel easy-hero">
        <h2>Do this now (2 minutes)</h2>
        <ol class="easy-steps">
          <li>
            <a :href="searchUrl" class="btn btn-primary" target="_blank" rel="noopener noreferrer" @click="opened = true">
              Open eBay search ↗
            </a>
            Scroll so listings load (2–3 screens).
          </li>
          <li>
            Press <strong>Ctrl+S</strong> (Mac: <strong>Cmd+S</strong>) → save as <strong>Webpage, HTML only</strong>.
          </li>
          <li>
            <button type="button" class="btn btn-primary btn-lg upload-btn" @click="pickHtmlFile">
              Choose saved eBay file (.html)
            </button>
            <span class="upload-hint">A small white window is normal — that’s Windows asking which file to upload.</span>
            <input ref="fileInput" type="file" accept=".html,.htm,text/html" class="file-input-hidden" @change="onHtmlFile" />
          </li>
        </ol>
        <p v-if="loading" class="text-muted">Reading sellers from your file…</p>
      </section>

      <details class="card panel">
        <summary>Optional: niche presets (change search before step 1)</summary>
        <div class="preset-row">
          <button
            v-for="p in presets"
            :key="p.id"
            type="button"
            class="btn btn-outline btn-sm"
            @click="applyPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>
        <label class="label">Keywords</label>
        <input v-model="keywords" class="input" />
        <label class="label mt">Category ID</label>
        <input v-model="categoryId" class="input" />
      </details>

      <details class="card panel">
        <summary>Advanced: auto-skim (needs eBay developer keys in Supabase)</summary>
        <p class="text-muted small">
          Production Browse API often needs eBay approval. Until then, use easy mode above.
        </p>
        <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="runAutoSkim">
          {{ loading ? 'Working…' : 'Try API skim' }}
        </button>
        <p v-if="method === 'ebay_browse_api'" class="ok-text">API connected — {{ itemsScanned }} listings scanned</p>
      </details>

      <p v-if="error" class="error-text">{{ error }}</p>

      <section v-if="prospects.length" class="card panel">
        <div class="panel-head">
          <h2>{{ filteredProspects.length }} sellers found</h2>
          <button type="button" class="btn btn-outline btn-sm" @click="copyCsv">
            {{ csvCopied ? 'Copied' : 'Copy CSV' }}
          </button>
        </div>
        <div class="table-wrap">
          <table class="prospect-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Feedback</th>
                <th>Hits</th>
                <th>Sample</th>
                <th></th>
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
                <td>
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
import { buildProspectOutreachMailto } from '~/utils/prospectOutreach.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Find eBay sellers — Ops', robots: 'noindex' })

const presets = EBAY_PROSPECT_PRESETS
const keywords = ref('sports cards PSA')
const categoryId = ref('2536')
const minFeedback = ref(0)
const csvCopied = ref(false)
const opened = ref(false)
const fileInput = ref(null)

const {
  loading,
  error,
  prospects,
  method,
  itemsScanned,
  skimFromHtml,
  skimFromServer,
} = useEbayProspectSkim()

const searchUrl = computed(() =>
  buildEbaySearchUrl({ keywords: keywords.value, categoryId: categoryId.value, itemsPerPage: 120 }),
)

const filteredProspects = computed(() => {
  const min = Number(minFeedback.value) || 0
  return prospects.value.filter((p) => p.feedback_pct == null || p.feedback_pct >= min)
})

function applyPreset (p) {
  keywords.value = p.keywords
  categoryId.value = p.categoryId || ''
}

function pickHtmlFile () {
  fileInput.value?.click()
}

function onHtmlFile (e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => skimFromHtml(reader.result, 150)
  reader.readAsText(file)
}

async function runAutoSkim () {
  await skimFromServer({ keywords: keywords.value.trim(), categoryId: categoryId.value.trim(), limit: 80 })
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
.easy-steps { line-height: 1.7; padding-left: 1.2rem; }
.easy-steps li { margin-bottom: 1rem; }
.file-input-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
.upload-btn { margin-top: 8px; }
.upload-hint { display: block; margin-top: 10px; font-size: 0.88rem; color: #9ca3af; max-width: 520px; line-height: 1.5; }
.preset-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.label { display: block; font-size: 0.85rem; color: #9ca3af; margin-bottom: 4px; }
.mt { margin-top: 8px; }
.error-text { color: #f87171; }
.ok-text { color: #86efac; font-size: 0.9rem; }
.panel-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.table-wrap { overflow-x: auto; }
.prospect-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.prospect-table th, .prospect-table td { padding: 8px 10px; border-bottom: 1px solid #374151; }
.sample { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-sm { color: #93c5fd; }
.back-link { margin-top: 1.5rem; }
summary { cursor: pointer; color: var(--gold); font-weight: 600; }
.small { font-size: 0.88rem; }
</style>
