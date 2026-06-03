<template>
  <header class="mkt-header">
    <div class="mkt-header__bar">
      <div class="container mkt-header__bar-inner">
        <NuxtLink to="/" class="mkt-header__brand" @click="onBrandClick">
          <img
            src="/franks-pavilion.png"
            alt=""
            class="mkt-header__logo"
            :class="{ 'mkt-header__logo--knock': onHome }"
            @error="onLogoError"
          />
          <span class="mkt-header__name">The Franks Standard</span>
          <span v-if="isOwner" class="mkt-header__owner">Owner</span>
        </NuxtLink>

        <form class="mkt-header__search" @submit.prevent="submitSearch">
          <select v-model="searchDepartment" class="mkt-header__dept" aria-label="Department">
            <option value="">All Departments</option>
            <option v-for="dept in departments" :key="dept.value" :value="dept.value">
              {{ dept.label }}
            </option>
          </select>
          <input
            v-model="searchText"
            type="search"
            class="mkt-header__search-input"
            placeholder="Search marketplace listings, stores, and gear…"
            aria-label="Search marketplace"
          />
          <button type="submit" class="mkt-header__search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </button>
        </form>

        <div class="mkt-header__utility">
          <div class="mkt-header__account" @mouseleave="accountOpen = false">
            <button
              type="button"
              class="mkt-header__utility-btn"
              aria-haspopup="true"
              :aria-expanded="accountOpen"
              @click="accountOpen = !accountOpen"
            >
              <span class="mkt-header__utility-hello">{{ isSignedIn ? 'Hello' : 'Hello, sign in' }}</span>
              <span class="mkt-header__utility-label">Account &amp; Lists</span>
            </button>
            <div v-show="accountOpen" class="mkt-header__dropdown">
              <template v-if="isSignedIn">
                <NuxtLink to="/dashboard" class="mkt-header__drop-link" @click="closeAll">Your account</NuxtLink>
                <NuxtLink to="/dashboard" class="mkt-header__drop-link" @click="closeAll">Orders</NuxtLink>
                <NuxtLink to="/sell/start" class="mkt-header__drop-link" @click="closeAll">Sell an item</NuxtLink>
                <button type="button" class="mkt-header__drop-link mkt-header__drop-link--btn" @click="onSignOut">Sign out</button>
              </template>
              <template v-else>
                <NuxtLink to="/auth/login" class="mkt-header__drop-link mkt-header__drop-link--cta" @click="closeAll">Sign in</NuxtLink>
                <NuxtLink to="/auth/register" class="mkt-header__drop-link" @click="closeAll">Create account</NuxtLink>
                <NuxtLink to="/sellers" class="mkt-header__drop-link" @click="closeAll">Seller registration</NuxtLink>
              </template>
            </div>
          </div>

          <NuxtLink :to="ordersTo" class="mkt-header__utility-btn mkt-header__orders" @click="closeAll">
            <span class="mkt-header__utility-hello">Returns</span>
            <span class="mkt-header__utility-label">&amp; Orders</span>
          </NuxtLink>

          <NuxtLink to="/browse" class="mkt-header__utility-btn mkt-header__cart" @click="closeAll">
            <span class="mkt-header__cart-icon-wrap" aria-hidden="true">
              <svg class="mkt-header__cart-icon" viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              <span class="mkt-header__cart-count">{{ cartCount }}</span>
            </span>
            <span class="mkt-header__utility-label">Cart</span>
          </NuxtLink>

          <button type="button" class="mkt-header__menu" aria-label="Toggle menu" @click="menuOpen = !menuOpen">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </div>

    <nav class="mkt-header__sub" aria-label="Marketplace departments">
      <div class="container mkt-header__sub-inner">
        <NuxtLink to="/browse" class="mkt-sub-link">Today's Deals</NuxtLink>
        <NuxtLink to="/stores" class="mkt-sub-link">Shop Stores</NuxtLink>
        <NuxtLink to="/sell/start" class="mkt-sub-link">Sell</NuxtLink>
        <NuxtLink to="/collections" class="mkt-sub-link">Collections</NuxtLink>
        <NuxtLink to="/categories" class="mkt-sub-link">Categories</NuxtLink>
      </div>
    </nav>

    <div v-if="menuOpen" class="mkt-header__mobile">
      <NuxtLink to="/browse" class="mkt-mobile-link" @click="closeAll">Browse</NuxtLink>
      <NuxtLink to="/stores" class="mkt-mobile-link" @click="closeAll">Shop Stores</NuxtLink>
      <NuxtLink to="/sell/start" class="mkt-mobile-link" @click="closeAll">Sell</NuxtLink>
      <NuxtLink v-if="isOwner" to="/ops/panel" class="mkt-mobile-link" @click="closeAll">Ops</NuxtLink>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['brand-click'])

defineProps({
  onHome: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
})

const router = useRouter()
const { isSignedIn, signOut } = useAuthNav()

const menuOpen = ref(false)
const accountOpen = ref(false)
const searchText = ref('')
const searchDepartment = ref('')
const cartCount = ref(0)

const ordersTo = computed(() => (isSignedIn.value ? '/dashboard' : '/auth/login?next=/dashboard'))

const departments = [
  { value: 'Performance Car Audio', label: 'Performance Car Audio' },
  { value: 'Vintage Restorations', label: 'Vintage Restorations' },
  { value: 'Workspace Tuning', label: 'Workspace Tuning' },
  { value: 'Collectibles', label: 'Collectibles & COA' },
  { value: 'Sporting Goods', label: 'Sporting Goods' },
]

function closeAll () {
  menuOpen.value = false
  accountOpen.value = false
}

function onBrandClick (e) {
  emit('brand-click', e)
}

async function onSignOut () {
  closeAll()
  await signOut()
}

function submitSearch () {
  const query = {}
  if (searchText.value.trim()) query.q = searchText.value.trim()
  if (searchDepartment.value) query.category = searchDepartment.value
  router.push({ path: '/browse', query })
  closeAll()
}

function onLogoError (e) {
  const el = e?.target
  if (!el || el.dataset?.fallback) return
  el.dataset.fallback = '1'
  el.src = '/logo.svg'
}
</script>

<style scoped>
.mkt-header {
  position: sticky;
  top: 0;
  z-index: 240;
  background: #0a0a0c;
  border-bottom: 1px solid rgba(211, 47, 47, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
}
.mkt-header__bar { background: #121216; }
.mkt-header__bar-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  min-height: 64px;
  padding: 8px 0;
}
.mkt-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f5f5f7;
  text-decoration: none;
  min-width: 0;
}
.mkt-header__logo {
  width: 68px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(211, 47, 47, 0.35);
}
.mkt-header__logo--knock { box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.45); }
.mkt-header__name {
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.mkt-header__owner {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(211, 47, 47, 0.15);
  color: #ff5252;
  border: 1px solid rgba(211, 47, 47, 0.4);
}
.mkt-header__search {
  display: flex;
  align-items: stretch;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  border: 2px solid rgba(211, 47, 47, 0.55);
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0c;
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.12);
}
.mkt-header__dept {
  border: none;
  background: #1a1a22;
  color: #e5e7eb;
  padding: 0 12px;
  font-size: 0.75rem;
  font-weight: 700;
  max-width: 168px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
}
.mkt-header__search-input {
  flex: 1;
  border: none;
  padding: 10px 14px;
  font: inherit;
  font-size: 0.9rem;
  min-width: 0;
  background: #0a0a0c;
  color: #f5f5f7;
}
.mkt-header__search-input::placeholder { color: #7a8190; font-weight: 600; }
.mkt-header__search-input:focus { outline: none; }
.mkt-header__search-btn {
  border: none;
  background: #d32f2f;
  color: #fff;
  padding: 0 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mkt-header__search-btn:hover { background: #ff5252; }
.mkt-header__utility {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mkt-header__utility-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: none;
  border: none;
  color: #f5f5f7;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  line-height: 1.2;
}
.mkt-header__utility-btn:hover { background: rgba(211, 47, 47, 0.12); }
.mkt-header__utility-hello { font-size: 0.68rem; color: #9ca3af; }
.mkt-header__utility-label { font-size: 0.82rem; font-weight: 800; }
.mkt-header__account { position: relative; }
.mkt-header__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 200px;
  padding: 8px 0;
  background: #16161c;
  border: 1px solid rgba(211, 47, 47, 0.35);
  border-radius: 10px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
  z-index: 300;
}
.mkt-header__drop-link {
  display: block;
  padding: 10px 16px;
  color: #e5e7eb;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
}
.mkt-header__drop-link:hover { background: rgba(211, 47, 47, 0.12); color: #ff5252; }
.mkt-header__drop-link--cta {
  background: #d32f2f;
  color: #fff !important;
  margin: 4px 8px 8px;
  border-radius: 8px;
  text-align: center;
}
.mkt-header__drop-link--btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
}
.mkt-header__cart { align-items: center; }
.mkt-header__cart-icon-wrap { position: relative; display: block; }
.mkt-header__cart-icon { color: #f5f5f7; display: block; }
.mkt-header__cart-count {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #d32f2f;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(211, 47, 47, 0.6);
}
.mkt-header__menu {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
}
.mkt-header__menu span {
  display: block;
  width: 22px;
  height: 2px;
  background: #f5f5f7;
  border-radius: 2px;
}
.mkt-header__sub {
  background: #0a0a0c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.mkt-header__sub-inner {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: thin;
}
.mkt-sub-link {
  flex: 0 0 auto;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #9ca3af;
  text-decoration: none;
  border-radius: 6px;
  white-space: nowrap;
}
.mkt-sub-link:hover { color: #f5f5f7; background: rgba(255, 255, 255, 0.05); }
.mkt-header__mobile {
  display: none;
  flex-direction: column;
  padding: 12px 16px;
  background: #121216;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.mkt-mobile-link {
  padding: 10px 0;
  color: #e5e7eb;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
@media (max-width: 960px) {
  .mkt-header__bar-inner {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'brand menu'
      'search search'
      'utility utility';
  }
  .mkt-header__brand { grid-area: brand; }
  .mkt-header__search { grid-area: search; max-width: none; }
  .mkt-header__utility { grid-area: utility; justify-content: flex-end; }
  .mkt-header__menu { display: flex; grid-area: menu; }
  .mkt-header__name { display: none; }
  .mkt-header__mobile { display: flex; }
}
</style>
