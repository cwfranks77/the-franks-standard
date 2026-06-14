<template>
  <div class="setup-page">
    <div class="container">
      <div class="setup-wrapper">
        <header class="setup-header text-center">
          <h1>Set up your dropship business</h1>
          <p class="text-muted">
            <span class="ai-badge">AI setup</span> — answer a few questions, get a full plan, then auto-fill the wizard below.
          </p>
        </header>

        <div v-if="policyLoading" class="text-muted text-center">Loading seller requirements…</div>
        <SellerPolicyAgreement v-else-if="needsPolicyAcceptance" @accepted="loadPolicyStatus" />
        <template v-else>
        <section class="ai-coach" :class="{ open: showAi }">
          <button type="button" class="ai-coach-toggle" @click="showAi = !showAi">
            {{ showAi ? '▼' : '▶' }} Full AI dropship setup (start here)
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
              <span>I want auto-dispatch to my supplier when possible (Doba / Inventory Source API)</span>
            </label>
            <div class="form-group">
              <label class="label">Existing supplier name (optional)</label>
              <input v-model="aiIntake.supplierName" class="input" placeholder="Leave blank to let AI recommend" />
            </div>
            <button type="button" class="btn btn-primary" :disabled="aiBusy" @click="runAiSetup">
              {{ aiBusy ? 'Building plan…' : 'Generate full AI setup plan' }}
            </button>
            <div v-if="aiPlan" class="ai-plan">
              <p class="ai-plan-lead"><strong>{{ aiPlan.recommendedProviderName }}</strong> · {{ aiPlan.fulfillmentMode === 'integrated' ? 'Auto-dispatch' : 'Manual fulfillment' }}</p>
              <p class="text-muted small">{{ aiPlan.whyProvider }}</p>
              <p class="text-muted small">{{ aiPlan.storeBio }}</p>
              <h3>Your checklist</h3>
              <ul>
                <li v-for="(s, i) in aiPlan.setupSteps" :key="'s' + i">{{ s }}</li>
              </ul>
              <h3>Import products</h3>
              <ul>
                <li v-for="(s, i) in aiPlan.catalogSteps" :key="'c' + i">{{ s }}</li>
              </ul>
              <button type="button" class="btn btn-primary btn-lg mt-2" @click="applyAiPlan">
                Apply to wizard &amp; continue
              </button>
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
          <h2>Step 1 — Choose your supplier platform</h2>
          <p class="text-muted">Pick whoever you want. You can change this later.</p>
          <div class="provider-grid">
            <button
              v-for="p in providers"
              :key="p.key"
              type="button"
              class="provider-card"
              :class="{ selected: form.providerKey === p.key }"
              @click="selectProvider(p)"
            >
              <strong>{{ p.name }}</strong>
              <span class="text-muted small">{{ p.note }}</span>
              <span v-if="p.integrated" class="badge-integrated">Optional auto-dispatch</span>
            </button>
          </div>
          <div v-if="form.providerKey === 'custom'" class="form-group mt-3">
            <label class="label">Your supplier or company name</label>
            <input v-model="form.customProviderName" class="input" placeholder="e.g. Midwest Collectibles Wholesale" required />
          </div>
        </section>

        <section v-if="step === 2" class="setup-panel">
          <h2>Step 2 — Your store on The Franks Standard</h2>
          <div class="form-group">
            <label class="label">Store name (shown to buyers)</label>
            <input v-model="form.storeName" class="input" placeholder="Brandy's Sporting Goods" />
          </div>
          <div class="form-group">
            <label class="label">Store link slug</label>
            <input v-model="form.storeSlug" class="input" placeholder="brandyssportinggoods" />
            <p class="text-muted small">
              Your shop URL:
              <strong>thefranksstandard.com/store/{{ form.storeSlug || 'your-slug' }}</strong>
            </p>
          </div>
          <div class="form-group">
            <label class="label">Customer support email</label>
            <input v-model="form.storeContactEmail" class="input" type="email" placeholder="yourname@thefranksstandard.com" />
            <p class="text-muted small">Must be @thefranksstandard.com — buyers reach you through platform checkout &amp; Video Call, not personal inboxes.</p>
          </div>
          <h3 class="mt-3">Supplier account</h3>
          <p v-if="selectedProvider" class="text-muted">{{ selectedProvider.note }}</p>
          <ul class="checklist">
            <li v-if="selectedProvider?.website">
              <a :href="selectedProvider.website" target="_blank" rel="noopener noreferrer">Open {{ selectedProvider.name }} signup</a>
              and create your seller account (use your own email — not ours).
            </li>
            <li v-else>Contact your supplier directly and confirm they will dropship to your buyers.</li>
            <li>Save your login — you will place orders through your supplier, not through The Franks Standard.</li>
            <li>We only help list on the marketplace and queue order details when a buyer pays.</li>
          </ul>
          <label class="check-row">
            <input v-model="form.accountCreated" type="checkbox" />
            <span>I have (or will use) my own account with this supplier</span>
          </label>
          <div class="form-group mt-3">
            <label class="label">Account email (optional)</label>
            <input v-model="form.providerAccountEmail" class="input" type="email" placeholder="you@yourbusiness.com" />
          </div>
          <div class="form-group">
            <label class="label">Supplier portal URL (optional)</label>
            <input v-model="form.supplierPortalUrl" class="input" type="url" placeholder="https://..." />
          </div>
        </section>

        <section v-if="step === 3" class="setup-panel">
          <h2>Step 3 — How orders get fulfilled</h2>
          <div class="mode-cards">
            <button
              type="button"
              class="mode-card"
              :class="{ active: form.fulfillmentMode === 'manual' }"
              @click="form.fulfillmentMode = 'manual'"
            >
              <strong>Manual (recommended to start)</strong>
              <p class="text-muted small">When someone buys, we notify you with buyer + SKU. You place the order with your supplier.</p>
            </button>
            <button
              v-if="canUseIntegrated"
              type="button"
              class="mode-card"
              :class="{ active: form.fulfillmentMode === 'integrated' }"
              @click="form.fulfillmentMode = 'integrated'"
            >
              <strong>Auto-dispatch (optional)</strong>
              <p class="text-muted small">Connect your own API keys so paid orders can forward to Doba / Inventory Source automatically.</p>
            </button>
          </div>
          <p v-if="!canUseIntegrated" class="text-muted small mt-2">
            Your chosen provider uses manual fulfillment on our site — you stay in control of every order.
          </p>
        </section>

        <section v-if="step === 4" class="setup-panel">
          <h2>Step 4 — Connect your API (optional)</h2>
          <p class="text-muted">Only if you chose auto-dispatch. Keys are stored securely and only used for your orders.</p>
          <div v-if="form.providerKey === 'doba'" class="form-stack">
            <div class="form-group">
              <label class="label">Your FLXPOINT / Doba API key</label>
              <input v-model="form.flxpointApiKey" class="input" type="password" autocomplete="off" placeholder="From your Doba developer settings" />
            </div>
            <div class="form-group">
              <label class="label">Doba supplier ID</label>
              <input v-model="form.dobaSupplierId" class="input" placeholder="Your supplier ID in Doba" />
            </div>
            <div class="form-group">
              <label class="label">Doba warehouse ID</label>
              <input v-model="form.dobaWarehouseId" class="input" placeholder="Your warehouse ID in Doba" />
            </div>
          </div>
          <div v-else-if="form.providerKey === 'inventory-source'" class="form-stack">
            <div class="form-group">
              <label class="label">Your Inventory Source API key</label>
              <input v-model="form.inventorySourceApiKey" class="input" type="password" autocomplete="off" placeholder="From Inventory Source dashboard" />
            </div>
          </div>
          <p class="text-muted small">Skip this step if you prefer manual fulfillment — you can add keys later from this page.</p>
        </section>

        <section v-if="step === 5" class="setup-panel">
          <h2>You are ready to list</h2>
          <ul class="summary-list">
            <li><strong>Provider:</strong> {{ displayProviderName }}</li>
            <li><strong>Fulfillment:</strong> {{ form.fulfillmentMode === 'integrated' ? 'Auto-dispatch (when keys set)' : 'Manual — you place supplier orders' }}</li>
            <li><strong>Next:</strong> Create a dropship listing with supplier name, contact, and SKU per product.</li>
          </ul>
          <p class="text-muted">Remember: seller proof (uploaded COA or Franks COA) is required when the item category requires it — you back the item, not the Platform.</p>
        </section>

        <div class="setup-actions">
          <button v-if="step > 1" type="button" class="btn btn-secondary" :disabled="saving" @click="step -= 1">Back</button>
          <button
            v-if="step < 5"
            type="button"
            class="btn btn-primary"
            :disabled="!canAdvance || saving"
            @click="goNext"
          >
            Continue
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary btn-lg"
            :disabled="saving"
            @click="finishSetup"
          >
            {{ saving ? 'Saving…' : 'Finish & list an item' }}
          </button>
        </div>

        <p class="text-center mt-3">
          <NuxtLink to="/sell?mode=dropship">Skip for now — go to sell page</NuxtLink>
        </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { providerByKey, useSellerDropship } from '~/composables/useSellerDropship.js'
import { buildDropshipAiPlan } from '~/utils/dropshipAiSetup'

definePageMeta({ middleware: 'requires-auth' })

const {
  needsAcceptance: needsPolicyAcceptance,
  loading: policyLoading,
  loadStatus: loadPolicyStatus,
} = useSellerPolicyAcceptance()

onMounted(() => loadPolicyStatus())

useSeoMeta({
  title: 'Dropship setup — The Franks Standard',
  description: 'Choose your own dropship supplier. Guided setup for sellers on The Franks Standard.',
})

const router = useRouter()
const route = useRoute()
const { providers, saving, error, settings, load, saveSetup } = useSellerDropship()

const stepLabels = ['Provider', 'Account', 'Fulfillment', 'API', 'Done']
const step = ref(1)
const showAi = ref(true)
const aiBusy = ref(false)
const aiPlan = ref(null)

const aiIntake = reactive({
  storeName: "Brandy's Sporting Goods",
  niche: 'sports-cards',
  nicheDetail: '',
  experience: 'new',
  wantsAutomation: false,
  monthlyOrders: '0-5',
  supplierName: '',
  contactEmail: '',
})

const form = reactive({
  storeName: "Brandy's Sporting Goods",
  storeSlug: 'brandyssportinggoods',
  storeContactEmail: 'brandy@thefranksstandard.com',
  providerKey: 'custom',
  customProviderName: '',
  accountCreated: false,
  providerAccountEmail: '',
  supplierPortalUrl: '',
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
}

async function persistPartial (complete = false) {
  const { validateStoreContactEmail } = await import('~/utils/offPlatformGuard.js')
  const contactCheck = validateStoreContactEmail(form.storeContactEmail)
  if (!contactCheck.ok) {
    alert(contactCheck.message)
    return { ok: false }
  }
  return saveSetup({
    setupComplete: complete,
    setupStep: step.value,
    storeName: form.storeName,
    storeSlug: form.storeSlug,
    storeContactEmail: form.storeContactEmail,
    preferredProviderKey: form.providerKey,
    preferredProviderName: displayProviderName.value,
    fulfillmentMode: form.fulfillmentMode,
    providerAccountEmail: form.providerAccountEmail,
    supplierPortalUrl: form.supplierPortalUrl,
    flxpointApiKey: form.flxpointApiKey,
    inventorySourceApiKey: form.inventorySourceApiKey,
    dobaSupplierId: form.dobaSupplierId,
    dobaWarehouseId: form.dobaWarehouseId,
  })
}

async function goNext () {
  if (!canAdvance.value) return
  if (step.value === 3 && form.fulfillmentMode === 'manual') {
    step.value = 5
  } else {
    step.value += 1
  }
  await persistPartial(false)
}

async function finishSetup () {
  const { validateStoreContactEmail } = await import('~/utils/offPlatformGuard.js')
  const contactCheck = validateStoreContactEmail(form.storeContactEmail)
  if (!contactCheck.ok) {
    alert(contactCheck.message)
    return
  }
  const res = await saveSetup({
    setupComplete: true,
    setupStep: 5,
    storeName: form.storeName,
    storeSlug: form.storeSlug,
    storeContactEmail: form.storeContactEmail,
    preferredProviderKey: form.providerKey,
    preferredProviderName: displayProviderName.value,
    fulfillmentMode: form.fulfillmentMode,
    providerAccountEmail: form.providerAccountEmail,
    supplierPortalUrl: form.supplierPortalUrl,
    flxpointApiKey: form.flxpointApiKey,
    inventorySourceApiKey: form.inventorySourceApiKey,
    dobaSupplierId: form.dobaSupplierId,
    dobaWarehouseId: form.dobaWarehouseId,
  })
  if (res.ok) await router.push('/sell?mode=dropship')
}

onMounted(async () => {
  if (route.query.ai === '1') showAi.value = true
  await load()
  if (settings.value) {
    step.value = Math.max(1, Math.min(5, Number(settings.value.setup_step) || 1))
    form.providerKey = settings.value.preferred_provider_key || 'custom'
    if (form.providerKey === 'custom') {
      form.customProviderName = settings.value.preferred_provider_name || ''
    }
    form.providerAccountEmail = settings.value.provider_account_email || ''
    form.supplierPortalUrl = settings.value.supplier_portal_url || ''
    form.fulfillmentMode = settings.value.fulfillment_mode || 'manual'
    if (settings.value.setup_complete) step.value = 5
  }
})
</script>

<style scoped>
.setup-page { padding: 48px 0 80px; }
.setup-wrapper { max-width: 720px; margin: 0 auto; }
.setup-header h1 { margin-bottom: 8px; }
.step-track { display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0; }
.step-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 999px; border: 1px solid #d7dde6;
  font-size: 0.82rem; color: #6b7280;
}
.step-pill.active { border-color: var(--gold); background: #fff8d9; color: #1f2937; }
.step-pill.done { background: #f3f4f6; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%; background: #e5e7eb;
  display: inline-flex; align-items: center; justify-content: center; font-weight: 600;
}
.step-pill.active .step-num { background: var(--gold); }
.setup-panel {
  padding: 24px; border: 1px solid #e5e7eb; border-radius: var(--radius-lg);
  background: #fff; margin-bottom: 20px;
}
.provider-grid { display: grid; gap: 12px; margin-top: 16px; }
.provider-card {
  text-align: left; padding: 16px; border: 2px solid #e5e7eb; border-radius: var(--radius);
  background: #fff; cursor: pointer; display: flex; flex-direction: column; gap: 6px;
}
.provider-card.selected { border-color: var(--gold); background: #fffbeb; }
.badge-integrated { font-size: 0.75rem; color: #065f46; }
.checklist { margin: 16px 0; padding-left: 1.2rem; line-height: 1.7; }
.check-row { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; }
.mode-cards { display: grid; gap: 12px; margin-top: 12px; }
.mode-card {
  text-align: left; padding: 16px; border: 2px solid #e5e7eb; border-radius: var(--radius);
  background: #fff; cursor: pointer;
}
.mode-card.active { border-color: var(--gold); background: #fffbeb; }
.summary-list { line-height: 1.8; margin: 12px 0; }
.setup-actions { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
.setup-error { color: #b91c1c; margin-bottom: 12px; }
.form-stack { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.ai-badge {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.ai-coach {
  border: 2px solid #c4b5fd;
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  background: linear-gradient(180deg, #faf5ff 0%, #fff 100%);
}
.ai-coach-toggle {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  font-weight: 700;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #5b21b6;
}
.ai-coach-body { padding: 0 16px 20px; }
.ai-plan {
  margin-top: 16px;
  padding: 14px;
  background: #f9fafb;
  border-radius: var(--radius);
  border: 1px solid #e5e7eb;
}
.ai-plan ul { line-height: 1.65; padding-left: 1.2rem; margin: 8px 0; font-size: 0.92rem; }
.ai-plan h3 { font-size: 0.95rem; margin-top: 12px; color: #374151; }
.ai-plan-lead { margin-bottom: 8px; }
.form-row-ai { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 520px) { .form-row-ai { grid-template-columns: 1fr; } }
</style>
