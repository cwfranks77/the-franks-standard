<template>
  <div class="franks-marketplace-home">
    <!-- 1. AMAZON-STYLE UTILITY HEADER -->
    <header class="amazon-header-nav">
      <div class="logo-box">
        <NuxtLink to="/" class="logo-link" @click="onBrandOrLogoClick">
          <h1 class="main-title">THE FRANKS <span class="accent-red">STANDARD</span></h1>
        </NuxtLink>
        <span v-if="isOwner" class="owner-pill">Owner</span>
      </div>

      <form class="amazon-search-bar" @submit.prevent="submitSearch">
        <select v-model="searchDepartment" class="dept-dropdown" aria-label="Department Selection">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept.value" :value="dept.value">
            {{ dept.label }}
          </option>
        </select>
        <input
          v-model="searchText"
          type="search"
          placeholder="Search verified merchant listings, items, or build components..."
          class="search-input"
          aria-label="Search marketplace"
        />
        <button type="submit" class="search-btn" aria-label="Run Search">Search</button>
      </form>

      <div class="nav-right-slots">
        <NuxtLink :to="accountTo" class="user-slot nav-slot-link">
          <small>{{ isSignedIn ? 'Hello' : 'Hello, sign in' }}</small>
          <strong>Account &amp; Lists</strong>
        </NuxtLink>
        <NuxtLink :to="ordersTo" class="orders-slot nav-slot-link">
          <small>Returns</small>
          <strong>&amp; Orders</strong>
        </NuxtLink>
        <NuxtLink to="/browse" class="cart-slot nav-slot-link">
          <span class="cart-icon" aria-hidden="true">Cart</span>
          <strong>Cart</strong>
        </NuxtLink>
      </div>
    </header>

    <!-- 2. EBAY-STYLE HORIZONTAL SUB-NAV BAR -->
    <nav class="ebay-sub-bar" aria-label="Marketplace departments">
      <ul>
        <li><NuxtLink to="/browse" class="sub-link">All Deals</NuxtLink></li>
        <li><NuxtLink to="/stores" class="sub-link">Brand Directory</NuxtLink></li>
        <li><NuxtLink to="/support" class="sub-link">Merchant Support</NuxtLink></li>
        <li class="featured-bc-tab">
          <NuxtLink to="/bc-audio">{{ BC_BRAND.full }} Portal</NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- 3. COMPLIANCE & LEGAL SAFETY SHIELD BAR -->
    <div class="compliance-trust-strip" role="status">
      <span><strong>Platform:</strong> Marketplace facilitator · seller proof on collectibles</span>
      <span><strong>Tax:</strong> Louisiana facilitator protocol where applicable</span>
      <span><strong>Payments:</strong> Stripe escrow &amp; Connect split checkout</span>
    </div>

    <!-- 4. MAIN PROMO ROW -->
    <main class="homepage-content">
      <section class="hero-promo-grid">
        <div class="promo-card audio-showcase">
          <h2>{{ BC_BRAND.full }}</h2>
          <p class="card-tagline">Competition bass enclosures &amp; amplifier setups</p>
          <div class="image-placeholder-box audio-box">
            <span class="sync-alert">Independent merchant store · dropship checkout</span>
          </div>
          <NuxtLink to="/bc-audio" class="btn-action-red">Enter Audio Showroom</NuxtLink>
        </div>

        <div class="promo-card vintage-showcase">
          <h2>The Franks Standard</h2>
          <p class="card-tagline">Verified historical assets &amp; fine collectibles</p>
          <div class="image-placeholder-box vintage-box">
            <span>Multi-vendor floor · COA-backed listings</span>
          </div>
          <NuxtLink to="/browse?limited=1" class="btn-action-dark">Explore Curated Vault</NuxtLink>
        </div>

        <div class="promo-card seller-showcase">
          <h2>Launch Your Storefront</h2>
          <p class="card-tagline">List on the floor with seller-backed proof and escrow checkout.</p>
          <ul class="benefit-list">
            <li>Verified seller onboarding</li>
            <li>Tax-aware checkout flows</li>
            <li>Marketplace policy protection</li>
          </ul>
          <NuxtLink to="/sell/start" class="btn-action-green">Register as a Seller</NuxtLink>
        </div>
      </section>

      <!-- 5. EBAY-STYLE PRODUCT CARD ROWS -->
      <section class="deal-listings-shelf">
        <h3 class="shelf-title">Trending Marketplace Deal Matrix</h3>
        <p v-if="shelfLoading" class="shelf-status">Loading live listings…</p>
        <div v-else-if="shelfItems.length" class="product-cards-grid">
          <article
            v-for="item in shelfItems"
            :key="item.id"
            class="marketplace-card"
          >
            <div class="card-visual">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="card-img"
                loading="lazy"
                @error="onCardImgError($event, item)"
              />
              <span v-else class="card-emoji" aria-hidden="true">{{ item.isBcSeller ? '🔊' : '📦' }}</span>
            </div>
            <div class="card-info">
              <h4>{{ item.title }}</h4>
              <p class="seller-badge">
                Seller:
                <span :class="{ 'badge-red': item.isBcSeller }">{{ item.seller }}</span>
              </p>
              <div class="price-row">
                {{ item.priceLabel }}
                <span class="free-shipping">View listing</span>
              </div>
              <NuxtLink :to="item.to" class="btn-card-checkout">View Item Details</NuxtLink>
            </div>
          </article>
        </div>
        <p v-else class="shelf-status">
          No live listings yet.
          <NuxtLink to="/browse">Browse the marketplace</NuxtLink>
          or
          <NuxtLink to="/sell/start">list an item</NuxtLink>.
        </p>
        <div v-if="shelfItems.length" class="shelf-foot">
          <NuxtLink to="/browse" class="btn-action-dark shelf-more">View all marketplace listings</NuxtLink>
        </div>
      </section>
    </main>

    <MarketplaceLandingFooter />

    <Teleport to="body">
      <div
        v-if="opModalOpen"
        class="op-modal-backdrop"
        @click.self="closeOpModal"
      >
        <div class="op-modal" role="dialog" aria-modal="true" aria-label="Operator unlock">
          <h2 class="op-modal-h">Operator access</h2>
          <form @submit.prevent="submitOpModal">
            <div v-if="!keyConfigured" class="op-warn" role="alert">
              Add <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> in <code>.env</code>, then rebuild.
            </div>
            <template v-else>
              <label class="label" for="op-phrase">Access key</label>
              <input
                id="op-phrase"
                v-model="opPhrase"
                class="input op-input"
                type="password"
                autocomplete="off"
              />
            </template>
            <p v-if="opError" class="op-err" role="alert">{{ opError }}</p>
            <div class="op-modal-actions">
              <button type="button" class="btn-action-dark" @click="closeOpModal">Cancel</button>
              <button type="submit" class="btn-action-red" :disabled="!keyConfigured || opSubmitting">
                {{ opSubmitting ? 'Checking…' : 'Unlock' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <NuxtLink v-if="isOwner" to="/sell/start" class="owner-sell-fab" title="Create a listing (free)">
      + Sell
    </NuxtLink>
  </div>
</template>

<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'

useSeoMeta({
  title: 'The Franks Standard Core Marketplace Network',
  description: 'High-density multi-vendor e-commerce network.',
})

const router = useRouter()
const route = useRoute()
const { isOwner } = useOwnerMode()
const { isSignedIn } = useAuthNav()

const searchText = ref('')
const searchDepartment = ref('')
const shelfLoading = ref(true)
const marketplaceRows = ref([])

const departments = [
  { value: 'Performance Car Audio', label: 'Performance Car Audio' },
  { value: 'Vintage Restorations', label: 'Vintage Restorations' },
  { value: 'Workspace Tuning', label: 'Workspace Tuning' },
  { value: 'Collectibles', label: 'Collectibles & COA' },
  { value: 'Sporting Goods', label: 'Sporting Goods' },
]

const accountTo = computed(() => (isSignedIn.value ? '/dashboard' : '/auth/login?next=/dashboard'))
const ordersTo = computed(() => (isSignedIn.value ? '/dashboard' : '/auth/login?next=/dashboard'))

const shelfItems = computed(() => marketplaceRows.value.slice(0, 16))

const LISTING_SELECT =
  'id, title, price, image_paths, category, seller:profiles!listings_seller_id_fkey(full_name)'

async function loadMarketplaceShelf () {
  if (!import.meta.client) {
    shelfLoading.value = false
    return
  }
  shelfLoading.value = true
  try {
    const supabase = useSupabaseClient()
    const { publicUrlForPath } = useListingImageUrl()
    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(16)

    if (!error && data?.length) {
      marketplaceRows.value = data.map((row) => {
        const sellerName = row.seller?.full_name || 'Marketplace seller'
        const lowered = sellerName.toLowerCase()
        const isBcSeller =
          lowered.includes('b&c') ||
          lowered.includes('b & c') ||
          lowered.includes('bc performance')
        return {
          id: row.id,
          title: row.title,
          priceLabel: `$${Number(row.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          image: publicUrlForPath(row.image_paths?.[0]),
          seller: sellerName,
          isBcSeller,
          to: `/listing/${row.id}`,
          fallbackImage: '/logo.svg',
        }
      })
    } else {
      marketplaceRows.value = []
    }
  } catch {
    marketplaceRows.value = []
  } finally {
    shelfLoading.value = false
  }
}

function onCardImgError (e, item) {
  const el = e?.target
  if (!el || el.dataset?.fallback) return
  el.dataset.fallback = '1'
  el.style.display = 'none'
  if (item?.fallbackImage) {
    const parent = el.parentElement
    if (parent && !parent.querySelector('.card-emoji')) {
      const span = document.createElement('span')
      span.className = 'card-emoji'
      span.textContent = item.isBcSeller ? '🔊' : '📦'
      parent.appendChild(span)
    }
  }
}

function submitSearch () {
  const query = {}
  if (searchText.value.trim()) query.q = searchText.value.trim()
  if (searchDepartment.value) query.category = searchDepartment.value
  router.push({ path: '/browse', query })
}

onMounted(loadMarketplaceShelf)

const opModalOpen = ref(false)
const {
  phrase: opPhrase,
  error: opError,
  submitting: opSubmitting,
  keyConfigured,
  submit: submitOpsPhrase,
} = useOpsUnlock()
let opKnockClicks = 0
let opKnockTimer = null

function onBrandOrLogoClick (e) {
  e.preventDefault()
  if (opKnockTimer) clearTimeout(opKnockTimer)
  opKnockClicks += 1
  opKnockTimer = setTimeout(() => { opKnockClicks = 0 }, 2800)
  if (opKnockClicks >= 5) {
    opKnockClicks = 0
    if (opKnockTimer) clearTimeout(opKnockTimer)
    opModalOpen.value = true
    opError.value = ''
  }
}

function closeOpModal () {
  opModalOpen.value = false
  opPhrase.value = ''
  opError.value = ''
}

async function submitOpModal () {
  const ok = await submitOpsPhrase()
  if (ok) {
    closeOpModal()
    await router.push('/ops/panel')
  }
}
</script>

<style scoped>
.franks-marketplace-home {
  background-color: #0f0f0f;
  color: #ffffff;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.amazon-header-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: #1a1a1a;
  padding: 15px 25px;
  border-bottom: 2px solid #2d2d2d;
}
.logo-box {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-link {
  text-decoration: none;
  color: inherit;
}
.main-title {
  font-size: 22px;
  color: #ffffff;
  margin: 0;
  font-weight: 800;
  letter-spacing: 1px;
}
.accent-red { color: #d32f2f; }
.owner-pill {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(211, 47, 47, 0.2);
  color: #ff5252;
  border: 1px solid rgba(211, 47, 47, 0.45);
}

.amazon-search-bar {
  display: flex;
  flex: 1;
  min-width: 220px;
  max-width: 680px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  background-color: #ffffff;
}
.dept-dropdown {
  background-color: #f3f3f3;
  border: none;
  padding: 0 15px;
  font-size: 13px;
  color: #333333;
  outline: none;
  cursor: pointer;
  border-right: 1px solid #ddd;
  max-width: 180px;
}
.search-input {
  flex: 1;
  border: none;
  padding: 12px 15px;
  font-size: 15px;
  outline: none;
  color: #111111;
  min-width: 0;
}
.search-btn {
  background-color: #d32f2f;
  border: none;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  color: white;
}

.nav-right-slots {
  display: flex;
  align-items: center;
  gap: 25px;
}
.nav-slot-link {
  text-decoration: none;
  color: inherit;
}
.nav-right-slots small {
  display: block;
  color: #aaaaaa;
  font-size: 11px;
}
.nav-right-slots strong {
  display: block;
  font-size: 14px;
}
.cart-slot {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.cart-icon {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ebay-sub-bar {
  background-color: #242424;
  padding: 10px 25px;
  border-bottom: 3px solid #d32f2f;
}
.ebay-sub-bar ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  gap: 20px;
  align-items: center;
}
.sub-link {
  color: #cccccc;
  text-decoration: none;
  font-size: 13px;
  font-weight: bold;
}
.sub-link:hover,
.sub-link.router-link-active {
  color: #ffffff;
}
.featured-bc-tab {
  margin-left: auto;
  background: #d32f2f;
  padding: 4px 12px;
  border-radius: 4px;
}
.featured-bc-tab a {
  color: #ffffff !important;
  text-decoration: none;
  font-size: 13px;
  font-weight: bold;
}

.compliance-trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  justify-content: space-between;
  background-color: #111111;
  padding: 8px 25px;
  font-size: 12px;
  color: #888888;
  border-bottom: 1px solid #222;
}

.homepage-content { padding: 30px 25px; }
.hero-promo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}
.promo-card {
  background-color: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 6px;
  padding: 25px;
  display: flex;
  flex-direction: column;
}
.promo-card h2 { margin: 0 0 5px 0; font-size: 20px; }
.card-tagline {
  color: #aaaaaa;
  font-size: 13px;
  margin: 0 0 20px 0;
  min-height: 36px;
  line-height: 1.4;
}

.image-placeholder-box {
  background-color: #111111;
  border-radius: 4px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #777777;
  padding: 15px;
  margin-bottom: auto;
  border: 1px dashed #444;
}
.audio-box { border-color: rgba(211, 47, 47, 0.45); }
.sync-alert { font-size: 12px; color: #aaaaaa; font-weight: bold; }

.btn-action-red,
.btn-action-dark,
.btn-action-green {
  display: block;
  text-align: center;
  padding: 12px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  margin-top: 20px;
  border: none;
  cursor: pointer;
}
.btn-action-red { background-color: #d32f2f; color: #ffffff; }
.btn-action-dark { background-color: #333333; color: #ffffff; }
.btn-action-green { background-color: #2e7d32; color: #ffffff; }

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 15px 0;
  font-size: 12px;
  color: #bbbbbb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shelf-title {
  font-size: 19px;
  margin-bottom: 12px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}
.shelf-status {
  color: #aaaaaa;
  font-size: 14px;
}
.shelf-status a { color: #d32f2f; }
.shelf-foot { margin-top: 20px; text-align: center; }
.shelf-more { display: inline-block; margin-top: 0; }

.product-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 22px;
}
.marketplace-card {
  background-color: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 5px;
  overflow: hidden;
}
.card-visual {
  height: 150px;
  background-color: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #2a2a2a;
  overflow: hidden;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-emoji { font-size: 44px; }
.card-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.card-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  min-height: 40px;
  color: #ffffff;
}
.seller-badge {
  font-size: 12px;
  color: #aaaaaa;
  margin: 0 0 12px 0;
}
.badge-red { color: #d32f2f; font-weight: bold; }
.price-row {
  font-size: 17px;
  font-weight: bold;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.free-shipping {
  color: #4caf50;
  font-size: 12px;
  font-weight: normal;
}
.btn-card-checkout {
  display: block;
  text-align: center;
  padding: 10px;
  background: #d32f2f;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: bold;
  border-radius: 4px;
}
.btn-card-checkout:hover { background: #ff5252; color: #fff; }

.op-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.75);
}
.op-modal {
  max-width: 400px;
  width: 100%;
  padding: 24px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
}
.op-modal-h { margin: 0 0 12px; font-size: 1.2rem; }
.op-warn { font-size: 0.85rem; color: #ccc; margin-bottom: 10px; }
.op-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: #111;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}
.op-err { color: #ff5252; font-size: 0.88rem; }
.op-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
.label { display: block; font-size: 0.8rem; color: #aaa; margin-bottom: 4px; }

.owner-sell-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9000;
  padding: 14px 20px;
  border-radius: 999px;
  background: #ffd814;
  color: #0f0f0f;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
}

@media (max-width: 900px) {
  .amazon-header-nav { flex-direction: column; align-items: stretch; }
  .amazon-search-bar { max-width: none; margin: 0; }
  .nav-right-slots { justify-content: space-between; }
  .featured-bc-tab { margin-left: 0; width: 100%; text-align: center; }
}
</style>
