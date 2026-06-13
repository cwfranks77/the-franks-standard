<!--
CURSOR: STRICT MODE — B&C PERFORMANCE AUDIO standalone storefront home.
Only this namespace. No Franks Standard branding in page copy.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BC_BRAND } from '~/utils/bcBrand.js'
import { BC_SHIPPING } from '~/utils/bcShipping.js'
import { BC_LEGAL_NAME } from '~/utils/bcSeo.js'
import { getBcSupport } from '~/utils/bcSupport.js'
import { getPublicSupabaseKey, getPublicSupabaseUrl } from '~/utils/publicSupabase.js'
import {
  BC_AUDIO_DEPARTMENTS,
  bcAudioDepartmentIcon,
  bcAudioDepartmentKey,
  bcAudioDepartmentLabel,
} from '~/utils/bcAudioOnlyCatalog.js'
import { bcPlaceholderImageForProduct, resolveBcProductImage } from '~/utils/bcProductImage.js'
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const GRID_LIMIT = 24

const DEPARTMENTS = BC_AUDIO_DEPARTMENTS

type DeptKey = (typeof DEPARTMENTS)[number]['key']

const config = useRuntimeConfig()
const bcHomePath = computed(() =>
  isBcPowerAudioPrimarySite(config.public.siteUrl) ? '/' : '/bc-audio',
)
const support = computed(() => getBcSupport(config))
const route = useRoute()
const router = useRouter()

const selectedCategory = ref<DeptKey>('all')
const checkoutBusy = ref(false)
const checkoutSku = ref('')
const checkoutTermsAccepted = ref(false)
const { addItem, itemCount } = useCart()
const { products, pending: catalogPending, error: catalogError, refresh: refreshCatalog } = useBcProductCatalog()

onMounted(() => {
  refreshCatalog()
  syncCategoryFromRoute()
})

useHead({
  title: BC_LEGAL_NAME,
  titleTemplate: () => BC_LEGAL_NAME,
  meta: [
    { key: 'description', name: 'description', content: `${BC_LEGAL_NAME} — authorized wholesale distribution portal.` },
    { key: 'og:title', property: 'og:title', content: BC_LEGAL_NAME },
    { key: 'og:description', property: 'og:description', content: `${BC_LEGAL_NAME} — authorized wholesale distribution portal.` },
    { key: 'twitter:title', name: 'twitter:title', content: BC_LEGAL_NAME },
    { key: 'twitter:description', name: 'twitter:description', content: `${BC_LEGAL_NAME} — authorized wholesale distribution portal.` },
    { key: 'apple-mobile-web-app-title', name: 'apple-mobile-web-app-title', content: BC_BRAND.short },
  ],
})

async function createBcLiveCheckout (body: Record<string, unknown>) {
  try {
    return await $fetch('/api/checkout/live-split-payment', { method: 'POST', body })
  } catch {
    const supabaseUrl = getPublicSupabaseUrl(config)
    const supabaseKey = getPublicSupabaseKey(config)
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Checkout is unavailable. Try again later.')
    }
    return await $fetch(`${supabaseUrl}/functions/v1/bc-dropship-checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      body,
    })
  }
}

const getProductId = (product: any) => {
  if (!product) return ''
  return product.id || product.sku || product.vendorSku || product.code || product.slug || product.name || ''
}

const getProductName = (product: any) => {
  if (!product) return 'Unnamed product'
  return product.name || product.title || 'Unnamed product'
}

const getProductSku = (product: any) => {
  if (!product) return 'N/A'
  return product.sku || product.vendorSku || 'N/A'
}

const getProductSegment = (product: any) => {
  if (!product) return 'Uncategorized'
  return product.category || product.productClass || 'Uncategorized'
}

const getProductDescription = (product: any) => {
  if (!product) return 'No specifications available.'
  const text = product.description || product.longDesc || product.specs || 'No specifications available.'
  return String(text).length > 220 ? `${String(text).slice(0, 217)}…` : text
}

const getProductPrice = (product: any) => {
  if (!product) return null
  const raw = product.price
  if (raw == null || raw === '') return null
  const numeric = Number(raw)
  if (!Number.isFinite(numeric) || numeric <= 0) return null
  return numeric
}

const formatPrice = (product: any) => {
  const numeric = getProductPrice(product)
  if (numeric == null) return 'Contact for pricing'
  return `$${numeric.toFixed(2)}`
}

const getProductImage = (product: any) => resolveBcProductImage(product)

function onProductImageError (event: Event, product: any) {
  const img = event.target as HTMLImageElement | null
  if (!img) return
  const fallback = bcPlaceholderImageForProduct(product)
  if (img.src !== fallback) img.src = fallback
}

function getDeptKey (product: any): DeptKey | null {
  const key = bcAudioDepartmentKey(product)
  if (!key || key === 'all') return null
  return key as DeptKey
}

function getDeptLabel (key: DeptKey | null) {
  if (!key || key === 'all') return 'Authorized Audio'
  return bcAudioDepartmentLabel(key)
}

const getIconForDept = (key: DeptKey | null) => bcAudioDepartmentIcon(key || '')

const catalogInDept = computed(() =>
  products.value.filter((p) => getDeptKey(p) !== null),
)

const filteredProducts = computed(() => {
  const list = selectedCategory.value === 'all'
    ? catalogInDept.value
    : catalogInDept.value.filter((p) => getDeptKey(p) === selectedCategory.value)
  return list.slice(0, GRID_LIMIT)
})

const totalInView = computed(() => {
  if (selectedCategory.value === 'all') return catalogInDept.value.length
  return catalogInDept.value.filter((p) => getDeptKey(p) === selectedCategory.value).length
})

const hasMoreInCatalog = computed(() => totalInView.value > filteredProducts.value.length)

function syncCategoryFromRoute () {
  const dept = String(route.query.dept || 'showroom')
  const hit = DEPARTMENTS.find((d) => d.query === dept)
  selectedCategory.value = hit?.key ?? 'all'
}

function onCategoryChange () {
  const dept = DEPARTMENTS.find((d) => d.key === selectedCategory.value)
  const query = dept && dept.key !== 'all' ? { dept: dept.query } : {}
  router.replace({ path: bcHomePath.value, query })
}

watch(() => route.query.dept, syncCategoryFromRoute)

const handleAddToCart = (product: any) => {
  if (!product) return
  const price = getProductPrice(product)
  if (price == null) {
    alert('Contact helpdesk for pricing on this item.')
    return
  }
  addItem({
    id: getProductId(product),
    name: getProductName(product),
    sku: getProductSku(product),
    price,
    image: getProductImage(product) || undefined,
  })
  alert(`Added "${getProductName(product)}" to cart. (${itemCount.value} item${itemCount.value === 1 ? '' : 's'} total)`)
}

const handleStripeExpress = async (product: any) => {
  if (!product || checkoutBusy.value || !checkoutTermsAccepted.value) return
  const retailPrice = getProductPrice(product)
  if (retailPrice == null) {
    alert('Contact helpdesk for pricing on this item.')
    return
  }

  const customerEmail = window.prompt('Email for your receipt:')?.trim()
  if (!customerEmail) return

  const customerZip = window.prompt('Shipping ZIP code:', '70801')?.trim() || '70801'
  const customerName = window.prompt('Ship to name:', 'Wholesale Buyer')?.trim() || 'Wholesale Buyer'

  checkoutBusy.value = true
  checkoutSku.value = getProductSku(product)
  try {
    const checkout = await createBcLiveCheckout({
      productId: getProductId(product),
      productName: getProductName(product),
      productSku: getProductSku(product),
      customerEmail,
      customerZip,
      shippingAddress: `${customerName} — B&C order`,
      retailPrice,
      siteUrl: String(config.public.siteUrl || '').replace(/\/$/, ''),
    })

    if (checkout?.url) {
      window.location.assign(checkout.url)
      return
    }
    throw new Error('No checkout URL returned from Stripe.')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout could not start.'
    alert(message)
  } finally {
    checkoutBusy.value = false
    checkoutSku.value = ''
  }
}

const isCheckoutBusy = (product: any) =>
  checkoutBusy.value && checkoutSku.value === getProductSku(product)
</script>

<template>
  <div class="bc-home bc-audio-theme">
    <div class="bc-home__ribbon">
      <span class="bc-home__ribbon-left">🔊 {{ BC_BRAND.full }} — AUTHORIZED DISTRIBUTION CENTER</span>
      <span class="bc-home__ribbon-right">Sovereign Dealer Network</span>
    </div>

    <div class="bc-home__gate">
      <div class="bc-home__gate-inner">
        <label class="bc-home__gate-label" for="bc-dept-filter">Audio departments</label>
        <select
          id="bc-dept-filter"
          v-model="selectedCategory"
          class="bc-home__gate-select"
          :disabled="catalogPending"
          @change="onCategoryChange"
        >
          <option v-for="dept in DEPARTMENTS" :key="dept.key" :value="dept.key">
            {{ dept.label }}
          </option>
        </select>
        <a :href="`tel:${support.phoneTel}`" class="bc-home__gate-phone">{{ support.phoneDisplay }}</a>
      </div>
      <p v-if="catalogError" class="bc-home__gate-error" role="alert">
        Catalog could not load.
        <button type="button" class="bc-home__gate-retry" @click="refreshCatalog">Try again</button>
      </p>
    </div>

    <main class="bc-home__main">
      <div class="bc-home__hero bc-fade-in">
        <h2 class="bc-home__title">Competition Audio Inventory</h2>
        <p class="bc-home__lede">
          Home audio, car audio, powersports audio, and Bluetooth speakers — filter by department above.
        </p>
      </div>

      <p v-if="catalogPending" class="bc-home__status">Loading authorized catalog…</p>

      <BcCheckoutTermsAgreement
        v-else-if="filteredProducts.length"
        v-model="checkoutTermsAccepted"
        compact
        class="bc-home__terms"
      />

      <section v-if="!catalogPending && filteredProducts.length" class="bc-home__grid bc-fade-in" aria-label="Product inventory grid">
        <article
          v-for="product in filteredProducts"
          :key="getProductId(product)"
          class="bc-home__card"
        >
          <div class="bc-home__card-top">
            <div class="bc-home__card-media">
              <img
                v-if="getProductImage(product)"
                :src="getProductImage(product)"
                :alt="getProductName(product)"
                class="bc-home__card-img"
                loading="lazy"
                @error="onProductImageError($event, product)"
              >
              <span v-else class="bc-home__card-icon">{{ getIconForDept(getDeptKey(product)) }}</span>
              <span class="bc-home__card-badge">✓ AUTHORIZED PICTURE MATRIX</span>
            </div>
            <div class="bc-home__card-copy">
              <span class="bc-home__card-dept">{{ getDeptLabel(getDeptKey(product)) }}</span>
              <h3 class="bc-home__card-name">{{ getProductName(product) }}</h3>
              <p class="bc-home__card-sku">MODEL SKU: {{ getProductSku(product) }}</p>
              <p class="bc-home__card-desc">{{ getProductDescription(product) }}</p>
            </div>
          </div>
          <div class="bc-home__card-foot">
            <div class="bc-home__card-price-row">
              <span class="bc-home__card-price-label">MSRP Retail Price</span>
              <span class="bc-home__card-price">{{ formatPrice(product) }}</span>
            </div>
            <BcShippingEstimate compact />
            <div class="bc-home__card-actions">
              <button type="button" class="bc-home__btn bc-home__btn--cart" @click="handleAddToCart(product)">
                Add To Cart
              </button>
              <button
                type="button"
                class="bc-home__btn bc-home__btn--buy"
                :disabled="isCheckoutBusy(product) || !checkoutTermsAccepted"
                @click="handleStripeExpress(product)"
              >
                {{ isCheckoutBusy(product) ? 'Starting…' : 'Buy It Now' }}
              </button>
            </div>
          </div>
        </article>
      </section>

      <p v-else-if="!catalogPending && !catalogError" class="bc-home__status">
        No products in this department yet.
        <NuxtLink to="/bc-audio/catalog" class="bc-home__catalog-link">Browse full catalog →</NuxtLink>
      </p>

      <p v-if="hasMoreInCatalog" class="bc-home__more">
        Showing {{ filteredProducts.length }} of {{ totalInView.toLocaleString() }} items in this view.
        <NuxtLink to="/bc-audio/catalog" class="bc-home__catalog-link">Open full catalog →</NuxtLink>
      </p>
    </main>

    <footer class="bc-home__footer">
      <p>{{ BC_BRAND.full }} — Authorized Distribution Hub</p>
      <p class="bc-home__footer-ship">{{ BC_SHIPPING.shortLine }}</p>
    </footer>
  </div>
</template>

<style scoped>
.bc-home.bc-audio-theme {
  --bc-red: #d32f2f;
  --bc-red-deep: #b71c1c;
  --bc-red-bright: #ff5252;
  --bc-bg: #0a0a0a;
  --bc-ink: #f5f5f5;
  --bc-muted: #a3a3a3;
  min-height: calc(100vh - 64px);
  background: var(--bc-bg);
  color: var(--bc-ink);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.bc-home__ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(90deg, var(--bc-red) 0%, #450a0a 55%, #171717 100%);
  border-bottom: 1px solid rgba(211, 47, 47, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.bc-home__ribbon-right {
  color: var(--bc-red-bright);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.bc-home__gate {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: #0a0a0a;
}

.bc-home__gate-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.bc-home__gate-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--bc-muted);
}

.bc-home__gate-select {
  flex: 1 1 16rem;
  max-width: 28rem;
  padding: 0.65rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: #171717;
  color: var(--bc-ink);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.bc-home__gate-select:focus {
  outline: none;
  border-color: var(--bc-red);
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.25);
}

.bc-home__gate-phone {
  margin-left: auto;
  padding: 0.55rem 0.85rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--bc-red-bright);
  font-size: 0.75rem;
  font-weight: 800;
  font-family: ui-monospace, monospace;
  text-decoration: none;
  white-space: nowrap;
}

.bc-home__gate-phone:hover {
  background: rgba(255, 255, 255, 0.08);
}

.bc-home__gate-error {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem 0.75rem;
  font-size: 0.8rem;
  color: #fca5a5;
}

.bc-home__gate-retry {
  margin-left: 0.5rem;
  border: none;
  background: none;
  color: var(--bc-red-bright);
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.bc-home__main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.bc-home__terms {
  max-width: 52rem;
  margin: 0 auto 1.25rem;
}

.bc-home__hero {
  text-align: center;
  max-width: 42rem;
  margin: 0 auto 3rem;
}

.bc-home__eyebrow {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(211, 47, 47, 0.25);
  background: rgba(211, 47, 47, 0.1);
  color: var(--bc-red-bright);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.bc-home__title {
  margin: 1rem 0 0;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 900;
  letter-spacing: -0.02em;
}

.bc-home__lede {
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--bc-muted);
}

.bc-home__status {
  text-align: center;
  font-size: 0.9rem;
  color: var(--bc-muted);
}

.bc-home__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
}

.bc-home__card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #171717 0%, #0a0a0a 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 2px solid var(--bc-red);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.bc-home__card-top {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bc-home__card-media {
  position: relative;
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.bc-home__card-img {
  max-width: 100%;
  max-height: 7rem;
  object-fit: contain;
}

.bc-home__card-icon {
  font-size: 2.75rem;
  user-select: none;
}

.bc-home__card-badge {
  position: absolute;
  bottom: 0.4rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  background: rgba(69, 10, 10, 0.55);
  border: 1px solid rgba(211, 47, 47, 0.25);
  font-size: 0.5rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: var(--bc-red-bright);
  white-space: nowrap;
}

.bc-home__card-dept {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(211, 47, 47, 0.25);
  background: rgba(211, 47, 47, 0.1);
  color: var(--bc-red-bright);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.bc-home__card-name {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
}

.bc-home__card-sku {
  margin: 0.25rem 0 0;
  font-family: ui-monospace, monospace;
  font-size: 0.62rem;
  color: #737373;
}

.bc-home__card-desc {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--bc-muted);
}

.bc-home__card-foot {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.bc-home__card-price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.bc-home__card-price-label {
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #737373;
}

.bc-home__card-price {
  font-size: 1.35rem;
  font-weight: 900;
  color: #34d399;
}

.bc-home__card-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.bc-home__btn {
  padding: 0.75rem 0.5rem;
  border-radius: 0.85rem;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.bc-home__btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.bc-home__btn--cart {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0a0a0a;
  color: #fff;
}

.bc-home__btn--cart:hover:not(:disabled) {
  background: #171717;
}

.bc-home__btn--buy {
  border: none;
  background: linear-gradient(90deg, var(--bc-red) 0%, var(--bc-red-deep) 100%);
  color: #fff;
  box-shadow: 0 6px 18px rgba(211, 47, 47, 0.35);
}

.bc-home__btn--buy:hover:not(:disabled) {
  filter: brightness(1.08);
}

.bc-home__more {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.82rem;
  color: var(--bc-muted);
}

.bc-home__catalog-link {
  color: var(--bc-red-bright);
  font-weight: 800;
  text-decoration: none;
}

.bc-home__catalog-link:hover {
  text-decoration: underline;
}

.bc-home__footer {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

.bc-home__footer p {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #737373;
}

.bc-home__footer-ship {
  margin-top: 8px !important;
  font-size: 0.68rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  text-transform: none !important;
  color: #9ca3af !important;
}

.bc-fade-in {
  animation: bcFadeIn 0.4s ease-in-out forwards;
}

@keyframes bcFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .bc-home__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .bc-home__grid {
    grid-template-columns: 1fr;
  }

  .bc-home__ribbon-right {
    display: none;
  }

  .bc-home__gate-phone {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  .bc-home__card-actions {
    grid-template-columns: 1fr;
  }
}
</style>
