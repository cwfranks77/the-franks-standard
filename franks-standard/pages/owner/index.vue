<script setup>
import ownerTools from '~/data/owner-tools.json'
import productsCatalog from '~/data/products.json'

useHead({
  title: 'Owner Tools — The Franks Standard',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})

const { unlocked, tryUnlock, lock, error, keyConfigured } = useOwnerAccess()
const keyInput = ref('')
const keyError = ref(false)
const activeTool = ref('add-product')
const products = ref([...productsCatalog])
const transactionLog = ref([
  { id: 1, type: 'sale', detail: 'Sample escrow hold — cards-001', amount: 12500, at: '2026-06-14' },
  { id: 2, type: 'tax', detail: 'LA sales tax collected — zip 70112', amount: 118.13, at: '2026-06-14' },
  { id: 3, type: 'reserve', detail: '25% income tax reserve', amount: 3125, at: '2026-06-14' }
])
const coaSerial = ref('')
const nextCoa = computed(() => {
  const year = new Date().getFullYear()
  const n = String(Math.floor(Math.random() * 900000) + 100000)
  return `FS-${year}-${n}`
})
const wholesaleLog = ref([
  { node: 'Distributor A — cards', amount: 4500, status: 'transferred', at: '2026-06-13' },
  { node: 'Distributor B — watches', amount: 8200, status: 'pending', at: '2026-06-14' }
])
const enforcementQueue = ref([
  { id: 'R-101', issue: 'Counterfeit report — pending review', status: 'open' },
  { id: 'R-098', issue: 'Forced refund — seller refused', status: 'freeze' }
])
const importStatus = ref('')
const rebuildStatus = ref('')

const activeMeta = computed(() => ownerTools.find((t) => t.id === activeTool.value))

function submitKey() {
  keyError.value = false
  tryUnlock(keyInput.value).then((ok) => {
    if (!ok) keyError.value = true
  })
}

function addProduct(payload) {
  const id = `new-${Date.now()}`
  products.value.push({
    id,
    name: payload.name,
    description: payload.description,
    category: payload.category || 'General',
    featured: false,
    images: ['/img/franks-pavilion.png'],
    coaId: null
  })
  transactionLog.value.unshift({
    id: Date.now(),
    type: 'catalog',
    detail: `Added listing: ${payload.name}`,
    amount: 0,
    at: new Date().toISOString().slice(0, 10)
  })
  activeTool.value = 'catalog-editor'
}

function issueCoa() {
  coaSerial.value = nextCoa.value
}

function simulateImport() {
  importStatus.value = 'Ready — drop eBay Seller Hub CSV here (UI placeholder; wire to /sell/import in production).'
}

function runRebuildNote() {
  rebuildStatus.value = 'Local: npm run generate — runs nuxt generate, patch-gh-pages-spa.cjs, inject-franks-seo.cjs, ping-indexnow.cjs'
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <MainHeader />

    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <div v-if="!unlocked" class="max-w-md mx-auto bg-surface2 border border-border rounded-xl p-6 mt-12">
        <h1 class="text-xl font-semibold mb-2">Owner access</h1>
        <p class="text-sm text-textMuted mb-4">
          Enter your <strong>operator phrase</strong> — the same password stored as
          <code class="text-primary">NUXT_PUBLIC_OPS_ACCESS_KEY</code> in GitHub Secrets.
        </p>
        <p v-if="!keyConfigured" class="text-xs text-danger mb-3">
          This build has no phrase configured yet. Add the secret in GitHub or create a local
          <code>.env</code> file, then run <code>npm run generate</code> again.
        </p>
        <form class="space-y-3" @submit.prevent="submitKey">
          <input
            v-model="keyInput"
            type="password"
            placeholder="Operator phrase"
            class="w-full bg-bg border border-border rounded px-3 py-2 text-sm"
            autocomplete="off"
            :disabled="!keyConfigured"
          />
          <p v-if="keyError || error" class="text-xs text-danger">{{ error || 'Invalid phrase. Try again.' }}</p>
          <button type="submit" class="w-full py-2 bg-primary text-bg rounded text-sm font-medium">
            Unlock tools
          </button>
        </form>
      </div>

      <template v-else>
        <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold">Owner tools</h1>
            <p class="text-sm text-textMuted mt-1">
              Charles Franks — marketplace operations, tax, catalog, and trust enforcement.
            </p>
          </div>
          <button
            type="button"
            class="text-xs text-textMuted border border-border rounded px-3 py-1.5 hover:border-primary"
            @click="lock"
          >
            Lock dashboard
          </button>
        </div>

        <OwnerToolsPanel
          :tools="ownerTools"
          :active-tool="activeTool"
          @select="activeTool = $event"
        >
          <header class="mb-4 pb-3 border-b border-border">
            <p class="text-xs text-textMuted uppercase tracking-wide">{{ activeMeta?.category }}</p>
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <span aria-hidden="true">{{ activeMeta?.icon }}</span>
              {{ activeMeta?.title }}
            </h2>
            <p class="text-sm text-textMuted mt-1">{{ activeMeta?.description }}</p>
          </header>

          <CatalogManager
            v-if="activeTool === 'add-product' || activeTool === 'catalog-editor'"
            :products="products"
            @add="addProduct"
          />

          <TaxReserveCalculator v-else-if="activeTool === 'tax-reserve'" />

          <ShippingTaxCalculator v-else-if="activeTool === 'shipping-tax'" />

          <div v-else-if="activeTool === 'wholesale-transfer'" class="space-y-3 text-sm">
            <p class="text-textMuted">Instant wholesale transfers to fulfillment nodes after each sale.</p>
            <ul class="space-y-2">
              <li
                v-for="(row, i) in wholesaleLog"
                :key="i"
                class="flex flex-wrap justify-between gap-2 bg-bg border border-border rounded px-3 py-2"
              >
                <span>{{ row.node }}</span>
                <span class="text-textMuted">${{ row.amount.toLocaleString() }} · {{ row.status }} · {{ row.at }}</span>
              </li>
            </ul>
          </div>

          <div v-else-if="activeTool === 'transaction-log'" class="space-y-2 text-sm">
            <ul class="space-y-2 max-h-64 overflow-y-auto">
              <li
                v-for="row in transactionLog"
                :key="row.id"
                class="flex flex-wrap justify-between gap-2 bg-bg border border-border rounded px-3 py-2"
              >
                <span><span class="text-primary uppercase text-xs">{{ row.type }}</span> — {{ row.detail }}</span>
                <span class="text-textMuted">{{ row.at }}<template v-if="row.amount"> · ${{ row.amount.toLocaleString() }}</template></span>
              </li>
            </ul>
          </div>

          <div v-else-if="activeTool === 'coa-manager'" class="space-y-4 text-sm">
            <p class="text-textMuted">Floor office COA serial tied to one listing. Buyers verify before payment.</p>
            <button
              type="button"
              class="px-4 py-2 bg-primary text-bg rounded text-sm"
              @click="issueCoa"
            >
              Issue new COA serial
            </button>
            <p v-if="coaSerial" class="font-mono text-secondary text-lg">{{ coaSerial }}</p>
          </div>

          <div v-else-if="activeTool === 'enforcement'" class="space-y-2 text-sm">
            <ul class="space-y-2">
              <li
                v-for="row in enforcementQueue"
                :key="row.id"
                class="flex justify-between bg-bg border border-border rounded px-3 py-2"
              >
                <span>{{ row.id }} — {{ row.issue }}</span>
                <span class="text-danger uppercase text-xs">{{ row.status }}</span>
              </li>
            </ul>
          </div>

          <div v-else-if="activeTool === 'ebay-import'" class="space-y-3 text-sm">
            <p class="text-textMuted">Import from eBay Seller Hub CSV export.</p>
            <button type="button" class="px-4 py-2 border border-border rounded hover:border-primary" @click="simulateImport">
              Choose CSV file
            </button>
            <p v-if="importStatus" class="text-secondary">{{ importStatus }}</p>
          </div>

          <div v-else-if="activeTool === 'ai-store'" class="space-y-3 text-sm text-textMuted">
            <p>AI Store Builder drafts listing copy, SEO, and dropship setup steps.</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Generate product descriptions from photos</li>
              <li>Suggest category and COA requirements</li>
              <li>Full dropship onboarding checklist</li>
            </ul>
          </div>

          <div v-else-if="activeTool === 'social-ads'" class="space-y-3 text-sm">
            <p class="text-textMuted">Campaign copy lives in <code class="text-primary">assets/SOCIAL_MEDIA_ADS.md</code></p>
            <ul class="list-disc list-inside space-y-1 text-textMuted">
              <li>Security stack ads (COA, escrow, enforcement)</li>
              <li>X / Facebook / Instagram / TikTok / Telegram</li>
              <li>FOUNDERS10 and HONOR26 promo codes</li>
            </ul>
          </div>

          <div v-else-if="activeTool === 'site-rebuild'" class="space-y-3 text-sm">
            <p class="text-textMuted">Uses today&apos;s revised build scripts in order:</p>
            <ol class="list-decimal list-inside space-y-1 text-textMuted">
              <li><code>nuxt generate</code></li>
              <li><code>scripts/patch-gh-pages-spa.cjs</code></li>
              <li><code>scripts/inject-franks-seo.cjs</code></li>
              <li><code>scripts/ping-indexnow.cjs</code></li>
            </ol>
            <button type="button" class="px-4 py-2 bg-secondary/20 text-secondary border border-secondary/40 rounded" @click="runRebuildNote">
              Show build command
            </button>
            <p v-if="rebuildStatus" class="text-xs font-mono bg-bg border border-border rounded p-2">{{ rebuildStatus }}</p>
          </div>
        </OwnerToolsPanel>
      </template>
    </main>

    <MainFooter />
  </div>
</template>
