<template>
  <div class="setup-page">
    <div class="container max-w-3xl mx-auto px-4">
      <header class="setup-header text-center mb-8">
        <span class="ai-badge">AI-Powered</span>
        <h1 class="text-2xl font-bold text-white mt-2">Dropshipping AI Store Builder</h1>
        <p class="text-sm text-white/80 mt-2 max-w-xl mx-auto">
          Answer a few questions — get a full supplier plan, store slug, and step-by-step checklist. Save progress on this device.
        </p>
      </header>

      <section class="ai-coach" :class="{ open: showAi }">
        <button type="button" class="ai-coach-toggle" @click="showAi = !showAi">
          {{ showAi ? '▼' : '▶' }} AI dropship coach (start here)
        </button>
        <div v-if="showAi" class="ai-coach-body">
          <div class="form-group">
            <label class="label">Store name</label>
            <input v-model="aiIntake.storeName" class="input" placeholder="Brandy's Sporting Goods" />
          </div>
          <div class="form-group">
            <label class="label">What do you sell?</label>
            <select v-model="aiIntake.niche" class="input">
              <option value="sports-cards">Sports cards &amp; memorabilia</option>
              <option value="sneakers">Sneakers &amp; streetwear</option>
              <option value="general">General merchandise</option>
              <option value="home">Home &amp; gifts</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label">Details (optional)</label>
            <input v-model="aiIntake.nicheDetail" class="input" placeholder="e.g. PSA graded baseball, vintage jerseys" />
          </div>
          <div class="form-row-ai">
            <div class="form-group">
              <label class="label">Experience</label>
              <select v-model="aiIntake.experience" class="input">
                <option value="new">Brand new</option>
                <option value="some">Some sales</option>
                <option value="pro">Full-time seller</option>
              </select>
            </div>
            <div class="form-group">
              <label class="label">Orders / month</label>
              <select v-model="aiIntake.monthlyOrders" class="input">
                <option value="0-5">0–5</option>
                <option value="5-20">5–20</option>
                <option value="20+">20+</option>
              </select>
            </div>
          </div>
          <label class="check-row">
            <input v-model="aiIntake.wantsAutomation" type="checkbox" />
            <span>I want auto-dispatch when possible (Doba / Inventory Source API)</span>
          </label>
          <div class="form-group">
            <label class="label">Existing supplier name (optional)</label>
            <input v-model="aiIntake.supplierName" class="input" placeholder="Leave blank to let AI recommend" />
          </div>
          <button type="button" class="btn btn-primary w-full" :disabled="aiBusy" @click="runAiSetup">
            {{ aiBusy ? 'Building plan…' : 'Generate full AI setup plan' }}
          </button>
          <div v-if="aiPlan" class="ai-plan">
            <p class="ai-plan-lead text-white">
              <strong>{{ aiPlan.recommendedProviderName }}</strong>
              · {{ aiPlan.fulfillmentMode === 'integrated' ? 'Auto-dispatch' : 'Manual fulfillment' }}
            </p>
            <p class="text-sm text-white/70">{{ aiPlan.whyProvider }}</p>
            <p class="text-sm text-white/70">{{ aiPlan.storeBio }}</p>
            <h3 class="text-white text-sm font-semibold mt-3">Your checklist</h3>
            <ul class="text-sm text-white/85">
              <li v-for="(s, i) in aiPlan.setupSteps" :key="'s' + i">{{ s }}</li>
            </ul>
            <h3 class="text-white text-sm font-semibold mt-3">Import products</h3>
            <ul class="text-sm text-white/85">
              <li v-for="(s, i) in aiPlan.catalogSteps" :key="'c' + i">{{ s }}</li>
            </ul>
            <button type="button" class="btn btn-primary mt-4" @click="applyAiPlan">
              Apply to wizard &amp; continue
            </button>
            <button type="button" class="btn btn-outline mt-2 ml-2" @click="copyOutreach">
              Copy outreach snippet
            </button>
            <p v-if="copyMsg" class="text-xs text-green-400 mt-2">{{ copyMsg }}</p>
          </div>
        </div>
      </section>

      <div class="step-track" aria-label="Setup progress">
        <div
          v-for="(label, idx) in stepLabels"
          :key="label"
          class="step-pill"
          :class="{ active: step === idx + 1, done: step > idx + 1 }"
        >
          <span class="step-num">{{ idx + 1 }}</span>
          <span class="step-label">{{ label }}</span>
        </div>
      </div>

      <p v-if="error" class="setup-error" role="alert">{{ error }}</p>

      <section v-if="step === 1" class="setup-panel">
        <h2 class="text-lg font-semibold text-white">Step 1 — Choose your supplier</h2>
        <p class="text-sm text-white/70">Pick whoever you want. You can change this later.</p>
        <div class="provider-grid">
          <button
            v-for="p in providers"
            :key="p.key"
            type="button"
            class="provider-card"
            :class="{ selected: form.providerKey === p.key }"
            @click="selectProvider(p)"
          >
            <strong class="text-white">{{ p.name }}</strong>
            <span class="text-sm text-white/65">{{ p.note }}</span>
            <span v-if="p.integrated" class="badge-integrated">Optional auto-dispatch</span>
          </button>
        </div>
        <div v-if="form.providerKey === 'custom'" class="form-group mt-3">
          <label class="label">Your supplier or company name</label>
          <input v-model="form.customProviderName" class="input" placeholder="e.g. Midwest Collectibles Wholesale" />
        </div>
      </section>

      <section v-if="step === 2" class="setup-panel">
        <h2 class="text-lg font-semibold text-white">Step 2 — Your store on The Franks Standard</h2>
        <div class="form-group">
          <label class="label">Store name (shown to buyers)</label>
          <input v-model="form.storeName" class="input" placeholder="Brandy's Sporting Goods" />
        </div>
        <div class="form-group">
          <label class="label">Store link slug</label>
          <input v-model="form.storeSlug" class="input" placeholder="brandyssportinggoods" @blur="syncSlug" />
          <p class="text-sm text-white/65 mt-1">
            Shop URL: <strong class="text-white">thefranksstandard.com/store/{{ form.storeSlug || 'your-slug' }}</strong>
          </p>
        </div>
        <div class="form-group">
          <label class="label">Customer support email</label>
          <input v-model="form.storeContactEmail" class="input" type="email" placeholder="yourname@thefranksstandard.com" />
          <p class="text-xs text-white/60 mt-1">Use your @thefranksstandard.com seller email when you have one.</p>
        </div>
        <label class="check-row">
          <input v-model="form.accountCreated" type="checkbox" />
          <span>I have (or will use) my own account with this supplier</span>
        </label>
      </section>

      <section v-if="step === 3" class="setup-panel">
        <h2 class="text-lg font-semibold text-white">Step 3 — How orders get fulfilled</h2>
        <div class="mode-cards">
          <button
            type="button"
            class="mode-card"
            :class="{ active: form.fulfillmentMode === 'manual' }"
            @click="form.fulfillmentMode = 'manual'"
          >
            <strong class="text-white">Manual (recommended to start)</strong>
            <p class="text-sm text-white/65">When someone buys, you get order + SKU details. You place the order with your supplier.</p>
          </button>
          <button
            v-if="canUseIntegrated"
            type="button"
            class="mode-card"
            :class="{ active: form.fulfillmentMode === 'integrated' }"
            @click="form.fulfillmentMode = 'integrated'"
          >
            <strong class="text-white">Auto-dispatch (optional)</strong>
            <p class="text-sm text-white/65">Connect your own API keys so paid orders can forward automatically.</p>
          </button>
        </div>
      </section>

      <section v-if="step === 4" class="setup-panel">
        <h2 class="text-lg font-semibold text-white">Step 4 — API keys (optional)</h2>
        <p class="text-sm text-white/70">Only if you chose auto-dispatch. Keys stay on your device until you connect a seller account.</p>
        <div v-if="form.providerKey === 'doba'" class="form-stack">
          <div class="form-group">
            <label class="label">FLXPOINT / Doba API key</label>
            <input v-model="form.flxpointApiKey" class="input" type="password" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="label">Doba supplier ID</label>
            <input v-model="form.dobaSupplierId" class="input" />
          </div>
          <div class="form-group">
            <label class="label">Doba warehouse ID</label>
            <input v-model="form.dobaWarehouseId" class="input" />
          </div>
        </div>
        <div v-else-if="form.providerKey === 'inventory-source'" class="form-group">
          <label class="label">Inventory Source API key</label>
          <input v-model="form.inventorySourceApiKey" class="input" type="password" autocomplete="off" />
        </div>
        <p v-else class="text-sm text-white/65">Manual mode — no API keys needed.</p>
      </section>

      <section v-if="step === 5" class="setup-panel">
        <h2 class="text-lg font-semibold text-white">Step 5 — You are set up</h2>
        <ul class="summary-list text-sm text-white/85">
          <li><strong>Store:</strong> {{ form.storeName }} ({{ form.storeSlug }})</li>
          <li><strong>Supplier:</strong> {{ displayProviderName }}</li>
          <li><strong>Fulfillment:</strong> {{ form.fulfillmentMode === 'integrated' ? 'Auto-dispatch' : 'Manual' }}</li>
        </ul>
        <p class="text-sm text-white/75 mt-3">Next: build SEO with the AI Store Builder, then list products from Sell.</p>
        <div class="setup-actions mt-4">
          <NuxtLink to="/store-builder" class="btn btn-primary">AI Store Builder</NuxtLink>
          <NuxtLink to="/sell/start" class="btn btn-outline">Start selling</NuxtLink>
        </div>
      </section>

      <div v-if="step < 5" class="setup-actions">
        <button v-if="step > 1" type="button" class="btn btn-outline" @click="goBack">Back</button>
        <button type="button" class="btn btn-primary" :disabled="!canAdvance" @click="goNext">
          {{ step === 4 ? 'Finish' : 'Continue' }}
        </button>
      </div>

      <p class="text-center mt-6 text-sm">
        <NuxtLink to="/sell/start" class="text-primary hover:underline">← Back to sell options</NuxtLink>
        ·
        <NuxtLink to="/store-builder" class="text-primary hover:underline">AI Store Builder</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { buildDropshipAiPlan } from '~/utils/dropshipAiSetup'
import {
  DROPSHIP_PROVIDER_CATALOG,
  providerByKey,
  loadDropshipSetupLocal,
  saveDropshipSetupLocal,
} from '~/utils/dropshipProviders'
import { slugifyStore } from '~/utils/storeBuilder'

const providers = DROPSHIP_PROVIDER_CATALOG
const stepLabels = ['Provider', 'Store', 'Fulfillment', 'API', 'Done']
const step = ref(1)
const showAi = ref(true)
const aiBusy = ref(false)
const aiPlan = ref(null)
const error = ref('')
const copyMsg = ref('')

const aiIntake = reactive({
  storeName: '',
  niche: 'sports-cards',
  nicheDetail: '',
  experience: 'new',
  wantsAutomation: false,
  monthlyOrders: '0-5',
  supplierName: '',
  contactEmail: '',
})

const form = reactive({
  storeName: '',
  storeSlug: '',
  storeContactEmail: '',
  providerKey: 'custom',
  customProviderName: '',
  accountCreated: false,
  fulfillmentMode: 'manual',
  flxpointApiKey: '',
  inventorySourceApiKey: '',
  dobaSupplierId: '',
  dobaWarehouseId: '',
})

const selectedProvider = computed(() => providerByKey(form.providerKey))
const canUseIntegrated = computed(() => !!selectedProvider.value?.integrated)
const displayProviderName = computed(() => {
  if (form.providerKey === 'custom') return form.customProviderName || 'My own supplier'
  return selectedProvider.value?.name || form.providerKey
})

const canAdvance = computed(() => {
  if (step.value === 1) {
    if (form.providerKey === 'custom') return !!form.customProviderName.trim()
    return !!form.providerKey
  }
  if (step.value === 2) {
    return form.accountCreated && !!form.storeName.trim() && !!form.storeSlug.trim()
  }
  if (step.value === 3) return !!form.fulfillmentMode
  return true
})

function syncSlug () {
  if (!form.storeSlug.trim() && form.storeName.trim()) {
    form.storeSlug = slugifyStore(form.storeName)
  }
}

function selectProvider (p) {
  form.providerKey = p.key
  if (p.key !== 'custom') form.customProviderName = ''
}

function runAiSetup () {
  aiBusy.value = true
  setTimeout(() => {
    aiPlan.value = buildDropshipAiPlan({ ...aiIntake })
    aiBusy.value = false
  }, 600)
}

function applyAiPlan () {
  if (!aiPlan.value) return
  const p = aiPlan.value
  form.storeName = aiIntake.storeName.trim() || form.storeName
  form.storeSlug = p.storeSlug
  form.storeContactEmail = aiIntake.contactEmail || form.storeContactEmail
  form.providerKey = p.recommendedProviderKey
  if (p.recommendedProviderKey === 'custom') {
    form.customProviderName = aiIntake.supplierName || p.recommendedProviderName
  } else {
    form.customProviderName = ''
  }
  form.fulfillmentMode = p.fulfillmentMode
  form.accountCreated = true
  step.value = 2
  showAi.value = false
  persistLocal()
}

async function copyOutreach () {
  if (!aiPlan.value?.outreachSnippet) return
  try {
    await navigator.clipboard.writeText(aiPlan.value.outreachSnippet)
    copyMsg.value = 'Outreach snippet copied.'
    setTimeout(() => { copyMsg.value = '' }, 2500)
  } catch {
    copyMsg.value = 'Copy failed — select text manually.'
  }
}

function persistLocal (complete = false) {
  saveDropshipSetupLocal({
    setupComplete: complete,
    setupStep: step.value,
    form: { ...form },
    aiIntake: { ...aiIntake },
  })
}

function goBack () {
  if (step.value > 1) step.value -= 1
}

function goNext () {
  if (!canAdvance.value) return
  error.value = ''
  if (step.value === 3 && form.fulfillmentMode === 'manual') {
    step.value = 5
    persistLocal(true)
    return
  }
  if (step.value === 4) {
    step.value = 5
    persistLocal(true)
    return
  }
  step.value += 1
  persistLocal(step.value === 5)
}

onMounted(() => {
  const saved = loadDropshipSetupLocal()
  if (saved?.form) {
    Object.assign(form, saved.form)
    if (saved.setupStep) step.value = Math.min(5, Math.max(1, Number(saved.setupStep)))
    if (saved.setupComplete) step.value = 5
  }
  if (saved?.aiIntake) Object.assign(aiIntake, saved.aiIntake)
})
</script>

<style scoped>
.setup-page { padding: 32px 0 64px; }
.ai-badge {
  display: inline-block; padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  background: linear-gradient(135deg, rgba(139, 92, 255, 0.35), rgba(0, 224, 255, 0.2));
  color: #67e8f9; border: 1px solid rgba(0, 224, 255, 0.35);
}
.ai-coach {
  border: 1px solid rgba(139, 92, 255, 0.45); border-radius: 12px;
  margin-bottom: 24px; background: rgba(30, 27, 46, 0.6);
}
.ai-coach-toggle {
  width: 100%; text-align: left; padding: 14px 16px; font-weight: 700;
  background: transparent; border: none; cursor: pointer; color: #c4b5fd; font-family: inherit;
}
.ai-coach-body { padding: 0 16px 20px; }
.ai-plan {
  margin-top: 16px; padding: 14px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.25);
}
.ai-plan ul { line-height: 1.65; padding-left: 1.2rem; margin: 8px 0; }
.form-row-ai { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 520px) { .form-row-ai { grid-template-columns: 1fr; } }
.step-track { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
.step-pill {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border-radius: 999px; border: 1px solid rgba(255,255,255,0.15);
  font-size: 0.82rem; color: rgba(255,255,255,0.55);
}
.step-pill.active { border-color: #c9a84c; color: #fff; background: rgba(201, 168, 76, 0.12); }
.step-pill.done { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75); }
.step-num {
  width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.1);
  display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem;
}
.step-pill.active .step-num { background: #c9a84c; color: #111; }
.setup-panel {
  padding: 24px; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
  background: rgba(20, 20, 24, 0.85); margin-bottom: 20px;
}
.provider-grid { display: grid; gap: 12px; margin-top: 16px; }
.provider-card {
  text-align: left; padding: 16px; border: 2px solid rgba(255,255,255,0.12);
  border-radius: 8px; background: rgba(0,0,0,0.2); cursor: pointer;
  display: flex; flex-direction: column; gap: 6px;
}
.provider-card.selected { border-color: #c9a84c; background: rgba(201, 168, 76, 0.08); }
.badge-integrated { font-size: 0.75rem; color: #6ee7b7; }
.check-row { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; color: rgba(255,255,255,0.85); font-size: 0.9rem; }
.mode-cards { display: grid; gap: 12px; margin-top: 12px; }
.mode-card {
  text-align: left; padding: 16px; border: 2px solid rgba(255,255,255,0.12);
  border-radius: 8px; background: rgba(0,0,0,0.2); cursor: pointer;
}
.mode-card.active { border-color: #c9a84c; background: rgba(201, 168, 76, 0.08); }
.summary-list { line-height: 1.8; margin: 12px 0; padding-left: 0; list-style: none; }
.setup-actions { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; margin-top: 16px; }
.setup-error { color: #f87171; margin-bottom: 12px; font-size: 0.9rem; }
.form-stack { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.form-group { margin-bottom: 12px; }
.label { display: block; font-size: 0.85rem; font-weight: 600; color: #fff; margin-bottom: 6px; }
.input {
  width: 100%; padding: 10px 12px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.35);
  color: #fff; font-size: 0.9rem;
}
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; border: none; text-decoration: none; font-family: inherit;
}
.btn-primary { background: #c9a84c; color: #111; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline {
  background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.25);
}
</style>
