<template>
  <div class="prospect-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>eBay seller prospect skim</h1>
      <p class="lead text-muted">
        Find <strong>possible sellers</strong> on eBay by keyword or category — usernames, feedback, and store links
        for outreach. This is <em>not</em> the inventory import at
        <NuxtLink to="/sell/import">/sell/import</NuxtLink> (that copies <em>your</em> listings).
      </p>

      <section class="card panel">
        <h2>1 — Build an eBay search</h2>
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
        <input v-model="keywords" class="input" placeholder="e.g. PSA baseball cards" />
        <label class="label mt">Category ID (optional)</label>
        <input v-model="categoryId" class="input" placeholder="e.g. 2536 for trading cards" />
        <div class="actions-row">
          <a :href="searchUrl" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
            Open eBay search ↗
          </a>
          <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="runServerSkim">
            {{ loading ? 'Skimming…' : 'Try auto-skim (server)' }}
          </button>
        </div>
        <p class="text-muted small">
          Auto-skim often fails with HTTP 403 — eBay blocks datacenters. When that happens, use step 2.
        </p>
      </section>

      <section class="card panel">
        <h2>2 — Save page &amp; upload (reliable)</h2>
        <ol class="small text-muted">
          <li>Open the eBay search (button above) and scroll through 2–3 pages so sellers load.</li>
          <li><strong>Ctrl+S</strong> / <strong>Cmd+S</strong> → <strong>Webpage, HTML only</strong>.</li>
          <li>Upload the file here — parsing runs in your browser.</li>
        </ol>
        <input type="file" accept=".html,.htm,text/html" @change="onHtmlFile" />
      </section>

      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="blocked && !prospects.length" class="warn-text">
        eBay blocked the server fetch. Use the HTML upload above.
      </p>

      <section v-if="prospects.length" class="card panel">
        <div class="panel-head">
          <h2>{{ prospects.length }} possible sellers</h2>
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
        <p v-if="sourceUrl" class="text-muted small">Source: {{ sourceUrl }}</p>
        <div class="table-wrap">
          <table class="prospect-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Feedback</th>
                <th>Hits</th>
                <th>Sample listing</th>
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
                  <a :href="outreachMailto(row)" class="link-sm">Draft email</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted small mt">
          Only contact sellers when you have permission (existing relationship, opt-in, or they asked).
          See <NuxtLink to="/ops/marketing">Marketing</NuxtLink> for CAN-SPAM rules.
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
const minFeedback = ref(98)
const csvCopied = ref(false)

const { loading, error, blocked, prospects, sourceUrl, skimFromHtml, skimFromServer } = useEbayProspectSkim()

const searchUrl = computed(() =>
  buildEbaySearchUrl({ keywords: keywords.value, categoryId: categoryId.value, itemsPerPage: 60 }),
)

const filteredProspects = computed(() => {
  const min = Number(minFeedback.value) || 0
  return prospects.value.filter((p) => p.feedback_pct == null || p.feedback_pct >= min)
})

function applyPreset (p) {
  keywords.value = p.keywords
  categoryId.value = p.categoryId || ''
}

async function runServerSkim () {
  csvCopied.value = false
  await skimFromServer({
    keywords: keywords.value.trim(),
    categoryId: categoryId.value.trim(),
    limit: 60,
  })
}

function onHtmlFile (e) {
  csvCopied.value = false
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
</script>

<style scoped>
.prospect-page { padding: 40px 16px 80px; }
.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
}
.lead { max-width: 720px; line-height: 1.6; margin: 0.75rem 0 1.5rem; }
.card.panel { padding: 1.25rem; margin-bottom: 1.25rem; }
.card h2 { font-size: 1.05rem; color: var(--gold); margin-bottom: 0.75rem; }
.preset-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.label { display: block; font-size: 0.85rem; margin-bottom: 4px; color: #9ca3af; }
.mt { margin-top: 10px; }
.actions-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.error-text { color: #f87171; }
.warn-text { color: #fbbf24; margin-bottom: 1rem; }
.panel-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; }
.filter-label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #9ca3af; }
.input-sm { width: 64px; padding: 4px 8px; }
.table-wrap { overflow-x: auto; margin-top: 12px; }
.prospect-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.prospect-table th, .prospect-table td { padding: 8px 10px; border-bottom: 1px solid #374151; text-align: left; }
.sample { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { white-space: nowrap; }
.link-sm { color: #93c5fd; margin-right: 10px; }
.back-link { margin-top: 1.5rem; }
.small { font-size: 0.9rem; line-height: 1.55; }
ol { padding-left: 1.2rem; }
</style>
