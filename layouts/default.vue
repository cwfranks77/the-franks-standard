<template>
  <div class="site-wrapper">
    <header class="site-header">
      <div class="container header-inner">
        <div class="header-left">
          <NuxtLink to="/" class="header-brand" @click="menuOpen = false">
            <div class="logo-knock-column">
              <img src="/logo.png" alt="The Franks Standard" class="header-logo" />
              <span
                v-show="onHome"
                class="op-knock"
                title=""
                aria-hidden="true"
                @click.stop="onOpKnockClick"
              />
            </div>
            <span class="header-name">The Franks Standard</span>
          </NuxtLink>
        </div>

        <nav class="header-nav" :class="{ open: menuOpen }">
          <NuxtLink to="/browse" class="nav-link" @click="menuOpen = false">Browse</NuxtLink>
          <NuxtLink to="/sell" class="nav-link" @click="menuOpen = false">Sell</NuxtLink>
          <NuxtLink to="/how-it-works" class="nav-link" @click="menuOpen = false">How It Works</NuxtLink>
          <NuxtLink to="/compare" class="nav-link" @click="menuOpen = false">The Standard vs Others</NuxtLink>
          <NuxtLink to="/auth/login" class="btn btn-outline btn-sm" @click="menuOpen = false">Sign In</NuxtLink>
          <NuxtLink to="/auth/register" class="btn btn-primary btn-sm" @click="menuOpen = false">Join Free</NuxtLink>
        </nav>

        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="/logo.png" alt="The Franks Standard" class="footer-logo" />
            <p class="text-muted">The marketplace where authenticity isn't optional — it's the standard.</p>
          </div>
          <div class="footer-col">
            <h4>Marketplace</h4>
            <NuxtLink to="/browse">Browse All</NuxtLink>
            <NuxtLink to="/sell">Sell an Item</NuxtLink>
            <NuxtLink to="/categories">Categories</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <NuxtLink to="/how-it-works">How It Works</NuxtLink>
            <NuxtLink to="/about">About Us</NuxtLink>
            <NuxtLink to="/contact">Contact</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <NuxtLink to="/terms">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
            <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>
            <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>
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
          <p class="op-modal-sub text-muted">Enter the key you set in your build. Nothing is pre-filled; only you can know it if you have not shared it.</p>
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
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { grant } = useOpsSession()

const menuOpen = ref(false)
const onHome = computed(() => route.path === '/')

const opModalOpen = ref(false)
const opPhrase = ref('')
const opError = ref('')
const opSubmitting = ref(false)
let opKnockClicks = 0
let opKnockTimer = null

const keyConfigured = computed(() => String(config.public?.opsAccessKey || '').length > 0)

function onOpKnockClick () {
  if (!onHome.value) { return }
  if (opKnockTimer) {
    clearTimeout(opKnockTimer)
  }
  opKnockClicks += 1
  opKnockTimer = setTimeout(() => { opKnockClicks = 0 }, 2600)
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
  if (opPhrase.value === expected) {
    grant()
    closeOpModal()
    opSubmitting.value = false
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
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--stone-800);
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
.logo-knock-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* Invisible 6px-tall hit strip directly under the logo; homepage only. Five quick clicks here opens the operator dialog. */
.op-knock {
  display: block;
  width: 44px;
  min-height: 8px;
  height: 8px;
  margin-top: 2px;
  background: rgba(0,0,0,0.01);
  cursor: default;
}
.header-logo { height: 40px; width: auto; }
.header-name {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
}
.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}
.nav-link {
  color: var(--stone-300);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-link:hover, .nav-link.router-link-active { color: var(--gold); }

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
  }
  .header-nav.open { display: flex; }
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
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}
.footer-logo { height: 50px; margin-bottom: 12px; }
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
</style>
