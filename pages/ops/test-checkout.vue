<template>
  <div class="test-page">
    <div class="container">
      <header class="test-head">
        <p class="eyebrow">Owner toolkit</p>
        <h1>Owner QA &amp; tests</h1>
        <p class="text-muted lede">
          Run automated checks after every deploy. Catches broken modules (like charities), API errors, and checkout issues before buyers hit them.
        </p>
        <div class="test-actions">
          <NuxtLink to="/ops/panel" class="btn btn-outline btn-sm">&larr; Operator console</NuxtLink>
          <button type="button" class="btn btn-primary btn-sm" :disabled="running" @click="runAll">
            {{ running ? 'Running tests…' : 'Run all automated tests' }}
          </button>
          <NuxtLink to="/pay" class="btn btn-outline btn-sm">Pay &amp; fees</NuxtLink>
          <a href="https://dashboard.stripe.com/test/checkout" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Stripe test payments</a>
        </div>
      </header>

      <p v-if="checkoutBanner" class="checkout-banner" :class="checkoutBannerClass" role="status">
        {{ checkoutBanner }}
      </p>

      <section class="test-card smoke-card">
        <div class="smoke-head">
          <h2>Automated smoke tests</h2>
          <p v-if="lastRunAt" class="small text-muted">Last run: {{ lastRunAt }} — {{ passCount }} passed, {{ failCount }} failed</p>
        </div>
        <ul class="smoke-list">
          <li v-for="row in results" :key="row.id" class="smoke-row" :class="row.status">
            <span class="smoke-icon" aria-hidden="true">{{ smokeIcon(row.status) }}</span>
            <div class="smoke-body">
              <strong>{{ row.label }}</strong>
              <span class="smoke-msg">{{ row.message || (row.status === 'pending' ? 'Not run yet' : '') }}</span>
            </div>
          </li>
        </ul>
        <p class="small text-muted">Sign in with your site account before running API tests. After deploy, hard-refresh (Ctrl+Shift+R) to clear cached JS.</p>
      </section>

      <section class="test-card">
        <h2>Open critical pages</h2>
        <p class="small text-muted">Click each — page should load without a 500 or blank screen.</p>
        <div class="page-chips">
          <NuxtLink v-for="p in criticalPages" :key="p.path" :to="p.path" class="btn btn-outline btn-sm" target="_blank">
            {{ p.label }}
          </NuxtLink>
          <NuxtLink to="/sell/start" class="btn btn-outline btn-sm" target="_blank">List item chooser</NuxtLink>
        </div>
      </section>

      <section class="test-card highlight">
        <h2>Stripe — $1 tax smoke test</h2>
        <p>
          One-time <strong>$1.00</strong> checkout with billing address + sales tax (same code path as Pro).
          Cancel on Stripe or refund yourself in the Dashboard after you confirm tax lines appear.
        </p>
        <ol class="numbered">
          <li>Sign in to the site (Google or email) — required so the Edge Function knows who you are.</li>
          <li>Click the button below.</li>
          <li>On Stripe: enter a <strong>US billing address</strong> (e.g. your real state).</li>
          <li>Look for a <strong>Tax</strong> line before you pay — that means Stripe Tax is working.</li>
        </ol>
        <p v-if="!signedIn" class="warn">Sign in first — button will send you to login, then back here.</p>
        <p class="small text-muted">Signed in as: <strong>{{ signedInLabel }}</strong></p>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="platformLoading"
          @click="runSmokeTest"
        >
          {{ platformLoading ? 'Opening Stripe…' : 'Open $1 tax test checkout →' }}
        </button>
        <p v-if="platformError" class="error" role="alert">{{ platformError }}</p>
      </section>

      <section class="test-card">
        <h2>Pro subscription ($14.99/mo + tax)</h2>
        <p>Same as buyers on <NuxtLink to="/pay">Pay &amp; fees</NuxtLink> — uses API checkout, not the old Payment Link.</p>
        <button
          type="button"
          class="btn btn-outline"
          :disabled="platformLoading"
          @click="runProTest"
        >
          {{ platformLoading ? 'Opening…' : 'Test Pro checkout →' }}
        </button>
        <p class="small text-muted">Starts a real subscription if you complete payment. Use smoke test first.</p>
      </section>

      <section class="test-card">
        <h2>Buy now on a listing (marketplace + tax)</h2>
        <p>
          You <strong>cannot</strong> buy your own listing (by design). Use a second account or ask someone to click Buy now.
        </p>
        <p v-if="statsError" class="small text-muted">{{ statsError }}</p>
        <p v-else-if="published === 0" class="warn">
          No published listings yet. Publish one via <NuxtLink to="/sell/start">List an item</NuxtLink> (general merch skips COA), then test from an incognito window with another email.
        </p>
        <ul v-else class="listing-test-list">
          <li v-for="row in sampleListings" :key="row.id">
            <span>{{ row.title }} — ${{ row.price }}</span>
            <NuxtLink :to="`/listing/${row.id}`" class="btn btn-outline btn-sm">Open listing</NuxtLink>
          </li>
        </ul>
        <p class="small text-muted">
          Incognito test: open listing → Sign in with a <em>different</em> Google account → Buy now → billing address → pay with card.
        </p>
      </section>

      <section class="test-card">
        <h2>Stripe test mode (no real charges)</h2>
        <p>Optional. Only works if your Supabase secret <code>STRIPE_SECRET_KEY</code> starts with <code>sk_test_</code>.</p>
        <ul class="bullet-list">
          <li>Dashboard → toggle <strong>Test mode</strong> (top right).</li>
          <li>Settings → Tax → add a test registration for your state.</li>
          <li>Card: <code>4242 4242 4242 4242</code>, any future expiry, any CVC, any ZIP.</li>
        </ul>
        <p class="small text-muted">
          Live mode (<code>sk_live_</code>): smoke test charges $1 + tax for real; refund in Stripe → Payments if needed.
        </p>
      </section>

      <section class="test-card highlight">
        <h2>No tax line on Stripe? (most common)</h2>
        <p>
          Checkout code is correct — <strong>Stripe Tax registrations</strong> in your Dashboard must be <strong>active</strong> for the buyer’s billing state.
          If tax shows <code>$0</code> with reason <code>not_collecting</code>, you have not finished state registration.
        </p>
        <ol class="numbered">
          <li>Open <a href="https://dashboard.stripe.com/settings/tax" target="_blank" rel="noopener">Stripe → Settings → Tax</a> and complete Stripe Tax setup.</li>
          <li>Open <a href="https://dashboard.stripe.com/tax/registrations" target="_blank" rel="noopener">Tax → Registrations</a> → <strong>Add registration</strong>.</li>
          <li>Add <strong>United States</strong> and every state where you sell (e.g. <strong>Louisiana</strong> if buyers are in LA). Status must be <strong>Collecting</strong>, not pending.</li>
          <li>Retry Buy now: enter a <strong>US billing address</strong> in a registered state. Tax appears after the address step.</li>
        </ol>
        <p class="small text-muted">On a $10 item in LA (~8.75% sales tax), expect about <strong>$10.88</strong> total, not $10.00.</p>
      </section>

      <section class="test-card">
        <h2>If checkout fails</h2>
        <ul class="bullet-list">
          <li>Supabase → Edge Functions → <code>create-checkout-session</code> → Logs.</li>
          <li>Confirm secrets: <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_TAX_ENABLED=true</code>.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })

useSeoMeta({
  title: 'Owner QA and tests',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const supabase = useSupabaseClient()
const { published, error: statsError, refresh } = useOpsStats()
const { loading: platformLoading, error: platformError, startCheckout } = usePlatformCheckout()
const {
  results,
  running,
  lastRunAt,
  passCount,
  failCount,
  criticalPages,
  runAll,
} = useOpsSmokeTests()

function smokeIcon (status) {
  if (status === 'pass') return '✓'
  if (status === 'fail') return '✕'
  if (status === 'skip') return '○'
  if (status === 'warn') return '!'
  if (status === 'running') return '…'
  return '·'
}

const signedIn = ref(false)
const signedInLabel = ref('Not signed in')
const sampleListings = ref([])

const checkoutBanner = computed(() => {
  const s = String(route.query.checkout || '')
  if (s === 'success') return 'Stripe returned here — checkout completed. Check Stripe Dashboard → Payments for the session and tax amount.'
  if (s === 'cancelled') return 'Checkout cancelled on Stripe — no charge.'
  return ''
})
const checkoutBannerClass = computed(() => (
  route.query.checkout === 'success' ? 'ok' : ''
))

async function refreshAuth () {
  const { data: { user } } = await supabase.auth.getUser()
  signedIn.value = !!user
  signedInLabel.value = user?.email || (user ? 'Signed in' : 'Not signed in')
}

async function loadListings () {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, price')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)
  if (!error && data?.length) sampleListings.value = data
}

function runSmokeTest () {
  startCheckout('tax_smoke')
}

function runProTest () {
  startCheckout('pro')
}

onMounted(async () => {
  await refreshAuth()
  await refresh()
  await loadListings()
})
</script>

<style scoped>
.test-page { padding: 48px 16px 80px; }
.test-head { margin-bottom: 24px; max-width: 720px; }
.eyebrow {
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 8px;
}
.test-head h1 { font-size: 1.65rem; margin: 0 0 10px; }
.lede { line-height: 1.6; }
.test-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.test-card {
  padding: 20px 18px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  background: #fff;
}
.test-card.highlight { border-color: var(--gold, #c9a227); background: #fffdf5; }
.test-card h2 { font-size: 1.1rem; margin: 0 0 10px; }
.test-card p { margin: 0 0 10px; line-height: 1.55; color: #374151; }
.numbered, .bullet-list { margin: 10px 0; padding-left: 1.25rem; line-height: 1.55; color: #374151; }
.numbered li, .bullet-list li { margin-bottom: 6px; }
.warn { color: #b45309; font-weight: 600; }
.error {
  margin-top: 10px; padding: 10px 12px; border-radius: 8px;
  background: rgba(255, 61, 92, 0.08); border: 1px solid rgba(255, 61, 92, 0.25);
  color: #7f1d1d; font-size: 0.88rem;
}
.checkout-banner {
  padding: 12px 14px; border-radius: 8px; margin-bottom: 16px;
  background: #f3f4f6; font-weight: 600;
}
.checkout-banner.ok { background: #ecfdf5; color: #047857; }
.listing-test-list { list-style: none; padding: 0; margin: 12px 0; }
.listing-test-list li {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid #eee;
}
code { font-size: 0.85em; }
.smoke-card { border-color: #2563eb; background: #f8fafc; }
.smoke-head { margin-bottom: 12px; }
.smoke-list { list-style: none; padding: 0; margin: 0; }
.smoke-row {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 12px; margin-bottom: 8px; border-radius: 8px;
  border: 1px solid #e5e7eb; background: #fff;
}
.smoke-row.pass { border-color: #86efac; background: #ecfdf5; }
.smoke-row.fail { border-color: #fca5a5; background: #fef2f2; }
.smoke-row.skip { border-color: #d1d5db; opacity: 0.85; }
.smoke-row.warn { border-color: #fcd34d; background: #fffbeb; }
.smoke-row.running { border-color: #93c5fd; }
.smoke-icon { font-weight: 800; width: 1.2rem; flex-shrink: 0; }
.smoke-body { display: flex; flex-direction: column; gap: 2px; }
.smoke-msg { font-size: 0.82rem; color: #4b5563; font-weight: 600; }
.page-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
