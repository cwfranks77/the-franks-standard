<template>
  <div class="setup-page">
    <div class="container">
      <div class="setup-wrapper">
        <header class="setup-header text-center">
          <h1>Set up your dropship business</h1>
          <p class="text-muted">
            You choose your supplier — we walk you through it. The Franks Standard does not assign a wholesaler to you.
          </p>
        </header>

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
            <input v-model="form.storeContactEmail" class="input" type="email" placeholder="brandy@thefranksstandard.com" />
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
          <p class="text-muted">Remember: COA or signed guarantee still required on every listing — that is The Franks Standard.</p>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { providerByKey, useSellerDropship } from '~/composables/useSellerDropship.js'

definePageMeta({ middleware: 'requires-auth' })

useSeoMeta({
  title: 'Dropship setup — The Franks Standard',
  description: 'Choose your own dropship supplier. Guided setup for sellers on The Franks Standard.',
})

const router = useRouter()
const { providers, saving, error, settings, load, saveSetup } = useSellerDropship()

const stepLabels = ['Provider', 'Account', 'Fulfillment', 'API', 'Done']
const step = ref(1)

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

async function persistPartial (complete = false) {
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
</style>
