<template>
  <div class="site-wrapper">
    <div class="site-ribbon" role="status" aria-label="Site highlights">
      <div class="container site-ribbon-inner">
        <span class="ribbon-txt">COA or signed guarantee on every listing</span>
        <span class="ribbon-dot" aria-hidden="true" />
        <span class="ribbon-txt">Escrow &amp; buyer confirmation</span>
        <span class="ribbon-dot" aria-hidden="true" />
        <span class="ribbon-txt">Zero tolerance for fakes</span>
      </div>
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <div class="header-left">
          <NuxtLink
            to="/"
            class="header-brand"
            @click="onBrandOrLogoClick"
          >
            <img
              src="/franks-pavilion.png"
              alt=""
              class="header-logo"
              :class="{ 'op-knock-home': onHome }"
              @error="onPavilionImgError"
            />
            <span class="header-name">The Franks Standard</span>
            <span v-if="isOwner" class="header-owner-pill">Owner</span>
          </NuxtLink>
        </div>

        <nav class="header-nav" :class="{ open: menuOpen }">
          <NuxtLink to="/video" class="nav-link" @click="closeAllNav">Video</NuxtLink>
          <NuxtLink to="/browse" class="nav-link" @click="closeAllNav">Browse</NuxtLink>
          <NuxtLink to="/sellers" class="nav-link" @click="closeAllNav">For sellers</NuxtLink>
          <NuxtLink to="/pricing" class="nav-link nav-highlight" @click="closeAllNav">Pricing</NuxtLink>
          <NuxtLink to="/support" class="nav-link" @click="closeAllNav">Support</NuxtLink>
          <div
            class="nav-more"
            :class="{ open: moreOpen }"
            @mouseenter="onNavMoreEnter"
            @mouseleave="onNavMoreLeave"
          >
            <button
              type="button"
              class="nav-more-btn"
              :aria-expanded="moreOpen"
              @click.stop="toggleExplore"
            >
              Explore
              <span class="chev" aria-hidden="true" />
            </button>
            <div v-show="moreOpen" class="nav-more-panel" @click.stop>
              <NuxtLink to="/categories" class="nav-drop-link" @click="closeAllNav">Categories A to Z</NuxtLink>
              <NuxtLink to="/how-it-works" class="nav-drop-link" @click="closeAllNav">How it works</NuxtLink>
              <NuxtLink to="/pricing" class="nav-drop-link" @click="closeAllNav">Pricing</NuxtLink>
              <NuxtLink to="/launch-offer" class="nav-drop-link" @click="closeAllNav">Launch offer (new sellers)</NuxtLink>
              <NuxtLink to="/store-builder" class="nav-drop-link" @click="closeAllNav">AI Store Builder</NuxtLink>
              <NuxtLink to="/about" class="nav-drop-link" @click="closeAllNav">Our story and mission</NuxtLink>
              <NuxtLink to="/support" class="nav-drop-link" @click="closeAllNav">Support and tech</NuxtLink>
              <NuxtLink to="/contact" class="nav-drop-link" @click="closeAllNav">Get in touch</NuxtLink>
              <NuxtLink to="/compare" class="nav-drop-link" @click="closeAllNav">Us vs eBay and Amazon</NuxtLink>
              <NuxtLink to="/terms" class="nav-drop-link" @click="closeAllNav">Terms</NuxtLink>
              <NuxtLink to="/privacy" class="nav-drop-link" @click="closeAllNav">Privacy</NuxtLink>
              <NuxtLink to="/prohibited-items" class="nav-drop-link" @click="closeAllNav">Prohibited items</NuxtLink>
              <NuxtLink to="/pay" class="nav-drop-link" @click="closeAllNav">Pay &amp; fees (Stripe)</NuxtLink>
              <NuxtLink to="/download" class="nav-drop-link" @click="closeAllNav">Download app</NuxtLink>
              <NuxtLink to="/open-door" class="nav-drop-link" @click="closeAllNav">Open Door Policy</NuxtLink>
              <NuxtLink to="/roadmap" class="nav-drop-link" @click="closeAllNav">Launch Roadmap</NuxtLink>
            </div>
          </div>
          <NuxtLink to="/sell" class="nav-link" @click="closeAllNav">Sell</NuxtLink>
          <NuxtLink to="/download" class="nav-link" @click="closeAllNav">Download</NuxtLink>
          <NuxtLink to="/auth/login" class="btn btn-outline btn-sm" @click="closeAllNav">Sign In</NuxtLink>
          <NuxtLink to="/auth/register" class="btn btn-primary btn-sm" @click="closeAllNav">Join Free</NuxtLink>
        </nav>

        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <div class="site-trust" aria-label="Why buyers and sellers use this marketplace">
      <div class="container site-trust-inner">
        <div class="trust-pill">Secure checkout (Stripe links)</div>
        <div class="trust-pill">Seller &amp; buyer tools</div>
        <div class="trust-pill">Video meet built in</div>
        <div class="trust-pill">Help with mic, email, or live Video</div>
      </div>
    </div>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img
              src="/franks-pavilion.png"
              alt=""
              class="footer-logo"
              @error="onPavilionImgError"
            />
            <p class="footer-site-name">The Franks Standard</p>
            <p class="text-muted">The Franks Standard LLC — the marketplace where authenticity is not optional.</p>
          </div>
          <div class="footer-col">
            <h4>Marketplace</h4>
            <NuxtLink to="/browse">Browse All</NuxtLink>
            <NuxtLink to="/sell">Sell an Item</NuxtLink>
            <NuxtLink to="/categories">Categories</NuxtLink>
            <NuxtLink to="/pricing">Pricing</NuxtLink>
            <NuxtLink to="/video">Video Calls</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Sellers</h4>
            <NuxtLink to="/sellers">For Stores &amp; Sellers</NuxtLink>
            <NuxtLink to="/store-builder">AI Store Builder</NuxtLink>
            <NuxtLink to="/launch-offer">Launch Offer</NuxtLink>
            <NuxtLink to="/how-it-works">How It Works</NuxtLink>
            <NuxtLink to="/support">Support</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <NuxtLink to="/terms">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
            <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>
            <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>More</h4>
            <NuxtLink to="/download">Download App</NuxtLink>
            <NuxtLink to="/open-door">Open Door Policy</NuxtLink>
            <NuxtLink to="/roadmap">Launch Roadmap</NuxtLink>
            <NuxtLink to="/about">About Us</NuxtLink>
            <NuxtLink to="/contact">Contact</NuxtLink>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} The Franks Standard &bull; Founded by Charles Franks &bull; All rights reserved.</p>
        </div>
      </div>
    </footer>

    <Teleport to="body">
      <div
        v-if="opModalOpen"
        class="op-modal-backdrop"
        @click.self="closeOpModal"
      >
        <div
          class="op-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Operator unlock"
        >
          <h2 class="op-modal-h">Operator access</h2>
          <p class="op-modal-sub text-muted">Enter the <strong>exact</strong> value of <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> from your <code>.env</code> (build) or the matching GitHub Actions secret. Leading or trailing spaces are ignored.</p>
          <p v-if="isDev" class="op-hint text-muted">Dev: open the modal with <code>?ops=unlock</code> on any URL, then set a key in <code>.env</code> and restart.</p>
          <form @submit.prevent="submitOpModal">
            <div v-if="!keyConfigured" class="op-warn" role="alert">
              Add <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> in <code>.env</code> and in GitHub Actions secrets, then rebuild.
            </div>
            <template v-else>
              <div class="form-group">
                <label class="label" for="op-phrase">Your phrase (access key)</label>
                <input
                  id="op-phrase"
                  v-model="opPhrase"
                  class="input"
                  type="password"
                  autocomplete="off"
                  placeholder="Type the same value as in NUXT_PUBLIC_OPS_ACCESS_KEY"
                />
              </div>
            </template>
            <details v-if="keyConfigured" class="op-lost">
              <summary>Lost the phrase? Set a new one</summary>
              <p class="op-lost-txt">
                There is <strong>no</strong> recovery from this site alone, because the phrase is only checked in the built bundle.
                In GitHub: replace the secret <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> (or the variable in the workflow) with a <strong>new</strong> long random value,
                update the same in your local <code>.env</code> for dev, then <code>npm run generate</code> and run <code>npm run deploy:gh-pages</code> (or push after Actions is fixed). The old phrase will stop working on the next deploy.
              </p>
            </details>
            <p v-if="opError" class="op-err" role="alert">{{ opError }}</p>
            <div class="op-modal-actions">
              <button type="button" class="btn btn-outline btn-sm" @click="closeOpModal">Cancel</button>
              <button
                type="submit"
                class="btn btn-primary btn-sm"
                :disabled="!keyConfigured || opSubmitting"
              >{{ opSubmitting ? 'Checking' : 'Unlock' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    <AiSupportDrawer />

    <NuxtLink v-if="isOwner" to="/sell" class="owner-sell-fab" title="Create a listing (free)">
      <span class="fab-plus">+</span>
      <span class="fab-label">Sell</span>
    </NuxtLink>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { grant } = useOpsSession()
const { isOwner } = useOwnerMode()

const menuOpen = ref(false)
const moreOpen = ref(false)
const onHome = computed(() => route.path === '/')

let exploreHoverOk = true
onMounted(() => {
  if (!import.meta.client) { return }
  const mq = window.matchMedia('(min-width: 769px)')
  const sync = () => { exploreHoverOk = mq.matches }
  sync()
  mq.addEventListener('change', sync)
})

const opModalOpen = ref(false)
const opPhrase = ref('')
const opError = ref('')
const opSubmitting = ref(false)
let opKnockClicks = 0
let opKnockTimer = null

const keyConfigured = computed(() => String(config.public?.opsAccessKey || '').length > 0)
const isDev = computed(() => import.meta.dev)

function onPavilionImgError (e) {
  const el = e?.target
  if (!el || el.dataset?.pavilionFallback) { return }
  // If /franks-pavilion.png is missing in production, fall back to the simple SVG mark.
  el.dataset.pavilionFallback = '1'
  el.src = '/logo.svg'
}

function tryOpenOpsFromQuery () {
  if (!import.meta.client || !import.meta.dev) { return }
  const q = route.query
  if (String(q.ops) === 'unlock') {
    opModalOpen.value = true
    opError.value = ''
    const { ops: _drop, ...rest } = q
    router.replace({ path: route.path, query: rest })
  }
}
onMounted(tryOpenOpsFromQuery)
watch(
  () => [route.path, route.query],
  tryOpenOpsFromQuery,
  { deep: true },
)

function closeAllNav () {
  menuOpen.value = false
  moreOpen.value = false
}

function onNavMoreEnter () {
  if (import.meta.client && exploreHoverOk) { moreOpen.value = true }
}
function onNavMoreLeave () {
  if (import.meta.client && exploreHoverOk) { moreOpen.value = false }
}
function toggleExplore () {
  moreOpen.value = !moreOpen.value
}

/**
 * On the home page only, five quick clicks on the brand row (logo and name) open
 * the operator modal; preventDefault blocks no-op navigation to the same page.
 */
function onBrandOrLogoClick (e) {
  if (!onHome.value) {
    closeAllNav()
    return
  }
  e.preventDefault()
  if (opKnockTimer) {
    clearTimeout(opKnockTimer)
  }
  opKnockClicks += 1
  opKnockTimer = setTimeout(() => { opKnockClicks = 0 }, 2800)
  if (opKnockClicks >= 5) {
    opKnockClicks = 0
    if (opKnockTimer) {
      clearTimeout(opKnockTimer)
    }
    opModalOpen.value = true
    opError.value = ''
  }
}

function closeOpModal () {
  opModalOpen.value = false
  opPhrase.value = ''
  opError.value = ''
}

function submitOpModal () {
  opError.value = ''
  const expected = String(config.public?.opsAccessKey || '')
  if (!expected) { return }
  opSubmitting.value = true
  if (opPhrase.value.trim() === expected.trim()) {
    grant()
    closeOpModal()
    router.push('/ops/panel')
  } else {
    opError.value = 'That does not match your build key. Check .env and redeploy, or the GitHub secret.'
  }
  opSubmitting.value = false
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, rgba(10, 5, 24, 0.97) 0%, rgba(18, 10, 40, 0.92) 100%);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 224, 255, 0.12);
  box-shadow: 0 4px 32px rgba(255, 45, 122, 0.08);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}
.header-left { flex: 0 0 auto; }
.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--stone-100);
}
.header-brand:hover { color: var(--gold); }
.header-logo {
  width: 84px;
  height: 44px;
  object-fit: cover;
  object-position: 50% 32%;
  flex-shrink: 0;
  border-radius: 4px;
  border: 1px solid var(--stone-700);
}
.header-logo.op-knock-home { filter: drop-shadow(0 0 6px rgba(255, 216, 77, 0.25)); }
.header-name {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
}
.header-nav {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.nav-link {
  color: var(--stone-300);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-link:hover, .nav-link.router-link-active { color: var(--gold); }
.nav-more {
  position: relative;
}
.nav-more.open .chev { transform: rotate(180deg); }
.nav-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 45, 122, 0.12);
  border: 1px solid rgba(0, 224, 255, 0.35);
  color: var(--stone-100);
  font: inherit;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.nav-more-btn:hover, .nav-more.open .nav-more-btn {
  background: rgba(0, 224, 255, 0.1);
  border-color: var(--gold);
  box-shadow: 0 0 20px rgba(255, 45, 122, 0.2);
}
.chev {
  width: 0; height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--gold);
  transition: transform 0.2s;
}
.nav-more-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 240px;
  padding: 8px 0;
  background: var(--stone-900);
  border: 1px solid rgba(0, 224, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255, 45, 122, 0.15);
  z-index: 200;
  display: flex;
  flex-direction: column;
  animation: drop-fade 0.18s ease;
}
.nav-drop-link {
  padding: 10px 16px;
  color: var(--stone-200);
  font-size: 0.9rem;
  text-decoration: none;
  border-left: 3px solid transparent;
}
.nav-drop-link:hover, .nav-drop-link.router-link-active {
  color: var(--gold);
  background: rgba(255, 45, 122, 0.08);
  border-left-color: var(--cyan);
}
@keyframes drop-fade {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--stone-300);
  border-radius: 2px;
  transition: 0.2s;
}

@media (max-width: 768px) {
  .menu-toggle { display: flex; }
  .header-nav {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    flex-direction: column;
    padding: 20px;
    background: var(--stone-950);
    border-bottom: 1px solid var(--stone-800);
    gap: 16px;
    align-items: stretch;
  }
  .header-nav.open { display: flex; }
  .nav-more { width: 100%; }
  .nav-more-panel {
    position: static;
    margin-top: 8px;
    width: 100%;
    box-shadow: none;
  }
}

.site-main { min-height: calc(100vh - 70px - 300px); }

.site-footer {
  margin-top: 80px;
  padding: 60px 0 30px;
  border-top: 1px solid var(--stone-800);
  background: rgba(26, 26, 46, 0.7);
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 36px;
}
.footer-logo {
  width: 100px;
  height: 56px;
  object-fit: cover;
  object-position: 50% 32%;
  border-radius: 4px;
  border: 1px solid var(--stone-800);
  margin-bottom: 12px;
  display: block;
}
.footer-site-name {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--stone-100);
  margin: 0 0 6px 0;
}
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-col h4 {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  color: var(--gold);
  margin-bottom: 4px;
}
.footer-col a {
  color: var(--stone-400);
  font-size: 0.9rem;
}
.footer-col a:hover { color: var(--stone-100); }
.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--stone-800);
  text-align: center;
  color: var(--stone-500);
  font-size: 0.85rem;
}
@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
}
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; }
}
.op-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
}
.op-modal {
  max-width: 400px;
  width: 100%;
  padding: 28px 24px;
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 50px rgba(0,0,0,0.5);
}
.op-modal-h { font-size: 1.25rem; margin-bottom: 6px; }
.op-modal-sub { font-size: 0.9rem; margin-bottom: 16px; }
.op-warn { font-size: 0.85rem; color: var(--stone-200); background: rgba(231, 76, 60, 0.12); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: var(--radius); padding: 10px; margin-bottom: 12px; }
.op-warn code { color: var(--gold-light); font-size: 0.78em; }
.op-err { color: var(--alert-red); font-size: 0.88rem; margin-top: 6px; }
.op-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.op-lost { margin: 8px 0; font-size: 0.82rem; }
.op-lost summary { color: var(--gold); cursor: pointer; }
.op-lost-txt { margin: 8px 0 0; color: var(--stone-300); line-height: 1.5; }
.op-lost-txt code { color: var(--gold-light); font-size: 0.78em; }
.op-hint { font-size: 0.8rem; margin: 0 0 8px; }
.op-hint code { color: var(--cyan); font-size: 0.8em; }

.site-ribbon {
  background: linear-gradient(90deg, rgba(255, 45, 122, 0.2), rgba(0, 224, 255, 0.08), rgba(139, 92, 255, 0.15));
  border-bottom: 1px solid rgba(0, 224, 255, 0.2);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--stone-200);
}
.site-ribbon-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 20px; padding: 7px 12px; }
.ribbon-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); opacity: 0.6; }

.site-trust { background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--stone-800); }
.site-trust-inner { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 10px 0; }
.trust-pill {
  font-size: 0.78rem; color: var(--stone-200);
  padding: 4px 12px; border-radius: 999px;
  background: var(--stone-900); border: 1px solid rgba(0, 224, 255, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.trust-pill:hover { transform: translateY(-1px); box-shadow: 0 0 20px rgba(0, 224, 255, 0.12); }

.nav-link.nav-highlight { color: var(--gold-light); }

.header-owner-pill {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 999px;
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(0, 245, 160, 0.12); color: var(--trust-green); border: 1px solid rgba(0, 245, 160, 0.3);
  font-family: 'Inter', sans-serif;
  margin-left: 4px;
}

.owner-sell-fab {
  position: fixed; bottom: 90px; right: 24px; z-index: 9000;
  display: flex; align-items: center; gap: 8px;
  padding: 14px 22px; border-radius: 999px;
  background: linear-gradient(135deg, var(--gold) 0%, #ffb020 100%);
  color: var(--stone-950); font-weight: 700; font-size: 0.95rem;
  box-shadow: 0 4px 24px rgba(201, 168, 76, 0.4), 0 0 0 2px rgba(0, 245, 160, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
}
.owner-sell-fab:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 8px 32px rgba(201, 168, 76, 0.5), 0 0 0 2px rgba(0, 245, 160, 0.3);
  color: var(--stone-950);
}
.fab-plus { font-size: 1.3rem; font-weight: 900; line-height: 1; }
.fab-label { font-family: 'Inter', sans-serif; }
@media (max-width: 480px) {
  .owner-sell-fab { bottom: 80px; right: 16px; padding: 12px 18px; font-size: 0.88rem; }
}
</style>
