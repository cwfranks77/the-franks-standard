<template>
  <div class="builder-page">
    <div class="container">
      <div class="builder-hero text-center">
        <span class="ai-badge">AI-Powered</span>
        <h1>AI Store Builder</h1>
        <p class="text-muted">Tell us about your business — our AI designs your store, writes your descriptions, and gets you selling in minutes.</p>
      </div>

      <div class="builder-layout">
        <div class="builder-form-side">
          <form @submit.prevent="generateStore" class="builder-form">
            <div class="form-section">
              <h2>About your store</h2>
              <div class="form-group">
                <label class="label">Store name</label>
                <input class="input" v-model="store.name" placeholder="e.g. Franks Graded Cards" required />
              </div>
              <div class="form-group">
                <label class="label">What do you sell?</label>
                <textarea class="textarea" v-model="store.description" rows="3" placeholder="e.g. PSA and BGS graded sports cards, vintage basketball and baseball sets, rare inserts and parallels..." required></textarea>
              </div>
              <div class="form-group">
                <label class="label">Main category</label>
                <select class="select" v-model="store.category" required>
                  <option value="">Select your main category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Selling style</label>
                <div class="radio-group">
                  <label class="radio-opt" :class="{ active: store.style === 'direct' }">
                    <input type="radio" v-model="store.style" value="direct" /> Direct seller — I ship items myself
                  </label>
                  <label class="radio-opt" :class="{ active: store.style === 'dropship' }">
                    <input type="radio" v-model="store.style" value="dropship" /> Dropshipper — supplier ships for me
                  </label>
                  <label class="radio-opt" :class="{ active: store.style === 'both' }">
                    <input type="radio" v-model="store.style" value="both" /> Both — I do direct and dropship
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="label">Price range</label>
                <div class="form-row">
                  <input class="input" type="number" v-model="store.priceMin" placeholder="Min $" min="1" />
                  <input class="input" type="number" v-model="store.priceMax" placeholder="Max $" />
                </div>
              </div>
              <div class="form-group">
                <label class="label">How many items to start?</label>
                <select class="select" v-model="store.volume">
                  <option value="1-5">1–5 (just testing)</option>
                  <option value="5-20">5–20</option>
                  <option value="20-100">20–100</option>
                  <option value="100+">100+ (high volume)</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" :disabled="generating">
              {{ generating ? 'AI is building your store...' : 'Build my store with AI' }}
            </button>
          </form>
        </div>

        <div class="builder-preview-side">
          <div v-if="!result" class="preview-empty">
            <p class="preview-icon">🏪</p>
            <h3>Your store preview</h3>
            <p class="text-muted">Fill in the form and click "Build my store" — the AI will generate your store profile, listing descriptions, pricing tips, and a launch plan.</p>
          </div>

          <div v-else class="preview-result">
            <div class="result-section">
              <h3>{{ result.storeName }}</h3>
              <p class="result-tagline">{{ result.tagline }}</p>
            </div>

            <div class="result-section">
              <h4>Store bio</h4>
              <p>{{ result.bio }}</p>
            </div>

            <div class="result-section">
              <h4>Sample listing titles</h4>
              <ul class="result-list">
                <li v-for="t in result.sampleTitles" :key="t">{{ t }}</li>
              </ul>
            </div>

            <div class="result-section">
              <h4>Sample description template</h4>
              <div class="result-template">{{ result.descriptionTemplate }}</div>
            </div>

            <div class="result-section">
              <h4>Pricing strategy</h4>
              <p>{{ result.pricingTip }}</p>
            </div>

            <div class="result-section">
              <h4>Launch checklist</h4>
              <ol class="result-checklist">
                <li v-for="s in result.launchSteps" :key="s">{{ s }}</li>
              </ol>
            </div>

            <div class="result-section" v-if="store.style !== 'direct'">
              <h4>Dropship setup tips</h4>
              <p>{{ result.dropshipTip }}</p>
            </div>

            <div class="result-actions">
              <NuxtLink to="/sell" class="btn btn-primary">Start listing now</NuxtLink>
              <button type="button" class="btn btn-outline" @click="copyResult">Copy to clipboard</button>
              <button type="button" class="btn btn-dark" @click="result = null">Start over</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'AI Store Builder — The Franks Standard',
  description: 'Let AI design your store, write descriptions, and get you selling in minutes.',
})

const categories = [
  'Sports Cards & Memorabilia', 'Musical Instruments', 'Firearms Accessories',
  'Coins & Currency', 'Art & Antiques', 'Watches & Jewelry',
  'Sneakers & Streetwear', 'Vintage Electronics & Games',
]

const store = reactive({
  name: '', description: '', category: '', style: 'direct',
  priceMin: null, priceMax: null, volume: '5-20',
})

const generating = ref(false)
const result = ref(null)

function generateStore () {
  generating.value = true
  setTimeout(() => {
    result.value = buildStoreResult(store)
    generating.value = false
  }, 1800)
}

function buildStoreResult (s) {
  const name = s.name || 'My Store'
  const cat = s.category || 'collectibles'
  const isDropship = s.style === 'dropship' || s.style === 'both'
  const priceRange = s.priceMin && s.priceMax ? `$${s.priceMin}–$${s.priceMax}` : 'varied'

  const taglines = {
    'Sports Cards & Memorabilia': `Authenticated cards and memorabilia. Every piece has proof.`,
    'Musical Instruments': `Verified instruments for serious musicians. Play with confidence.`,
    'Coins & Currency': `Graded coins and certified currency. Real value, real proof.`,
    'Art & Antiques': `Provenance-backed art and antiques. The real deal only.`,
    'Watches & Jewelry': `Certified timepieces and fine jewelry. Authenticity guaranteed.`,
    'Sneakers & Streetwear': `Authenticated kicks and drops. No fakes, no exceptions.`,
    'Vintage Electronics & Games': `Verified retro tech and sealed games. Collector grade.`,
    'Firearms Accessories': `Quality parts and optics. Every item as described.`,
  }

  const sampleTitles = {
    'Sports Cards & Memorabilia': [
      `2023 Topps Chrome Refractor — PSA 10 Gem Mint`,
      `Vintage 1986 Fleer Michael Jordan Rookie — BGS 8.5`,
      `Game-Used Jersey Patch Card — Serial #/25 — COA Included`,
    ],
    'Sneakers & Streetwear': [
      `Nike Air Jordan 1 Retro High OG "Chicago" — DS Size 10`,
      `Supreme Box Logo Hoodie FW23 — Deadstock with Tags`,
      `Yeezy Boost 350 V2 "Zebra" — Authenticated, Size 11`,
    ],
  }

  const defaultTitles = [
    `${cat} Premium Item — Authenticated with COA`,
    `Rare ${cat} Find — Excellent Condition — Verified`,
    `${cat} Collection Piece — Proof of Authenticity Included`,
  ]

  return {
    storeName: name,
    tagline: taglines[s.category] || `Authenticated ${cat.toLowerCase()} from a trusted seller on The Franks Standard.`,
    bio: `Welcome to ${name}. We specialize in ${s.description || cat.toLowerCase()} with a focus on authenticity and quality. Every item comes with a Certificate of Authenticity or our signed in-platform guarantee — because you deserve proof, not promises. ${isDropship ? 'We work with verified suppliers to bring you the best selection with direct-to-door shipping.' : ''} Price range: ${priceRange}. Browse with confidence.`,
    sampleTitles: sampleTitles[s.category] || defaultTitles,
    descriptionTemplate: `[Item Name] — [Condition: New/Like New/Excellent/Good]\n\nAuthenticity: [COA from (grading company) / Franks Standard Guarantee]\nCondition details: [describe wear, completeness, packaging]\nIncludes: [list everything in the box/package]\n\nShipping: ${isDropship ? 'Ships directly from our verified supplier.' : 'Ships within 2 business days. Insured and tracked.'}\nReturns: Per The Franks Standard escrow policy — buyer confirms before funds release.\n\nQuestions? Message me or open a Video call from the listing page.`,
    pricingTip: `For ${cat.toLowerCase()} in the ${priceRange} range: research recent sold prices on eBay (sold listings filter) and StockX/Chrono24 for comps. Price 5–10% below the big platforms — our lower fees (5% vs 13%) mean you keep more even at a lower sticker price. Use the "Featured" placement from Pro to get more eyes.`,
    launchSteps: [
      `Complete your profile with your store name "${name}" and a professional photo`,
      `Upload your first listing with clear photos (minimum 3 angles) and a COA`,
      `Set competitive prices — check our comparison tool on the Pricing page`,
      `Share your first listing link on social media and collector forums`,
      `Enable Video calls so buyers can inspect items face-to-face before purchasing`,
      isDropship ? `Add your supplier details in the dropship section of each listing` : `Prepare shipping materials — bubble wrap, rigid mailers, and tracking labels`,
      `Monitor your Dashboard for views, inquiries, and sales`,
    ],
    dropshipTip: isDropship
      ? `For dropshipping on The Franks Standard: (1) Vet your supplier — you are personally responsible for authenticity. (2) Request COA documents from your supplier BEFORE listing. (3) Set realistic shipping times — overestimating is better than disappointing a buyer. (4) Keep supplier communication documented. (5) Consider ordering a sample first to verify quality and authenticity.`
      : '',
  }
}

async function copyResult () {
  if (!result.value) return
  const r = result.value
  const text = [
    `Store: ${r.storeName}`, `Tagline: ${r.tagline}`, '',
    `Bio: ${r.bio}`, '',
    `Sample titles:\n${r.sampleTitles.join('\n')}`, '',
    `Description template:\n${r.descriptionTemplate}`, '',
    `Pricing: ${r.pricingTip}`, '',
    `Launch steps:\n${r.launchSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
  ].join('\n')
  try { await navigator.clipboard.writeText(text) } catch {}
}
</script>

<style scoped>
.builder-page { padding: 40px 0 80px; }
.builder-hero { margin-bottom: 32px; }
.builder-hero h1 { font-size: 2rem; margin: 12px 0 8px; }
.ai-badge {
  display: inline-block; padding: 5px 14px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  background: linear-gradient(135deg, rgba(139, 92, 255, 0.2), rgba(0, 224, 255, 0.15));
  color: var(--cyan); border: 1px solid rgba(0, 224, 255, 0.35);
}
.builder-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
@media (max-width: 900px) { .builder-layout { grid-template-columns: 1fr; } }
.form-section { margin-bottom: 24px; padding: 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg); background: var(--stone-900); }
.form-section h2 { font-size: 1.2rem; color: var(--gold); margin-bottom: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.radio-opt {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  border: 1px solid var(--stone-700); border-radius: var(--radius); cursor: pointer;
  font-size: 0.9rem; color: var(--stone-300); transition: border-color 0.2s;
}
.radio-opt.active { border-color: var(--gold); color: var(--stone-100); background: rgba(201, 168, 76, 0.04); }
.radio-opt input { accent-color: var(--gold); }
.preview-empty {
  text-align: center; padding: 60px 24px;
  border: 2px dashed var(--stone-700); border-radius: var(--radius-lg);
}
.preview-icon { font-size: 3rem; margin-bottom: 12px; }
.preview-empty h3 { font-size: 1.2rem; margin-bottom: 8px; }
.preview-result {
  padding: 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900);
}
.result-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--stone-800); }
.result-section:last-of-type { border-bottom: none; }
.result-section h3 { font-size: 1.3rem; color: var(--gold); margin-bottom: 4px; }
.result-tagline { font-size: 0.95rem; color: var(--cyan); font-style: italic; }
.result-section h4 { font-size: 0.9rem; color: var(--gold); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
.result-section p { font-size: 0.9rem; color: var(--stone-200); line-height: 1.6; }
.result-list { padding-left: 1.2rem; }
.result-list li { font-size: 0.88rem; color: var(--stone-200); margin-bottom: 6px; }
.result-template {
  padding: 14px; background: rgba(0, 0, 0, 0.3); border-radius: var(--radius);
  font-size: 0.82rem; color: var(--stone-300); line-height: 1.6; white-space: pre-wrap; font-family: inherit;
}
.result-checklist { padding-left: 1.2rem; }
.result-checklist li { font-size: 0.88rem; color: var(--stone-200); margin-bottom: 8px; line-height: 1.4; }
.result-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
</style>
