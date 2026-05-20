<template>
  <div class="builder-page">
    <div class="container">
      <div class="builder-hero text-center">
        <span class="ai-badge">AI-Powered</span>
        <h1>AI Store Builder</h1>
        <p class="hero-lead">
          Build your store profile, SEO for Google and Bing, listing templates, and a checklist to get found in search.
        </p>
      </div>

      <div class="builder-layout">
        <div class="builder-form-side">
          <form class="builder-form" @submit.prevent="generateStore">
            <div class="form-section">
              <h2>About your store</h2>
              <div class="form-group">
                <label class="label">Store name</label>
                <input v-model="store.name" class="input" placeholder="e.g. Franks Graded Cards" required @blur="syncSlug" />
              </div>
              <div class="form-group">
                <label class="label">Store URL slug</label>
                <input v-model="store.slug" class="input" placeholder="franks-graded-cards" />
                <p class="field-hint">Used in links and SEO — lowercase, hyphens only.</p>
              </div>
              <div class="form-group">
                <label class="label">What do you sell?</label>
                <textarea v-model="store.description" class="textarea" rows="3" placeholder="Describe your inventory, brands, and what makes your shop different..." required />
              </div>
              <div class="form-group">
                <label class="label">Main category</label>
                <select v-model="store.category" class="select" required>
                  <option value="">Select your main category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Brand voice</label>
                <select v-model="store.brandVoice" class="select">
                  <option value="professional">Professional &amp; trusted</option>
                  <option value="friendly">Friendly &amp; approachable</option>
                  <option value="luxury">Luxury &amp; curated</option>
                  <option value="collector">Collector-focused</option>
                  <option value="value">Value &amp; transparency</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Target customers (optional)</label>
                <input v-model="store.targetAudience" class="input" placeholder="e.g. PSA collectors in the Midwest, vintage guitar buyers" />
              </div>
              <div class="form-group">
                <label class="label">Selling style</label>
                <div class="radio-group">
                  <label class="radio-opt" :class="{ active: store.style === 'direct' }">
                    <input v-model="store.style" type="radio" value="direct" /> Direct — I ship myself
                  </label>
                  <label class="radio-opt" :class="{ active: store.style === 'dropship' }">
                    <input v-model="store.style" type="radio" value="dropship" /> Dropship — supplier ships
                  </label>
                  <label class="radio-opt" :class="{ active: store.style === 'both' }">
                    <input v-model="store.style" type="radio" value="both" /> Both
                  </label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="label">Price min ($)</label>
                  <input v-model.number="store.priceMin" class="input" type="number" min="1" placeholder="25" />
                </div>
                <div class="form-group">
                  <label class="label">Price max ($)</label>
                  <input v-model.number="store.priceMax" class="input" type="number" placeholder="500" />
                </div>
              </div>
              <div class="form-group">
                <label class="label">Starting inventory</label>
                <select v-model="store.volume" class="select">
                  <option value="1-5">1–5 listings</option>
                  <option value="5-20">5–20</option>
                  <option value="20-100">20–100</option>
                  <option value="100+">100+</option>
                </select>
              </div>
            </div>

            <div class="form-section form-section-seo">
              <h2>Search engines (Google, Bing &amp; more)</h2>
              <p class="section-intro">Customize how your store can appear in Google, Bing, Yahoo, DuckDuckGo, and other engines that use these signals.</p>
              <div class="form-row">
                <div class="form-group">
                  <label class="label">City</label>
                  <input v-model="store.city" class="input" placeholder="e.g. Chicago" />
                </div>
                <div class="form-group">
                  <label class="label">State / region</label>
                  <input v-model="store.state" class="input" placeholder="e.g. IL" />
                </div>
              </div>
              <div class="form-group">
                <label class="label">Country</label>
                <input v-model="store.country" class="input" placeholder="United States" />
              </div>
              <div class="form-group">
                <label class="label">Focus keywords (comma-separated)</label>
                <input v-model="store.focusKeywords" class="input" placeholder="e.g. PSA sports cards, graded baseball, authenticated memorabilia" required />
                <p class="field-hint">Primary phrases buyers type into Google and Bing.</p>
              </div>
              <div class="form-group">
                <label class="label">Additional keywords</label>
                <input v-model="store.extraKeywords" class="input" placeholder="rookie card, slab, vintage, fast shipping" />
              </div>
              <div class="form-group">
                <label class="label">Your website (optional)</label>
                <input v-model="store.websiteUrl" class="input" type="url" placeholder="https://yourstore.com" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="label">Instagram URL</label>
                  <input v-model="store.instagram" class="input" type="url" placeholder="https://instagram.com/..." />
                </div>
                <div class="form-group">
                  <label class="label">Facebook URL</label>
                  <input v-model="store.facebook" class="input" type="url" placeholder="https://facebook.com/..." />
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg builder-submit" :disabled="generating">
              {{ generating ? 'Building your store & SEO pack...' : 'Build store + SEO pack' }}
            </button>
          </form>
        </div>

        <div class="builder-preview-side">
          <div v-if="!result" class="preview-empty">
            <p class="preview-icon">🏪</p>
            <h3>Store &amp; SEO preview</h3>
            <p class="text-muted">Fill in the form — you will get store copy, Google/Bing snippets, meta tags, JSON-LD, and steps to get indexed.</p>
          </div>

          <div v-else class="preview-result">
            <div class="preview-tabs">
              <button
                v-for="tab in previewTabs"
                :key="tab.id"
                type="button"
                class="preview-tab"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>

            <div v-show="activeTab === 'profile'" class="tab-panel">
              <div class="result-section">
                <h3>{{ result.store.storeName }}</h3>
                <p class="result-tagline">{{ result.store.tagline }}</p>
              </div>
              <div class="result-section">
                <h4>Store bio</h4>
                <p>{{ result.store.bio }}</p>
              </div>
              <div class="result-section">
                <h4>Sample listing titles</h4>
                <ul class="result-list">
                  <li v-for="t in result.store.sampleTitles" :key="t">{{ t }}</li>
                </ul>
              </div>
              <div class="result-section">
                <h4>Description template</h4>
                <div class="result-template">{{ result.store.descriptionTemplate }}</div>
              </div>
              <div class="result-section">
                <h4>Pricing &amp; SEO tip</h4>
                <p>{{ result.store.pricingTip }}</p>
              </div>
              <div v-if="store.style !== 'direct' && result.store.dropshipTip" class="result-section">
                <h4>Dropship + search</h4>
                <p>{{ result.store.dropshipTip }}</p>
              </div>
            </div>

            <div v-show="activeTab === 'seo'" class="tab-panel">
              <div class="result-section">
                <h4>SEO title <span class="char-count">{{ result.seo.metaTitle.length }}/60</span></h4>
                <p class="copy-block">{{ result.seo.metaTitle }}</p>
                <button type="button" class="btn btn-outline btn-sm" @click="copyText(result.seo.metaTitle)">Copy title</button>
              </div>
              <div class="result-section">
                <h4>Meta description <span class="char-count">{{ result.seo.metaDescription.length }}/160</span></h4>
                <p class="copy-block">{{ result.seo.metaDescription }}</p>
                <button type="button" class="btn btn-outline btn-sm" @click="copyText(result.seo.metaDescription)">Copy description</button>
              </div>
              <div class="result-section">
                <h4>Keywords</h4>
                <p class="keyword-chips">
                  <span v-for="k in result.seo.keywords" :key="k" class="kw-chip">{{ k }}</span>
                </p>
              </div>
              <div class="result-section">
                <h4>Google preview</h4>
                <div class="serp serp-google">
                  <p class="serp-title">{{ result.seo.googlePreview.title }}</p>
                  <p class="serp-url">{{ result.seo.googlePreview.url }}</p>
                  <p class="serp-desc">{{ result.seo.googlePreview.description }}</p>
                </div>
              </div>
              <div class="result-section">
                <h4>Bing preview</h4>
                <div class="serp serp-bing">
                  <p class="serp-title">{{ result.seo.bingPreview.title }}</p>
                  <p class="serp-url">{{ result.seo.bingPreview.url }}</p>
                  <p class="serp-desc">{{ result.seo.bingPreview.description }}</p>
                </div>
              </div>
              <div class="result-section">
                <h4>Listing title formulas</h4>
                <ul class="result-list">
                  <li v-for="f in result.seo.listingTitleFormulas" :key="f">{{ f }}</li>
                </ul>
              </div>
              <div class="result-section">
                <h4>HTML meta tags</h4>
                <div class="result-template result-code">{{ result.seo.htmlMetaBlock }}</div>
                <button type="button" class="btn btn-outline btn-sm" @click="copyText(result.seo.htmlMetaBlock)">Copy meta HTML</button>
              </div>
              <div class="result-section">
                <h4>JSON-LD (structured data)</h4>
                <div class="result-template result-code">{{ result.seo.jsonLd }}</div>
                <button type="button" class="btn btn-outline btn-sm" @click="copyText(result.seo.jsonLd)">Copy JSON-LD</button>
              </div>
            </div>

            <div v-show="activeTab === 'search'" class="tab-panel">
              <div class="result-section">
                <h4>Get your store on search engines</h4>
                <p class="index-tip">{{ result.seo.indexNowTip }}</p>
              </div>
              <div v-for="block in result.seo.searchChecklist" :key="block.engine" class="result-section">
                <h4>{{ block.engine }}</h4>
                <ol class="result-checklist">
                  <li v-for="step in block.steps" :key="step">{{ step }}</li>
                </ol>
              </div>
              <div class="result-section">
                <h4>Franks Standard URLs to submit</h4>
                <ul class="result-list">
                  <li v-for="u in result.seo.sitemapUrls" :key="u">
                    <a :href="u" target="_blank" rel="noopener">{{ u }}</a>
                  </li>
                </ul>
              </div>
              <div class="result-section">
                <h4>Launch checklist</h4>
                <ol class="result-checklist">
                  <li v-for="s in result.store.launchSteps" :key="s">{{ s }}</li>
                </ol>
              </div>
            </div>

            <div class="result-actions">
              <NuxtLink to="/sell" class="btn btn-primary">Start listing now</NuxtLink>
              <button type="button" class="btn btn-outline" @click="copyAll">Copy full pack</button>
              <button type="button" class="btn btn-dark" @click="reset">Start over</button>
            </div>
            <p v-if="copyMsg" class="copy-toast" role="status">{{ copyMsg }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'
import {
  buildStoreResult,
  buildStoreSeoPack,
  formatFullStoreExport,
  slugifyStore,
} from '~/utils/storeBuilder'

useSeoMeta({
  title: 'AI Store Builder — SEO for Google, Bing & Listings',
  description: 'AI store builder with SEO customization: meta titles, descriptions, Google and Bing previews, JSON-LD, and search engine indexing checklist.',
})

const categories = LISTING_CATEGORIES

const store = reactive({
  name: '',
  slug: '',
  description: '',
  category: '',
  style: 'direct',
  priceMin: null,
  priceMax: null,
  volume: '5-20',
  city: '',
  state: '',
  country: 'United States',
  focusKeywords: '',
  extraKeywords: '',
  brandVoice: 'professional',
  targetAudience: '',
  websiteUrl: '',
  instagram: '',
  facebook: '',
})

const generating = ref(false)
const result = ref(null)
const activeTab = ref('profile')
const copyMsg = ref('')

const previewTabs = [
  { id: 'profile', label: 'Store' },
  { id: 'seo', label: 'SEO' },
  { id: 'search', label: 'Get found' },
]

function syncSlug () {
  if (!store.slug.trim() && store.name.trim()) {
    store.slug = slugifyStore(store.name)
  }
}

function generateStore () {
  if (!store.focusKeywords.trim() && store.category) {
    store.focusKeywords = store.category
  }
  syncSlug()
  generating.value = true
  copyMsg.value = ''
  setTimeout(() => {
    const built = buildStoreResult(store)
    const seo = buildStoreSeoPack(store, built)
    result.value = { store: built, seo }
    activeTab.value = 'seo'
    generating.value = false
  }, 1200)
}

function reset () {
  result.value = null
  activeTab.value = 'profile'
  copyMsg.value = ''
}

async function copyText (text) {
  try {
    await navigator.clipboard.writeText(text)
    copyMsg.value = 'Copied to clipboard.'
    setTimeout(() => { copyMsg.value = '' }, 2500)
  } catch {
    copyMsg.value = 'Copy failed — select text manually.'
  }
}

async function copyAll () {
  if (!result.value) return
  await copyText(formatFullStoreExport(result.value.store, result.value.seo))
}
</script>

<style scoped>
.builder-page { padding: 40px 0 80px; }
.builder-hero { margin-bottom: 32px; }
.builder-hero h1 { font-size: 2rem; margin: 12px 0 8px; color: #111827; }
.hero-lead { max-width: 640px; margin: 0 auto; color: #374151; font-weight: 600; line-height: 1.5; }
.ai-badge {
  display: inline-block; padding: 5px 14px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  background: linear-gradient(135deg, rgba(139, 92, 255, 0.2), rgba(0, 224, 255, 0.15));
  color: var(--cyan); border: 1px solid rgba(0, 224, 255, 0.35);
}
.builder-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
@media (max-width: 900px) { .builder-layout { grid-template-columns: 1fr; } }
.form-section {
  margin-bottom: 20px; padding: 24px;
  border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900);
}
.form-section-seo { border-color: rgba(0, 224, 255, 0.35); }
.form-section h2 { font-size: 1.15rem; color: var(--gold); margin-bottom: 12px; }
.section-intro { font-size: 0.88rem; color: var(--stone-300); margin-bottom: 16px; line-height: 1.5; }
.field-hint { font-size: 0.78rem; color: var(--stone-400); margin-top: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.radio-opt {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  border: 1px solid var(--stone-700); border-radius: var(--radius); cursor: pointer;
  font-size: 0.9rem; color: var(--stone-300); transition: border-color 0.2s;
}
.radio-opt.active { border-color: var(--gold); color: var(--stone-100); background: rgba(201, 168, 76, 0.06); }
.radio-opt input { accent-color: var(--gold); }
.builder-submit { width: 100%; }
.preview-empty {
  text-align: center; padding: 60px 24px;
  border: 2px dashed var(--stone-700); border-radius: var(--radius-lg);
}
.preview-icon { font-size: 3rem; margin-bottom: 12px; }
.preview-empty h3 { font-size: 1.2rem; margin-bottom: 8px; color: var(--stone-100); }
.preview-result {
  padding: 20px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900);
}
.preview-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.preview-tab {
  padding: 8px 14px; border: 1px solid var(--stone-700); border-radius: 999px;
  background: transparent; color: var(--stone-300); font-size: 0.82rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.preview-tab.active { border-color: var(--gold); color: var(--gold); background: rgba(201, 168, 76, 0.08); }
.tab-panel { max-height: 70vh; overflow-y: auto; padding-right: 4px; }
.result-section { margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--stone-800); }
.result-section:last-of-type { border-bottom: none; }
.result-section h3 { font-size: 1.25rem; color: var(--gold); margin-bottom: 4px; }
.result-tagline { font-size: 0.95rem; color: var(--cyan); font-style: italic; }
.result-section h4 { font-size: 0.85rem; color: var(--gold); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
.result-section p { font-size: 0.9rem; color: var(--stone-200); line-height: 1.6; }
.char-count { font-weight: 400; color: var(--stone-400); font-size: 0.75rem; }
.copy-block { padding: 10px 12px; background: rgba(0,0,0,0.25); border-radius: var(--radius); margin-bottom: 8px; }
.keyword-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.kw-chip {
  padding: 4px 10px; border-radius: 999px; font-size: 0.78rem;
  background: rgba(0, 224, 255, 0.1); color: var(--cyan); border: 1px solid rgba(0, 224, 255, 0.3);
}
.serp { padding: 12px 14px; border-radius: var(--radius); background: #fff; border: 1px solid #d7dde6; }
.serp-title { font-size: 1.05rem; color: #1a0dab; margin: 0 0 4px; line-height: 1.3; }
.serp-bing .serp-title { color: #111827; }
.serp-url { font-size: 0.8rem; color: #006621; margin: 0 0 6px; }
.serp-bing .serp-url { color: #666; }
.serp-desc { font-size: 0.85rem; color: #4d5156; margin: 0; line-height: 1.45; }
.result-list { padding-left: 1.2rem; margin: 0; }
.result-list li { font-size: 0.88rem; color: var(--stone-200); margin-bottom: 6px; }
.result-list a { color: var(--cyan); }
.result-template {
  padding: 14px; background: rgba(0, 0, 0, 0.3); border-radius: var(--radius);
  font-size: 0.8rem; color: var(--stone-300); line-height: 1.55; white-space: pre-wrap; font-family: ui-monospace, monospace;
}
.result-code { font-size: 0.72rem; max-height: 200px; overflow-y: auto; }
.result-checklist { padding-left: 1.2rem; margin: 0; }
.result-checklist li { font-size: 0.86rem; color: var(--stone-200); margin-bottom: 8px; line-height: 1.45; }
.index-tip { font-size: 0.88rem; color: var(--stone-300); }
.result-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--stone-800); }
.copy-toast { margin-top: 10px; font-size: 0.85rem; color: var(--trust-green); font-weight: 600; }
</style>
