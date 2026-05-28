<template>
  <div class="prospect-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>eBay seller prospect skim</h1>
      <p class="lead text-muted">
        One click finds <strong>possible sellers</strong> on eBay (usernames, feedback, store links) for outreach.
        Fully automatic when eBay API keys are configured in Supabase.
      </p>

      <p v-if="method" class="status-pill" :class="method">
        {{ methodLabel }}
        <span v-if="itemsScanned"> · {{ itemsScanned }} listings scanned</span>
      </p>
      <p v-else-if="!loading && !apiConfigured" class="setup-hint card">
        <strong>One-time setup for automation:</strong>
        Add <code>EBAY_CLIENT_ID</code> and <code>EBAY_CLIENT_SECRET</code> to Supabase
        (<NuxtLink to="/ops/panel">ops panel</NuxtLink> → see repo <code>docs/EBAY-API-SETUP.md</code>).
        Then this page runs automatically on load.
      </p>

      <section class="card panel">
        <div class="preset-row">
          <button
            v-for="p in presets"
            :key="p.id"
            type="button"
            class="btn btn-outline btn-sm"
            :class="{ active: activePreset === p.id }"
            @click="applyPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>
        <label class="label">Keywords</label>
        <input v-model="keywords" class="input" placeholder="e.g. PSA baseball cards" @keyup.enter="runAutoSkim" />
        <label class="label mt">Category ID (optional)</label>
        <input v-model="categoryId" class="input" placeholder="2536 = trading cards" @keyup.enter="runAutoSkim" />

        <button
          type="button"
          class="btn btn-primary btn-lg find-btn"
          :disabled="loading"
          @click="runAutoSkim"
        >
          {{ loading ? 'Searching eBay…' : 'Find sellers now' }}
        </button>
      </section>

      <p v-if="error" class="error-text">{{ error }}</p>

      <details v-if="!apiConfigured || blocked" class="fallback-details">
        <summary>Manual fallback (if API not set up yet)</summary>
        <p class="text-muted small">
          Open
          <a :href="searchUrl" target="_blank" rel="noopener noreferrer">eBay search ↗</a>,
          save page as HTML, upload below.
        </p>
        <input type="file" accept=".html,.htm,text/html" @change="onHtmlFile" />
      </details>

      <section v-if="prospects.length" class="card panel">
        <div class="panel-head">
          <h2>{{ filteredProspects.length }} possible sellers</h2>
          <div class="panel-actions">
            <label class="filter-label">
              Min feedback %
              <input v-model.number="minFeedback" type="number" min="0" max="100" class="input input-sm" />
            </label>
            <button type="button" class="btn btn-outline btn-sm" @click="copyCsv">
              {{ csvCopied ? 'Copied' : 'Copy CSV' }}
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="prospect-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Feedback</th>
                <th>Listings</th>
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
                  <template v-if="row.feedback_pct != null">
                    {{ row.feedback_pct }}% ({{ row.feedback_count ?? '?' }})
                  </template>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>{{ row.listing_hits }}</td>
                <td class="sample">{{ row.sample_titles?.[0] || '—' }}</td>
                <td class="actions">
                  <a :href="row.store_url" target="_blank" rel="noopener noreferrer" class="link-sm">Store</a>
                  <a :href="outreachMailto(row)" class="link-sm">Email</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted small mt">
          Outreach only with permission — see <NuxtLink to="/ops/marketing">Marketing</NuxtLink>.
        </p>
      </section>

      <p class="back-link">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { EBAY_PROSPECT_PRESETS, buildEbaySearchUrl } from '~/utils/ebaySearchUrls.js'
import { prospectsToCsv } from '~/utils/ebayProspectParse.js'
import { buildProspectOutreachMailto } from '~/utils/prospectOutreach.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'eBay seller prospects — Ops', robots: 'noindex' })

const presets = EBAY_PROSPECT_PRESETS
const keywords = ref('sports cards PSA')
const categoryId = ref('2536')
const activePreset = ref('sports-cards')
const minFeedback = ref(98)
const csvCopied = ref(false)

const {
  loading,
  error,
  blocked,
  prospects,
  sourceUrl,
  method,
  apiConfigured,
  itemsScanned,
  skimFromHtml,
  skimFromServer,
} = useEbayProspectSkim()

const searchUrl = computed(() =>
  buildEbaySearchUrl({ keywords: keywords.value, categoryId: categoryId.value, itemsPerPage: 60 }),
)

const methodLabel = computed(() => {
  const m = method.value
  if (m === 'ebay_browse_api') return 'eBay API (fully automated)'
  if (m === 'html_scrape' || m === 'html_scrape_fallback') return 'HTML scrape (limited)'
  if (m === 'browser_html') return 'Uploaded HTML'
  return m || 'Ready'
})

const filteredProspects = computed(() => {
  const min = Number(minFeedback.value) || 0
  return prospects.value.filter((p) => p.feedback_pct == null || p.feedback_pct >= min)
})

function applyPreset (p) {
  activePreset.value = p.id
  keywords.value = p.keywords
  categoryId.value = p.categoryId || ''
}

async function runAutoSkim () {
  csvCopied.value = false
  await skimFromServer({
    keywords: keywords.value.trim(),
    categoryId: categoryId.value.trim(),
    limit: 80,
  })
}

function onHtmlFile (e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    sourceUrl.value = searchUrl.value
    skimFromHtml(reader.result, 120)
  }
  reader.readAsText(file)
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

onMounted(() => {
  runAutoSkim()
})
</script>

<style scoped>
.prospect-page { padding: 40px 16px 80px; }
.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
}
.lead { max-width: 720px; line-height: 1.6; margin: 0.75rem 0 1rem; }
.status-pill {
  display: inline-block;
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 1rem;
  border: 1px solid rgba(4, 120, 87, 0.4);
  background: rgba(4, 120, 87, 0.12);
  color: #86efac;
}
.status-pill.html_scrape,
.status-pill.html_scrape_fallback {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.1);
  color: #fde68a;
}
.setup-hint {
  padding: 12px 14px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}
.card.panel { padding: 1.25rem; margin-bottom: 1.25rem; }
.preset-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.preset-row .btn.active { border-color: var(--gold); color: var(--gold); }
.label { display: block; font-size: 0.85rem; margin-bottom: 4px; color: #9ca3af; }
.mt { margin-top: 10px; }
.find-btn { width: 100%; margin-top: 1rem; }
.error-text { color: #f87171; }
.fallback-details { margin-bottom: 1rem; color: #9ca3af; }
.fallback-details summary { cursor: pointer; color: var(--gold); font-weight: 600; }
.panel-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; }
.filter-label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #9ca3af; }
.input-sm { width: 64px; padding: 4px 8px; }
.table-wrap { overflow-x: auto; margin-top: 12px; }
.prospect-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.prospect-table th, .prospect-table td { padding: 8px 10px; border-bottom: 1px solid #374151; text-align: left; }
.sample { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-sm { color: #93c5fd; margin-right: 10px; }
.back-link { margin-top: 1.5rem; }
.small { font-size: 0.9rem; }
.mt { margin-top: 0.75rem; }
</style>
