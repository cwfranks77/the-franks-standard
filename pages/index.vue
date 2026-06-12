<template>
  <div class="portal-root bc-audio-theme">
    <div class="portal-ribbon">
      <span class="portal-ribbon__left">🔊 B&amp;C PERFORMANCE AUDIO — AUTHORIZED DISTRIBUTION CENTER</span>
      <span class="portal-ribbon__right">Sovereign Dealer Network</span>
    </div>

    <ClientOnly>
      <div ref="catalogPickerRef" class="portal-catalog-picker portal-catalog-picker--corner">
        <button
          type="button"
          class="portal-catalog-picker__trigger"
          :disabled="catalogPending"
          :aria-expanded="catalogMenuOpen"
          aria-label="Open product catalog menu"
          @click="catalogMenuOpen = !catalogMenuOpen"
        >
          <span class="portal-catalog-picker__icon" aria-hidden="true">
            <span class="portal-catalog-picker__line" />
            <span class="portal-catalog-picker__line" />
            <span class="portal-catalog-picker__line" />
            <span class="portal-catalog-picker__line" />
          </span>
        </button>

        <div v-if="catalogMenuOpen && catalogReady" class="portal-catalog-picker__panel">
          <div
            v-for="group in catalogGroups"
            :key="group.label"
            class="portal-catalog-picker__group"
          >
            <button
              type="button"
              class="portal-catalog-picker__category"
              @click="toggleCategory(group.label)"
            >
              <span class="portal-catalog-picker__category-name">{{ group.label }}</span>
              <span class="portal-catalog-picker__count">{{ group.items.length }}</span>
              <span class="portal-catalog-picker__caret" aria-hidden="true">{{ expandedCategory === group.label ? '▾' : '▸' }}</span>
            </button>
            <div
              v-if="expandedCategory === group.label"
              class="portal-catalog-picker__products"
            >
              <button
                v-for="product in group.items"
                :key="getProductId(product)"
                type="button"
                class="portal-catalog-picker__product"
                @click="selectProductFromMenu(product, group.label)"
              >
                {{ getProductName(product) }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #fallback>
        <button
          type="button"
          class="portal-catalog-picker__trigger portal-catalog-picker__trigger--corner"
          disabled
          aria-label="Loading catalog menu"
        >
          <span class="portal-catalog-picker__icon" aria-hidden="true">
            <span class="portal-catalog-picker__line" />
            <span class="portal-catalog-picker__line" />
            <span class="portal-catalog-picker__line" />
            <span class="portal-catalog-picker__line" />
          </span>
        </button>
      </template>
    </ClientOnly>

    <nav class="portal-nav">
      <button type="button" class="portal-nav__brand" @click="onBrandOrLogoClick">
        <img
          src="/img/bc-logo-primary.png?v=20260612"
          alt="B&amp;C Performance Audio"
          class="portal-nav__logo-img"
          width="260"
          height="60"
          decoding="async"
          fetchpriority="high"
        >
      </button>

      <div class="portal-nav__headline">
        <h1 class="portal-nav__title">B&amp;C PERFORMANCE AUDIO LLC</h1>
        <p class="portal-nav__owner">Owner {{ support.ownerName }}</p>
        <a :href="`tel:${support.phoneTel}`" class="portal-nav__phone">{{ support.phoneDisplay }}</a>
        <p class="portal-nav__policy">
          Open-door policy: the owner is available anytime for customer questions and issues.
        </p>
        <form class="portal-nav__search" role="search" @submit.prevent="runCatalogSearch">
          <label class="portal-nav__search-label" for="portal-catalog-search">Search catalog</label>
          <input
            id="portal-catalog-search"
            v-model="catalogSearchQuery"
            type="search"
            class="portal-nav__search-input"
            placeholder="Search products, brands, or SKU..."
            autocomplete="off"
            :disabled="catalogPending"
          >
          <button type="submit" class="portal-nav__search-btn" :disabled="catalogPending || catalogSearchQuery.trim().length < 2">
            Search
          </button>
        </form>
      </div>

      <div class="portal-nav__balance" aria-hidden="true" />
    </nav>

    <main class="portal-main">
      <div v-if="viewMode === 'showroom'" class="portal-fade">
        <div class="portal-hero">
          <h2 class="portal-hero__title">Authorized Dealer Distribution Network</h2>
        </div>

        <p v-if="catalogError" class="portal-catalog-error" role="alert">
          Catalog could not load.
          <button type="button" class="portal-catalog-retry" @click="refreshCatalog">Try again</button>
        </p>

        <p v-else-if="catalogPending" class="portal-catalog-loading" aria-live="polite">
          Loading live catalog…
        </p>

        <div class="portal-scroll-stack" :class="{ 'portal-scroll-stack--pending': catalogPending }">
          <section
            v-for="lane in showcaseLanes"
            :key="lane.deptKey"
            class="portal-showcase"
          >
            <header class="portal-showcase__head">
              <div class="portal-showcase__icon" aria-hidden="true">{{ lane.icon }}</div>
              <div>
                <span v-if="lane.badge" class="portal-showcase__badge">{{ lane.badge }}</span>
                <h3 class="portal-showcase__title">{{ lane.title }}</h3>
                <p class="portal-showcase__desc">{{ lane.description }}</p>
              </div>
            </header>

            <div
              class="portal-scroll"
              :class="`portal-scroll--lane-${lane.laneIndex}`"
              :aria-label="`${lane.title} catalog images`"
            >
              <div class="portal-scroll__fade portal-scroll__fade--left" />
              <div class="portal-scroll__fade portal-scroll__fade--right" />
              <div class="portal-scroll__track">
                <div class="portal-scroll__row">
                  <figure
                    v-for="(tile, i) in lane.tiles"
                    :key="`a-${lane.deptKey}-${i}-${tile.productId}`"
                    class="portal-scroll__cell"
                    role="button"
                    tabindex="0"
                    @click="openProductFromTile(tile)"
                    @keydown.enter="openProductFromTile(tile)"
                  >
                    <div class="portal-scroll__img-wrap">
                      <img
                        :src="tile.url"
                        :alt="tile.alt"
                        class="portal-scroll__img"
                        loading="eager"
                        decoding="async"
                        referrerpolicy="no-referrer"
                        @error="onScrollImageError($event, tile)"
                      >
                    </div>
                  </figure>
                </div>
                <div class="portal-scroll__row" aria-hidden="true">
                  <figure
                    v-for="(tile, i) in lane.tiles"
                    :key="`b-${lane.deptKey}-${i}-${tile.productId}`"
                    class="portal-scroll__cell"
                    aria-hidden="true"
                  >
                    <div class="portal-scroll__img-wrap">
                      <img
                        :src="tile.url"
                        :alt="tile.alt"
                        class="portal-scroll__img"
                        loading="eager"
                        decoding="async"
                      >
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div v-else-if="viewMode === 'category' || viewMode === 'search'" class="portal-category portal-fade">
        <button type="button" class="portal-detail__back" @click="backToShowroom">
          ← Return to Master Showroom
        </button>

        <header class="portal-category__head">
          <span class="portal-category__eyebrow">{{ viewMode === 'search' ? 'Catalog search' : 'Category catalog' }}</span>
          <h2 class="portal-category__title">
            {{ viewMode === 'search' ? `Results for “${catalogSearchQuery.trim()}”` : selectedCategoryLabel }}
          </h2>
          <p class="portal-category__meta">
            {{ categoryListProducts.length }} items — select one for full details
          </p>
        </header>

        <div class="portal-category__grid">
          <article
            v-for="product in categoryListProducts"
            :key="getProductId(product)"
            class="portal-category__card"
            :class="{ 'portal-category__card--active': getProductId(product) === selectedProductId }"
            role="button"
            tabindex="0"
            @click="openProductFromCategory(product)"
            @keydown.enter="openProductFromCategory(product)"
          >
            <div class="portal-category__img-wrap">
              <img
                v-if="getProductImage(product)"
                :src="getProductImage(product)"
                :alt="getProductName(product)"
                class="portal-category__img"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="onCategoryImageError($event, product)"
              >
              <div v-else class="portal-category__img-fallback">
                {{ getIconForProduct(product) }}
              </div>
            </div>
            <div class="portal-category__body">
              <h3 class="portal-category__name">{{ getProductName(product) }}</h3>
              <p class="portal-category__sku">SKU: {{ getProductSku(product) }}</p>
              <p class="portal-category__price">{{ formatPrice(product) }}</p>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="portal-detail portal-fade">
        <button type="button" class="portal-detail__back" @click="resetToHome">
          {{ selectedCategoryLabel ? '← Back to category list' : '← Return to Master Showroom' }}
        </button>

        <article v-if="currentProduct" class="portal-detail__card">
          <div class="portal-detail__grid">
            <div class="portal-detail__media">
              <img
                v-if="getProductImage(currentProduct)"
                :src="getProductImage(currentProduct)"
                :alt="getProductName(currentProduct)"
                class="portal-detail__img"
                loading="lazy"
                @error="onDetailImageError($event, currentProduct)"
              >
              <template v-else>
                <div class="portal-detail__media-overlay" />
                <span class="portal-detail__icon">{{ getIconForProduct(currentProduct) }}</span>
              </template>
              <div class="portal-detail__media-badge">
                <p>✓ AUTHORIZED RETAIL MANIFEST ASSET</p>
              </div>
            </div>

            <div class="portal-detail__body">
              <span class="portal-detail__dept">{{ getProductListCategory(currentProduct) }}</span>
              <h2 class="portal-detail__name">{{ getProductName(currentProduct) }}</h2>
              <p class="portal-detail__sku">MODEL SKU: {{ getProductSku(currentProduct) }}</p>

              <div class="portal-detail__desc">
                <p>{{ getProductDescription(currentProduct) }}</p>
              </div>

              <div class="portal-detail__price-row">
                <span class="portal-detail__price-label">Markup Retail Price</span>
                <span class="portal-detail__price">{{ formatPrice(currentProduct) }}</span>
              </div>

              <div class="portal-detail__actions">
                <button type="button" class="portal-btn portal-btn--cart" @click="handleAddToCart">
                  Add to Cart
                </button>
                <button
                  type="button"
                  class="portal-btn portal-btn--buy"
                  :disabled="checkoutBusy"
                  @click="handleBuyNow"
                >
                  {{ checkoutBusy ? 'Starting checkout…' : 'Buy It Now' }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <footer class="portal-footer">
      <p>{{ siteMeta.parentCompany }} — Competition car audio megastore</p>
      <div v-if="socialLinks.length" class="portal-footer__social">
        <a
          v-for="link in socialLinks"
          :key="link.id"
          :href="link.url"
          class="portal-footer__social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.label }}
        </a>
      </div>
    </footer>

    <OperatorUnlockModal
      :open="opModalOpen"
      :phrase="opPhrase"
      :error="opError"
      :submitting="opSubmitting"
      :key-configured="keyConfigured"
      :is-dev="isDev"
      @update:phrase="opPhrase = $event"
      @close="closeOpModal"
      @submit="submitOpModal"
    />
  </div>
</template>

<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'
import { buildSocialLinks } from '~/utils/siteSocial.js'
import { getPublicSupabaseKey, getPublicSupabaseUrl } from '~/utils/publicSupabase.js'
import {
  bcAudioDepartmentIcon,
  bcAudioDepartmentKey,
  filterBcAudioProducts,
} from '~/utils/bcAudioOnlyCatalog.js'
import {
  bcPlaceholderImageForProduct,
  fixPetraImageUrl,
  petraImageUrlFromSku,
  resolveBcProductImage,
} from '~/utils/bcProductImage.js'
import { bcProductShelfCategory } from '~/utils/bcProductShelfCategory.js'

definePageMeta({ layout: false, pageTransition: false })

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))
const socialLinks = computed(() => buildSocialLinks(config.public))
const { meta: siteMeta } = useBcSiteMeta()

const SHOWCASE_LANE_DEFS = [
  {
    deptKey: 'home',
    laneIndex: 0,
    icon: '🔊',
    title: 'Home Audio',
    badge: 'SURROUND AUDIO MATRIX',
    description: 'Receivers, speakers, amplifiers, and home theater from authorized competition lines.',
  },
  {
    deptKey: 'car',
    laneIndex: 1,
    icon: '🚗',
    title: 'Car Audio',
    badge: 'COMPETITION OUTPUT',
    description: 'Amplifiers, subwoofers, speakers, and install gear for automotive sound systems.',
  },
  {
    deptKey: 'powersports',
    laneIndex: 2,
    icon: '⚓',
    title: 'Powersports & Marine Audio',
    badge: 'ELEMENT-PROOF OUTPUT',
    description: 'Marine and powersports audio built for high-output offshore and trail environments.',
  },
  {
    deptKey: 'bluetooth',
    laneIndex: 3,
    icon: '📶',
    title: 'Bluetooth & Portable',
    badge: 'WIRELESS',
    description: 'Portable Bluetooth speakers and wireless audio for on-the-go listening.',
  },
]

const viewMode = ref('showroom')
const selectedProductId = ref('')
const selectedCategoryLabel = ref('')
const catalogMenuOpen = ref(false)
const expandedCategory = ref('')
const catalogSearchQuery = ref('')
const catalogPickerRef = ref(null)
const checkoutBusy = ref(false)

const catalogProducts = ref([])
const catalogPending = ref(true)
const catalogError = ref(null)
const SCROLL_IMAGE_FALLBACK = '/img/hero-showcase-v2.svg'

async function refreshCatalog () {
  catalogPending.value = true
  catalogError.value = null
  try {
    const data = await $fetch('/catalog/petra-products.json', { retry: 2 })
    const rows = Array.isArray(data?.products) ? data.products : []
    catalogProducts.value = filterBcAudioProducts(rows)
    if (!catalogProducts.value.length) {
      throw new Error('Catalog returned no products.')
    }
  } catch (err) {
    catalogError.value = err
    catalogProducts.value = []
  } finally {
    catalogPending.value = false
  }
}

onMounted(() => {
  refreshCatalog()
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

function onDocumentClick (event) {
  const root = catalogPickerRef.value
  if (!root || !catalogMenuOpen.value) return
  if (!root.contains(event.target)) {
    catalogMenuOpen.value = false
  }
}

const catalogReady = computed(() =>
  !catalogPending.value && !catalogError.value && catalogProducts.value.length > 0,
)

const {
  isDev,
  opModalOpen,
  opPhrase,
  opError,
  opSubmitting,
  keyConfigured,
  onBrandOrLogoClick,
  closeOpModal,
  submitOpModal,
} = useOpsLogoKnock()

useHead({
  meta: [
    { key: 'apple-mobile-web-app-title', name: 'apple-mobile-web-app-title', content: BC_BRAND.short },
  ],
})

function getProductId (product) {
  if (!product) return ''
  return String(product.id || product.sku || product.vendorSku || product.code || product.slug || product.name || '')
}

function getProductName (product) {
  if (!product) return 'Unnamed product'
  return product.name || product.title || 'Unnamed product'
}

function getProductSku (product) {
  if (!product) return 'N/A'
  return product.sku || product.vendorSku || 'N/A'
}

function getProductSegment (product) {
  if (!product) return 'Uncategorized'
  return product.category || product.productClass || 'Uncategorized'
}

function getProductDescription (product) {
  if (!product) return 'No specifications available.'
  return product.description || product.longDesc || product.specs || 'No specifications available.'
}

function resolveCategoryMarkup (category, name) {
  const cat = String(category || '').toLowerCase()
  const label = String(name || '').toLowerCase()
  if (cat.includes('marine') || label.includes('marine')) return 2.10
  if (cat.includes('car') || label.includes('car audio') || label.includes('subwoofer') || label.includes('amplifier')) return 1.55
  if (cat.includes('home') || label.includes('receiver') || label.includes('soundbar') || label.includes('theater')) return 1.70
  if (cat.includes('accessory') || label.includes('cable') || label.includes('mount') || label.includes('adapter')) return 2.50
  return 1.55
}

/** Wholesale/dealer cost only — never use public retail `price` when retailPrice is set. */
function getProductWholesaleCost (product) {
  if (!product) return null
  const raw = product.wholesalePrice ?? product.baseCost ?? product.wholesaleCost ?? product.cost
  if (raw == null || raw === '') return null
  const numeric = Number(raw)
  if (!Number.isFinite(numeric) || numeric <= 0) return null
  return numeric
}

function getProductBaseCost (product) {
  return getProductWholesaleCost(product)
}

function calculateTargetRetailPrice (product) {
  if (!product || !product.baseCost) return '0.00'
  const markup = resolveCategoryMarkup(product.category, product.name)
  return (product.baseCost * markup).toFixed(2)
}

/** Public storefront price — MAP-safe retail only, never raw wholesale. */
function getProductPrice (product) {
  if (!product) return null
  const retailRaw = product.retailPrice ?? product.msrp
  if (retailRaw != null && retailRaw !== '') {
    const retail = Number(retailRaw)
    if (Number.isFinite(retail) && retail > 0) return retail
  }
  const wholesale = getProductWholesaleCost(product)
  if (wholesale != null) {
    const calculated = Number(calculateTargetRetailPrice({
      baseCost: wholesale,
      category: getProductSegment(product),
      name: getProductName(product),
    }))
    if (Number.isFinite(calculated) && calculated > 0) return calculated
  }
  return null
}

function formatPrice (product) {
  const numeric = getProductPrice(product)
  if (numeric == null) return 'Contact for pricing'
  return `$${numeric.toFixed(2)}`
}

function getProductListCategory (product) {
  return bcProductShelfCategory(product)
}

function hasCatalogImage (product) {
  return Boolean(resolveBcProductImage(product))
}

function getProductImage (product) {
  return resolveBcProductImage(product)
}

function laneMatchesProduct (deptKey, product) {
  return getDeptKey(product) === deptKey
}

function getDeptKey (product) {
  return bcAudioDepartmentKey(product)
}

const catalogGroups = computed(() => {
  const map = new Map()
  for (const product of catalogProducts.value) {
    const label = getProductListCategory(product)
    if (!map.has(label)) map.set(label, [])
    map.get(label).push(product)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, items]) => ({
      label,
      items: items.sort((a, b) => getProductName(a).localeCompare(getProductName(b))),
    }))
})

const currentProduct = computed(() =>
  catalogProducts.value.find((p) => getProductId(p) === selectedProductId.value) || null,
)

const searchResultProducts = computed(() => {
  const q = catalogSearchQuery.value.trim().toLowerCase()
  if (!q || q.length < 2) return []
  return catalogProducts.value.filter((product) => {
    const haystack = [
      getProductName(product),
      getProductSku(product),
      getProductListCategory(product),
      product.brand,
      product.description,
    ].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(q)
  })
})

const categoryListProducts = computed(() => {
  if (viewMode.value === 'search') {
    return searchResultProducts.value
  }
  if (!selectedCategoryLabel.value) return []
  const group = catalogGroups.value.find((g) => g.label === selectedCategoryLabel.value)
  return group?.items || []
})

function runCatalogSearch () {
  const q = catalogSearchQuery.value.trim()
  if (q.length < 2) return
  selectedCategoryLabel.value = ''
  selectedProductId.value = ''
  catalogMenuOpen.value = false
  expandedCategory.value = ''
  viewMode.value = 'search'
}

function pushTile (tiles, seen, product) {
  const productId = getProductId(product)
  if (!productId || seen.has(productId)) return
  const url = getProductImage(product)
  if (!url) return
  seen.add(productId)
  tiles.push({
    productId,
    url,
    alt: getProductName(product),
    sku: getProductSku(product),
    triedSkuFallback: false,
  })
}

function buildLaneTiles (deptKey, perLane = 28) {
  const tiles = []
  const seen = new Set()
  const withImages = catalogProducts.value.filter((product) => hasCatalogImage(product))
  const deptProducts = withImages.filter((product) => laneMatchesProduct(deptKey, product))

  for (const product of deptProducts) {
    pushTile(tiles, seen, product)
    if (tiles.length >= perLane) return tiles
  }

  const laneIndex = SHOWCASE_LANE_DEFS.find((lane) => lane.deptKey === deptKey)?.laneIndex ?? 0
  for (let i = 0; i < withImages.length && tiles.length < perLane; i++) {
    pushTile(tiles, seen, withImages[(i + laneIndex * 41) % withImages.length])
  }

  return tiles
}

const showcaseLanes = computed(() =>
  SHOWCASE_LANE_DEFS.map((lane) => ({
    ...lane,
    tiles: buildLaneTiles(lane.deptKey),
  })),
)

function onScrollImageError (event, tile) {
  const img = event?.target
  if (!img || !tile) return
  const fixed = fixPetraImageUrl(tile.url) || petraImageUrlFromSku(tile.sku)
  if (fixed && img.src !== fixed) {
    img.src = fixed
    return
  }
  if (!img.src.endsWith(SCROLL_IMAGE_FALLBACK)) {
    img.src = SCROLL_IMAGE_FALLBACK
  }
}

function onDetailImageError (event, product) {
  const img = event?.target
  if (!img || !product) return
  const fixed = getProductImage(product)
  if (fixed && img.src !== fixed) {
    img.src = fixed
    return
  }
  const fallback = bcPlaceholderImageForProduct(product)
  if (img.src !== fallback) img.src = fallback
}

function openProductFromTile (tile) {
  if (!tile?.productId) return
  const product = catalogProducts.value.find((p) => getProductId(p) === tile.productId)
  if (product) {
    selectedCategoryLabel.value = getProductListCategory(product)
  }
  selectedProductId.value = tile.productId
  viewMode.value = 'detail'
}

function toggleCategory (label) {
  expandedCategory.value = expandedCategory.value === label ? '' : label
}

function selectProductFromMenu (product, categoryLabel) {
  if (!product) return
  selectedCategoryLabel.value = categoryLabel || getProductListCategory(product)
  selectedProductId.value = getProductId(product)
  catalogMenuOpen.value = false
  expandedCategory.value = ''
  viewMode.value = 'category'
}

function openProductFromCategory (product) {
  if (!product) return
  selectedProductId.value = getProductId(product)
  viewMode.value = 'detail'
}

function onCategoryImageError (event, product) {
  onDetailImageError(event, product)
}

function backToShowroom () {
  selectedProductId.value = ''
  selectedCategoryLabel.value = ''
  catalogSearchQuery.value = ''
  catalogMenuOpen.value = false
  expandedCategory.value = ''
  viewMode.value = 'showroom'
}

function getIconForProduct (product) {
  return bcAudioDepartmentIcon(getDeptKey(product) || '')
}

function resetToHome () {
  selectedProductId.value = ''
  if (catalogSearchQuery.value.trim().length >= 2) {
    viewMode.value = 'search'
    return
  }
  if (selectedCategoryLabel.value) {
    viewMode.value = 'category'
    return
  }
  backToShowroom()
}

const { addItem, itemCount } = useCart()

function handleAddToCart () {
  const product = currentProduct.value
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

async function handleBuyNow () {
  const product = currentProduct.value
  if (!product || checkoutBusy.value) return
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
  try {
    const config = useRuntimeConfig()
    const wholesaleCost = getProductBaseCost(product) ?? Math.round(retailPrice * 0.7 * 100) / 100
    const body = {
      productId: getProductId(product),
      productName: getProductName(product),
      productSku: getProductSku(product),
      customerEmail,
      customerZip,
      shippingAddress: `${customerName} — B&C wholesale order`,
      retailPrice,
      wholesaleCost,
    }

    let checkout
    try {
      checkout = await $fetch('/api/checkout/live-split-payment', { method: 'POST', body })
    } catch {
      const supabaseUrl = getPublicSupabaseUrl(config)
      const supabaseKey = getPublicSupabaseKey(config)
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Checkout is unavailable. Try again later.')
      }
      checkout = await $fetch(`${supabaseUrl}/functions/v1/bc-dropship-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body,
      })
    }

    if (checkout?.url) {
      window.location.assign(checkout.url)
      return
    }
    throw new Error('No checkout URL returned.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout could not start.'
    alert(message)
  } finally {
    checkoutBusy.value = false
  }
}
</script>

<style scoped>
.bc-audio-theme.portal-root {
  --portal-red: #d32f2f;
  --portal-red-deep: #b71c1c;
  --portal-red-bright: #ff5252;
  --portal-bg: #0a0a0a;
  --portal-charcoal: #141414;
  --portal-ink: #f5f5f5;
  --portal-muted: #a3a3a3;
  position: relative;
  min-height: 100vh;
  background: var(--portal-bg);
  color: var(--portal-ink);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.portal-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 3.5rem 0.5rem 1.5rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(90deg, var(--portal-red) 0%, #450a0a 50%, var(--portal-charcoal) 100%);
  border-bottom: 1px solid rgba(211, 47, 47, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.portal-ribbon__right {
  color: var(--portal-red-bright);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.portal-nav {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--portal-bg);
}

.portal-nav__headline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-align: center;
}

.portal-nav__balance {
  width: 2.5rem;
  height: 2.5rem;
  justify-self: end;
}

.portal-nav__brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  justify-self: start;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  text-align: left;
}

.portal-nav__logo-img {
  display: block;
  width: auto;
  max-width: min(260px, 58vw);
  height: 56px;
  object-fit: contain;
}

.portal-nav__title {
  margin: 0;
  font-size: clamp(0.82rem, 2.5vw, 1.05rem);
  font-weight: 900;
  letter-spacing: 0.02em;
}

.portal-nav__owner {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.04em;
}

.portal-nav__policy {
  margin: 0;
  max-width: 20rem;
  font-size: 0.58rem;
  line-height: 1.45;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

.portal-nav__search {
  display: flex;
  align-items: stretch;
  width: min(100%, 22rem);
  margin-top: 0.15rem;
  border-radius: 0.45rem;
  overflow: hidden;
  border: 1px solid rgba(211, 47, 47, 0.45);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.portal-nav__search-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.portal-nav__search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 0.68rem;
  padding: 0.45rem 0.55rem;
  outline: none;
}

.portal-nav__search-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.portal-nav__search-btn {
  flex-shrink: 0;
  border: none;
  background: linear-gradient(135deg, var(--portal-red) 0%, #8b1a1a 100%);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}

.portal-nav__search-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.portal-catalog-picker {
  position: relative;
  flex-shrink: 0;
}

.portal-catalog-picker--corner {
  position: fixed;
  top: 0.35rem;
  right: 0.35rem;
  z-index: 60;
}

.portal-catalog-picker__trigger--corner {
  position: fixed;
  top: 0.35rem;
  right: 0.35rem;
  z-index: 60;
}

.portal-catalog-picker__trigger {
  width: 2.75rem;
  height: 2.75rem;
  padding: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: var(--portal-charcoal);
  color: var(--portal-ink);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.portal-catalog-picker__icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.22rem;
  width: 1.15rem;
}

.portal-catalog-picker__line {
  display: block;
  height: 2px;
  width: 100%;
  border-radius: 1px;
  background: var(--portal-ink);
}

.portal-catalog-picker__trigger:focus {
  outline: none;
  border-color: var(--portal-red);
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.25);
}

.portal-catalog-picker__trigger:disabled {
  opacity: 0.7;
  cursor: wait;
}

.portal-catalog-picker__panel {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  z-index: 40;
  width: min(22rem, 92vw);
  max-height: min(24rem, 60vh);
  overflow-y: auto;
  border-radius: 0.85rem;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: #121212;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
}

.portal-catalog-picker__group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.portal-catalog-picker__group:last-child {
  border-bottom: none;
}

.portal-catalog-picker__category {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.85rem;
  border: none;
  background: transparent;
  color: var(--portal-ink);
  font-size: 0.72rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.portal-catalog-picker__category:hover {
  background: rgba(211, 47, 47, 0.1);
}

.portal-catalog-picker__category-name {
  line-height: 1.35;
}

.portal-catalog-picker__count {
  font-size: 0.62rem;
  color: var(--portal-muted);
  font-weight: 700;
}

.portal-catalog-picker__caret {
  color: var(--portal-red-bright);
  font-size: 0.75rem;
}

.portal-catalog-picker__products {
  padding: 0 0.45rem 0.45rem;
  background: rgba(0, 0, 0, 0.25);
}

.portal-catalog-picker__product {
  display: block;
  width: 100%;
  padding: 0.55rem 0.65rem;
  margin-top: 0.25rem;
  border: none;
  border-radius: 0.55rem;
  background: rgba(255, 255, 255, 0.04);
  color: #e5e5e5;
  font-size: 0.68rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.portal-catalog-picker__product:hover {
  background: rgba(211, 47, 47, 0.18);
  color: #fff;
}

.portal-category__head {
  text-align: center;
  margin-bottom: 2rem;
}

.portal-category__eyebrow {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(211, 47, 47, 0.25);
  background: rgba(211, 47, 47, 0.1);
  color: var(--portal-red-bright);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.portal-category__title {
  margin: 1rem 0 0.35rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
}

.portal-category__meta {
  margin: 0;
  font-size: 0.82rem;
  color: var(--portal-muted);
}

.portal-category__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 1rem;
}

.portal-category__card {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--portal-charcoal);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.portal-category__card:hover,
.portal-category__card:focus-visible {
  outline: none;
  border-color: rgba(211, 47, 47, 0.45);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.portal-category__card--active {
  border-color: var(--portal-red);
  box-shadow: 0 0 0 1px rgba(211, 47, 47, 0.35);
}

.portal-category__img-wrap {
  aspect-ratio: 1;
  background: var(--portal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.portal-category__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.5rem;
}

.portal-category__img-fallback {
  font-size: 2rem;
}

.portal-category__body {
  padding: 0.75rem;
}

.portal-category__name {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.35;
}

.portal-category__sku {
  margin: 0.35rem 0 0;
  font-size: 0.62rem;
  color: var(--portal-muted);
  font-family: ui-monospace, monospace;
}

.portal-category__price {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--portal-red-bright);
}

.portal-nav__phone {
  display: inline-block;
  padding: 0.2rem 0;
  border: none;
  background: none;
  color: var(--portal-red-bright);
  font-size: 0.72rem;
  font-weight: 800;
  font-family: ui-monospace, monospace;
  text-decoration: none;
  white-space: nowrap;
}

.portal-nav__phone:hover {
  background: rgba(255, 255, 255, 0.08);
}

.portal-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.portal-hero {
  text-align: center;
  max-width: 42rem;
  margin: 0 auto 2.5rem;
}

.portal-hero__eyebrow {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(211, 47, 47, 0.25);
  background: rgba(211, 47, 47, 0.1);
  color: var(--portal-red-bright);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.portal-hero__title {
  margin: 1rem 0 0;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 900;
}

.portal-hero__lede {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--portal-muted);
}

.portal-hero__meta {
  margin: 0.75rem 0 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--portal-red-bright);
}

.portal-catalog-error,
.portal-catalog-loading {
  text-align: center;
  font-size: 0.85rem;
  color: var(--portal-muted);
  margin: 0 0 0.75rem;
}

.portal-scroll-stack--pending {
  opacity: 0.55;
  pointer-events: none;
}

.portal-catalog-error {
  color: #fca5a5;
}

.portal-catalog-retry {
  margin-left: 0.5rem;
  border: none;
  background: none;
  color: var(--portal-red-bright);
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.portal-scroll-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.portal-showcase {
  border-radius: 1.25rem;
  border: 1px solid rgba(211, 47, 47, 0.2);
  background: linear-gradient(180deg, rgba(23, 23, 23, 0.9) 0%, #0f0f0f 100%);
  overflow: hidden;
}

.portal-showcase__head {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.85rem;
}

.portal-showcase__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  background: rgba(211, 47, 47, 0.12);
  border: 1px solid rgba(211, 47, 47, 0.25);
  flex-shrink: 0;
}

.portal-showcase__badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 0.35rem;
  background: rgba(69, 10, 10, 0.8);
  border: 1px solid rgba(211, 47, 47, 0.25);
  color: var(--portal-red-bright);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.portal-showcase__title {
  margin: 0.45rem 0 0;
  font-size: 1.1rem;
  font-weight: 900;
}

.portal-showcase__desc {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--portal-muted);
  max-width: 42rem;
}

.portal-scroll {
  position: relative;
  overflow: hidden;
  padding: 0.85rem 0 1rem;
}

.portal-scroll__fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4rem;
  z-index: 2;
  pointer-events: none;
}

.portal-scroll__fade--left {
  left: 0;
  background: linear-gradient(90deg, #0f0f0f, transparent);
}

.portal-scroll__fade--right {
  right: 0;
  background: linear-gradient(270deg, #0f0f0f, transparent);
}

.portal-scroll__track {
  display: flex;
  width: max-content;
  animation: portalScroll 50s linear infinite;
}

.portal-scroll--lane-1 .portal-scroll__track {
  animation-duration: 58s;
  animation-direction: reverse;
}

.portal-scroll--lane-2 .portal-scroll__track {
  animation-duration: 66s;
}

.portal-scroll__row {
  display: flex;
  gap: 0.85rem;
  padding: 0 0.5rem;
}

.portal-scroll__cell {
  margin: 0;
  flex: 0 0 auto;
  width: 9.5rem;
  border-radius: 0.85rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #171717;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.portal-scroll__cell:focus-visible {
  outline: 2px solid var(--portal-red);
  outline-offset: 2px;
}

.portal-scroll__img-wrap {
  height: 7.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
}

.portal-scroll__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

@keyframes portalScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.portal-detail__back {
  border: none;
  background: none;
  color: var(--portal-red-bright);
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
}

.portal-detail__back:hover {
  color: #fff;
}

.portal-detail__card {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(23, 23, 23, 0.55);
  border: 1px solid rgba(211, 47, 47, 0.25);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.portal-detail__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 2rem;
}

.portal-detail__media {
  position: relative;
  min-height: 21rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
  background: var(--portal-bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.portal-detail__img {
  max-width: 100%;
  max-height: 20rem;
  object-fit: contain;
  z-index: 1;
}

.portal-detail__media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 10, 0.7);
}

.portal-detail__icon {
  position: relative;
  z-index: 1;
  font-size: 5rem;
  user-select: none;
}

.portal-detail__media-badge {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(69, 10, 10, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(211, 47, 47, 0.25);
}

.portal-detail__media-badge p {
  margin: 0;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: var(--portal-red-bright);
  text-align: center;
  white-space: nowrap;
}

.portal-detail__dept {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(211, 47, 47, 0.25);
  background: rgba(211, 47, 47, 0.1);
  color: var(--portal-red-bright);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.portal-detail__name {
  margin: 0.6rem 0 0;
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.25;
}

.portal-detail__sku {
  margin: 0.35rem 0 0;
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  color: #737373;
}

.portal-detail__desc {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.85rem;
  background: var(--portal-bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.portal-detail__desc p {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.65;
  color: #d4d4d4;
}

.portal-detail__price-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.portal-detail__price-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--portal-muted);
}

.portal-detail__price {
  font-size: 1.85rem;
  font-weight: 900;
  color: #34d399;
}

.portal-detail__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.portal-btn {
  padding: 1rem 1.25rem;
  border-radius: 0.85rem;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, filter 0.15s;
}

.portal-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.portal-btn--cart {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: var(--portal-bg);
  color: #fff;
}

.portal-btn--cart:hover:not(:disabled) {
  background: var(--portal-charcoal);
}

.portal-btn--buy {
  border: none;
  background: linear-gradient(90deg, var(--portal-red) 0%, var(--portal-red-deep) 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.35);
}

.portal-btn--buy:hover:not(:disabled) {
  filter: brightness(1.08);
}

.portal-footer {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

.portal-footer p {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #737373;
}

.portal-footer__social {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem 1rem;
  margin-top: 1rem;
}

.portal-footer__social-link {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #d32f2f;
  text-decoration: none;
}

.portal-footer__social-link:hover {
  color: #ff5252;
}

.portal-fade {
  animation: portalFade 0.3s ease-in-out forwards;
}

@keyframes portalFade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .portal-ribbon {
    padding-right: 3.25rem;
  }

  .portal-ribbon__right {
    display: none;
  }

  .portal-nav {
    grid-template-columns: auto 1fr;
    justify-items: center;
  }

  .portal-nav__brand {
    justify-self: start;
    grid-row: 1;
    grid-column: 1;
  }

  .portal-nav__headline {
    grid-row: 1;
    grid-column: 1 / -1;
    justify-self: center;
  }

  .portal-nav__balance {
    display: none;
  }

  .portal-category__grid {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }

  .portal-detail__grid {
    grid-template-columns: 1fr;
  }

  .portal-detail__actions {
    grid-template-columns: 1fr;
  }

  .portal-scroll__cell {
    width: 7rem;
  }

  .portal-scroll__img-wrap {
    height: 5.5rem;
  }
}
</style>
