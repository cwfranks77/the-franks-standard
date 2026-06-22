<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport, getBcStorefrontPath } from '~/utils/bcSupport.js'
import { BC_META_DEFAULTS } from '~/utils/bcMetaDefaults.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'
import {
  BC_PLATFORM_LINKS,
  summarizeBcOrders,
  ordersToPrintableText,
} from '~/utils/bcMarketingAutomation.js'

definePageMeta({
  layout: 'bc-audio',
  middleware: ['bc-ops-host', 'bc-ops-auth'],
})

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))
const { revoke } = useOpsSession()
const { theme, applyPreset, patch, resetTheme, publishTheme, presets, themeSaving, themeMessage } = useBcTheme()

const tab = ref('dashboard')
const orders = ref([])
const ordersLoading = ref(false)
const ordersError = ref('')
const pendingAccounts = ref(0)

const BC_SEO_DEFAULTS = { ...BC_META_DEFAULTS }

const seo = ref({ ...BC_SEO_DEFAULTS })
const seoLoading = ref(false)
const seoSaving = ref(false)
const seoMessage = ref('')
const seoError = ref('')
const seoInfo = ref('')

function opsErrorMessage (e, fallback) {
  const data = e?.data
  if (data && typeof data === 'object') {
    return String(data.error || data.statusMessage || fallback)
  }
  return String(e?.message || fallback)
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'website', label: 'Edit website' },
  { id: 'homepage', label: 'Homepage text' },
  { id: 'store', label: 'Manual products' },
  { id: 'inventory', label: 'Inventory & pricing' },
  { id: 'catalog', label: 'Hide catalog items' },
  { id: 'accounts', label: 'Customer accounts' },
  { id: 'ledger', label: 'Transactions & tax' },
  { id: 'monitor', label: 'Traffic & errors' },
  { id: 'seo', label: 'SEO & social' },
  { id: 'theme', label: 'Colors & theme' },
  { id: 'activity', label: 'Sales & activity' },
  { id: 'orders', label: 'Orders' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'auctions', label: 'Auctions' },
  { id: 'payouts', label: 'Seller payouts' },
  { id: 'app', label: 'B&C app' },
  { id: 'tools', label: 'Fix problems' },
]

function goToTab (id) {
  tab.value = id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const orderSummary = computed(() => summarizeBcOrders(orders.value))

async function loadSeo () {
  seoLoading.value = true
  seoError.value = ''
  seoInfo.value = ''
  seo.value = { ...BC_SEO_DEFAULTS }
  try {
    const data = await fetchBcPublicSiteContent(['bcMeta'])
    if (data?.bcMeta && typeof data.bcMeta === 'object') {
      seo.value = { ...seo.value, ...data.bcMeta }
    }
    if (!getStoredOpsPhrase()) {
      seoInfo.value = 'Settings loaded. Tap the B&C logo 5× and unlock once before Save if you restarted your browser.'
    }
  } catch (e) {
    seoInfo.value = `Using built-in defaults (${opsErrorMessage(e, 'could not read cloud copy')}). You can still edit and save.`
  } finally {
    seoLoading.value = false
  }
}

async function saveSeo () {
  seoSaving.value = true
  seoMessage.value = ''
  seoError.value = ''
  if (!getStoredOpsPhrase()) {
    seoError.value = 'Owner password needed — tap the B&C logo 5×, unlock, then click Save SEO again.'
    seoSaving.value = false
    return
  }
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: 'bcMeta', payload: seo.value },
    })
    seoMessage.value = 'Saved to cloud — Google and social previews update within a minute. Refresh the storefront to see changes.'
  } catch (e) {
    const msg = opsErrorMessage(e, 'Save failed.')
    if (/unauthorized|expired/i.test(msg)) {
      seoError.value = 'Owner password expired — tap the B&C logo 5×, unlock, then save again.'
    } else if (/not configured|supabase/i.test(msg)) {
      seoError.value = 'Cloud save could not reach Supabase. Check GitHub secrets NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_KEY, then redeploy.'
    } else {
      seoError.value = msg
    }
  } finally {
    seoSaving.value = false
  }
}

async function loadPendingAccounts () {
  try {
    const data = await opsFetch('/api/ops/bc-customer-accounts')
    pendingAccounts.value = data?.pending || 0
  } catch {
    pendingAccounts.value = 0
  }
}

async function loadOrders () {
  ordersLoading.value = true
  ordersError.value = ''
  try {
    const data = await opsFetch('/api/ops/bc-orders')
    orders.value = data?.rows || []
  } catch (e) {
    ordersError.value = e?.data?.statusMessage || 'Could not load orders.'
  } finally {
    ordersLoading.value = false
  }
}

function formatDate (v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

async function signOut () {
  await revoke()
  navigateTo(getBcStorefrontPath())
}

function clearSiteCache () {
  if (!import.meta.client) return
  try {
    localStorage.removeItem('bc-audio-theme-v1')
    sessionStorage.clear()
    caches?.keys?.().then((keys) => keys.forEach((k) => caches.delete(k)))
    navigator.serviceWorker?.getRegistrations?.().then((regs) => regs.forEach((r) => r.unregister()))
  } finally {
    window.location.reload()
  }
}

function printOrderSummary () {
  if (!import.meta.client) return
  const text = ordersToPrintableText(orderSummary.value)
  const w = window.open('', '_blank', 'width=720,height=640')
  if (!w) return
  w.document.write(`<pre style="font:12px/1.5 monospace;padding:16px;white-space:pre-wrap">${text.replace(/</g, '&lt;')}</pre>`)
  w.document.close()
  w.focus()
  w.print()
}

watch(tab, (t) => {
  if (t === 'orders' || t === 'activity' || t === 'dashboard') loadOrders()
  if (t === 'seo' || t === 'website') loadSeo()
  if (t === 'accounts' || t === 'dashboard') loadPendingAccounts()
})

onMounted(() => {
  loadOrders()
  loadPendingAccounts()
  if (tab.value === 'seo' || tab.value === 'website') loadSeo()
})

useSeoMeta({
  title: `B&C Owner Console — ${BC_BRAND.full}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="bc-panel">
    <header class="bc-panel__head">
      <div>
        <p class="bc-panel__eyebrow">B&amp;C website owner console</p>
        <h1>Run your storefront</h1>
        <p class="bc-panel__sub">Tap <strong>Dashboard</strong> for a full map of every tool — edit text, colors, orders, accounts, and the mobile app.</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
    </header>

    <div class="bc-panel__promo">
      <NuxtLink to="/bc-audio/ops/marketing-automation" class="btn btn-primary btn-sm">
        Marketing automation — weekly posts &amp; video ads
      </NuxtLink>
    </div>

    <nav class="bc-panel__tabs" aria-label="Owner console sections">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="bc-panel__tab"
        :class="{ active: tab === t.id }"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </nav>

  <!-- DASHBOARD -->
    <section v-show="tab === 'dashboard'" class="bc-panel__section">
      <h2>Owner dashboard — all tools</h2>
      <BcOpsDashboard
        :order-count="orderSummary.count"
        :pending-accounts="pendingAccounts"
        @go="goToTab"
      />
    </section>

  <!-- EDIT WEBSITE (combined) -->
    <section v-show="tab === 'website'" class="bc-panel__section">
      <h2>Edit your whole website</h2>
      <p class="bc-panel__note">Change homepage text, Google preview, and store colors in one place. Publish theme so every visitor sees updates.</p>
      <h3 class="bc-panel__h3">Homepage &amp; ribbon</h3>
      <BcOpsHomepageEditor />
      <h3 class="bc-panel__h3">SEO &amp; social sharing</h3>
      <p v-if="seoError" class="bc-alert bc-alert--err">{{ seoError }}</p>
      <p v-if="seoMessage" class="bc-alert bc-alert--ok">{{ seoMessage }}</p>
      <div v-if="seoLoading" class="bc-muted">Loading…</div>
      <template v-else>
        <div class="bc-form-stack">
          <label>Page title<input v-model="seo.title" class="input" type="text"></label>
          <label>Description<textarea v-model="seo.description" class="input bc-textarea" rows="3" /></label>
          <label>Share image URL<input v-model="seo.image" class="input" type="url"></label>
        </div>
        <button type="button" class="btn btn-primary btn-sm" :disabled="seoSaving" @click="saveSeo">Save SEO</button>
      </template>
      <h3 class="bc-panel__h3">Store colors</h3>
      <p v-if="themeMessage" class="bc-alert bc-alert--ok">{{ themeMessage }}</p>
      <div class="bc-panel__presets">
        <button
          v-for="p in presets"
          :key="p.id"
          type="button"
          class="bc-preset"
          :class="{ active: theme.presetId === p.id }"
          :style="{ '--swatch': p.accent }"
          @click="applyPreset(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="bc-panel__colors">
        <label>Main red<input type="color" :value="theme.accent" @input="patch({ accent: $event.target.value })"></label>
        <label>Background<input type="color" :value="theme.bg" @input="patch({ bg: $event.target.value })"></label>
      </div>
      <button type="button" class="btn btn-primary btn-sm" :disabled="themeSaving" @click="publishTheme">
        {{ themeSaving ? 'Publishing…' : 'Publish theme for all visitors' }}
      </button>
    </section>

  <!-- HOMEPAGE TEXT -->
    <section v-show="tab === 'homepage'" class="bc-panel__section">
      <h2>Homepage text &amp; ribbon</h2>
      <p class="bc-panel__note">Edit the headline, intro paragraph, and top ribbon on bcpoweraudio.com. Use <strong>Colors &amp; theme</strong> for red/background colors.</p>
      <BcOpsHomepageEditor />
    </section>

  <!-- STORE & PRODUCTS -->
    <section v-show="tab === 'store'" class="bc-panel__section">
      <h2>Manual product rows (optional)</h2>
      <p class="bc-panel__note">Extra products you add by hand. The live Petra catalog is managed under <strong>Inventory &amp; pricing</strong>.</p>
      <BcOpsStoreEditor />
    </section>

    <!-- INVENTORY & PRICING -->
    <section v-show="tab === 'inventory'" class="bc-panel__section">
      <h2>Inventory, wholesale &amp; retail prices</h2>
      <p class="bc-panel__note">This is your real storefront inventory from Petra. The number below is how many audio products customers can browse — not the manual add-on list.</p>
      <BcOpsInventoryPricing />
    </section>

  <!-- HIDE PETRA CATALOG ITEMS -->
    <section v-show="tab === 'catalog'" class="bc-panel__section">
      <h2>Hide products from the website</h2>
      <p class="bc-panel__note">Remove individual Petra items from bcpoweraudio.com without touching the wholesaler feed.</p>
      <BcOpsHiddenCatalog />
    </section>

  <!-- PRIVATE TRANSACTION LEDGER -->
    <section v-show="tab === 'ledger'" class="bc-panel__section">
      <h2>Transactions &amp; tax reserve</h2>
      <p class="bc-panel__note">Stripe revenue, 25% Louisiana tax reserve, Mercury bank, and Petra wholesale entries.</p>
      <BcOpsPrivateLedger />
    </section>

  <!-- SITE MONITOR -->
    <section v-show="tab === 'monitor'" class="bc-panel__section">
      <h2>Traffic, errors &amp; site activity</h2>
      <p class="bc-panel__note">Visitor errors below. Full transaction and signup feed is in the activity section.</p>
      <BcOpsSiteMonitor />
      <hr class="bc-panel__hr">
      <BcOpsActivityFeed />
    </section>

  <!-- SEO -->
    <section v-show="tab === 'seo'" class="bc-panel__section">
      <h2>Search &amp; social (Google share previews)</h2>
      <p class="bc-panel__note">Title and description shown in Google results and when someone shares your link.</p>
      <p v-if="seoError" class="bc-alert bc-alert--err">{{ seoError }}</p>
      <p v-if="seoInfo" class="bc-alert bc-alert--info">{{ seoInfo }}</p>
      <p v-if="seoMessage" class="bc-alert bc-alert--ok">{{ seoMessage }}</p>
      <div v-if="seoLoading" class="bc-muted">Loading…</div>
      <template v-else>
        <div class="bc-form-stack">
          <label>Page title<input v-model="seo.title" class="input" type="text"></label>
          <label>Description<textarea v-model="seo.description" class="input bc-textarea" rows="3" /></label>
          <label>Canonical site URL<input v-model="seo.url" class="input" type="url"></label>
          <label>Share image URL<input v-model="seo.image" class="input" type="url"></label>
          <label>Parent company line<input v-model="seo.parentCompany" class="input" type="text"></label>
        </div>
        <button type="button" class="btn btn-primary btn-sm" :disabled="seoSaving" @click="saveSeo">
          {{ seoSaving ? 'Saving…' : 'Save SEO' }}
        </button>
      </template>
    </section>

  <!-- THEME -->
    <section v-show="tab === 'theme'" class="bc-panel__section">
      <h2>Store colors</h2>
      <p class="bc-panel__note">Pick a look, then click <strong>Publish theme</strong> so every visitor sees it — not just your browser.</p>
      <p v-if="themeMessage" class="bc-alert bc-alert--ok">{{ themeMessage }}</p>
      <div class="bc-panel__presets">
        <button
          v-for="p in presets"
          :key="p.id"
          type="button"
          class="bc-preset"
          :class="{ active: theme.presetId === p.id }"
          :style="{ '--swatch': p.accent }"
          @click="applyPreset(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="bc-panel__colors">
        <label>Main red<input type="color" :value="theme.accent" @input="patch({ accent: $event.target.value })"></label>
        <label>Bright red<input type="color" :value="theme.accentBright" @input="patch({ accentBright: $event.target.value })"></label>
        <label>Background<input type="color" :value="theme.bg" @input="patch({ bg: $event.target.value })"></label>
        <label>Cards<input type="color" :value="theme.bgCard" @input="patch({ bgCard: $event.target.value })"></label>
      </div>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-primary btn-sm" :disabled="themeSaving" @click="publishTheme">
          {{ themeSaving ? 'Publishing…' : 'Publish theme for all visitors' }}
        </button>
        <button type="button" class="btn btn-outline btn-sm" @click="resetTheme">Reset to classic red</button>
      </div>
    </section>

  <!-- ACTIVITY -->
    <section v-show="tab === 'activity'" class="bc-panel__section">
      <h2>Sales &amp; activity</h2>
      <p class="bc-panel__note">Order totals from checkout. Bank deposits show in Stripe — match payout dates to these orders for tax filing.</p>
      <button type="button" class="btn btn-outline btn-sm" :disabled="ordersLoading" @click="loadOrders">
        {{ ordersLoading ? 'Loading…' : 'Refresh' }}
      </button>
      <p v-if="ordersError" class="bc-alert bc-alert--err">{{ ordersError }}</p>
      <div v-if="!ordersLoading" class="bc-activity-stats">
        <div class="bc-stat">
          <span class="bc-stat__label">Orders</span>
          <strong class="bc-stat__value">{{ orderSummary.count }}</strong>
        </div>
        <div class="bc-stat">
          <span class="bc-stat__label">Checkout total</span>
          <strong class="bc-stat__value">{{ orderSummary.grossDisplay }}</strong>
        </div>
        <div class="bc-stat">
          <span class="bc-stat__label">25% tax reserve</span>
          <strong class="bc-stat__value">{{ orderSummary.taxReserveDisplay }}</strong>
        </div>
        <div class="bc-stat">
          <span class="bc-stat__label">After reserve</span>
          <strong class="bc-stat__value">{{ orderSummary.operatingDisplay }}</strong>
        </div>
      </div>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-outline btn-sm" :disabled="!orders.length" @click="printOrderSummary">
          Print tax &amp; order summary
        </button>
        <a :href="BC_PLATFORM_LINKS.stripe_dashboard" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open Stripe ↗</a>
        <a :href="BC_PLATFORM_LINKS.stripe_payouts" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Stripe payouts ↗</a>
        <a :href="BC_PLATFORM_LINKS.mercury_dashboard" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Mercury bank ↗</a>
      </div>
      <p class="bc-panel__note bc-muted small">
        For Google traffic: set up Search Console at
        <a :href="BC_PLATFORM_LINKS.search_console" target="_blank" rel="noopener noreferrer">search.google.com/search-console</a>
        — full checklist is in Marketing automation.
      </p>
    </section>

  <!-- ORDERS -->
    <section v-show="tab === 'orders'" class="bc-panel__section">
      <h2>Recent orders</h2>
      <p class="bc-panel__note">Dropship orders from checkout. Refresh after a customer buys.</p>
      <button type="button" class="btn btn-outline btn-sm" :disabled="ordersLoading" @click="loadOrders">
        {{ ordersLoading ? 'Loading…' : 'Refresh orders' }}
      </button>
      <p v-if="ordersError" class="bc-alert bc-alert--err">{{ ordersError }}</p>
      <p v-if="!ordersLoading && !orders.length && !ordersError" class="bc-muted">No orders yet.</p>
      <div v-if="orders.length" class="bc-orders-table-wrap">
        <table class="bc-orders-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in orders" :key="row.id">
              <td>
                <div>{{ row.listing?.title || 'B&C order' }}</div>
                <div class="bc-muted small">{{ row.order?.buyer_email || row.order_id }}</div>
              </td>
              <td><span class="bc-status">{{ row.provider_status || 'queued' }}</span></td>
              <td>
                <span v-if="row.order?.tracking_number">{{ row.order.tracking_carrier || 'Carrier' }} #{{ row.order.tracking_number }}</span>
                <span v-else class="bc-muted">—</span>
              </td>
              <td class="bc-muted small">{{ formatDate(row.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  <!-- CUSTOMER ACCOUNTS -->
    <section v-show="tab === 'accounts'" class="bc-panel__section">
      <h2>Customer accounts — approve before purchase</h2>
      <p class="bc-panel__note">Shoppers sign up at <strong>/bc-audio/account</strong>. They cannot checkout until you approve them here.</p>
      <BcOpsCustomerAccounts />
    </section>

  <!-- DISPUTES -->
    <section v-show="tab === 'disputes'" class="bc-panel__section">
      <h2>Buyer disputes</h2>
      <p class="bc-panel__note">Open cases, run AI triage, and issue refunds under your shipping &amp; returns policy.</p>
      <BcOpsDisputes />
    </section>

  <!-- AUCTIONS -->
    <section v-show="tab === 'auctions'" class="bc-panel__section">
      <h2>Competition auctions</h2>
      <p class="bc-panel__note">Schedule auctions for rare gear. Anti-sniping extends the end time when bids arrive in the last 5 minutes.</p>
      <BcOpsAuctions />
    </section>

  <!-- PAYOUTS -->
    <section v-show="tab === 'payouts'" class="bc-panel__section">
      <h2>Seller payouts (Stripe Connect)</h2>
      <p class="bc-panel__note">Onboard sellers and send transfers after disputes clear. Your 25% tax reserve stays in the ledger tab.</p>
      <BcOpsPayouts />
    </section>

  <!-- B&C APP -->
    <section v-show="tab === 'app'" class="bc-panel__section">
      <h2>B&amp;C Performance Audio app</h2>
      <p class="bc-panel__note">Set Android and Windows download links. Customers can also install from the browser “Add to Home Screen” on phones.</p>
      <BcOpsAppSettings />
    </section>

  <!-- TOOLS -->
    <section v-show="tab === 'tools'" class="bc-panel__section">
      <h2>Fix problems</h2>
      <ul class="bc-tools-list">
        <li><strong>Store looks old?</strong> Click “Clear cache & reload” below, or open the site in a private window.</li>
        <li><strong>Changes not saving?</strong> Sign out, tap the logo 5×, unlock again, then save.</li>
        <li><strong>Support line on site:</strong> {{ support.phoneDisplay }}</li>
        <li><strong>Checkout broken?</strong> Confirm Supabase secrets are set in GitHub Actions for the B&amp;C deploy.</li>
      </ul>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-outline btn-sm" @click="clearSiteCache">Clear cache &amp; reload</button>
        <NuxtLink to="/bc-audio" class="btn btn-outline btn-sm">Open storefront</NuxtLink>
        <NuxtLink to="/bc-audio/open-door" class="btn btn-outline btn-sm">Open Door page</NuxtLink>
        <NuxtLink to="/bc-audio/ops/marketing-automation" class="btn btn-outline btn-sm">Marketing automation</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bc-panel { max-width: 960px; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
.bc-panel__head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem; }
.bc-panel__eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.14em; color: #ff5252; margin: 0 0 6px; }
.bc-panel__head h1 { font-size: 1.6rem; margin: 0 0 8px; }
.bc-panel__sub { color: #9ca3af; font-size: 0.92rem; margin: 0; max-width: 36rem; line-height: 1.5; }
.bc-panel__promo { margin-bottom: 1rem; }
.bc-activity-stats { display: flex; flex-wrap: wrap; gap: 1rem; margin: 14px 0; }
.bc-stat {
  padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(211,47,47,0.25);
  background: rgba(211,47,47,0.08); min-width: 120px;
}
.bc-stat__label { display: block; font-size: 0.72rem; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
.bc-stat__value { font-size: 1.35rem; color: #ff5252; }
.bc-panel__tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }
.bc-panel__tab {
  padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
  background: #16161c; color: #b8bcc6; font-size: 0.82rem; font-weight: 700; cursor: pointer;
}
.bc-panel__tab.active { background: rgba(211,47,47,0.2); border-color: #ff5252; color: #fff; }
.bc-panel__section {
  padding: 1.25rem 1.5rem; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; background: var(--bc-bg-card, #16161c);
}
.bc-panel__section h2 { font-size: 1.05rem; color: #ff5252; margin: 0 0 8px; }
.bc-panel__h3 { font-size: 0.92rem; color: #ff8a80; margin: 1.25rem 0 8px; }
.bc-panel__hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.5rem 0; }
.bc-panel__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 14px; line-height: 1.5; }
.bc-panel__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-textarea { min-height: 80px; resize: vertical; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
.bc-muted.small { font-size: 0.78rem; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.bc-alert--info { background: rgba(96,165,250,0.12); color: #93c5fd; }
.bc-cell-input { width: 100%; min-width: 72px; padding: 6px 8px; font-size: 0.85rem; }
.bc-panel__presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.bc-preset {
  padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
  background: #0a0a0c; color: #f5f5f7; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
}
.bc-preset::before { content: ''; width: 12px; height: 12px; border-radius: 50%; background: var(--swatch); }
.bc-preset.active { border-color: #ff5252; }
.bc-panel__colors { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 12px; }
.bc-panel__colors label { font-size: 0.78rem; color: #9ca3af; display: flex; flex-direction: column; gap: 6px; }
.bc-panel__colors input[type="color"] { width: 100%; height: 36px; border: none; border-radius: 8px; cursor: pointer; }
.bc-orders-table-wrap { overflow-x: auto; margin-top: 14px; }
.bc-orders-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-orders-table th, .bc-orders-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-orders-table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-status { text-transform: capitalize; color: #ff5252; font-weight: 600; }
.bc-tools-list { margin: 0 0 16px; padding-left: 1.2rem; color: #b8bcc6; line-height: 1.6; font-size: 0.9rem; }
</style>
