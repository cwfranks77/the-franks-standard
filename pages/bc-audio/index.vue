<!--
CURSOR: STRICT MODE — B&C PERFORMANCE AUDIO standalone storefront.
Only this file. No Franks Standard / Zentraware / ZentraMesh branding.
-->
<template>
  <div class="page-root">
    <!-- Header / Brand Lock -->
    <header class="site-header">
      <div class="brand-block">
        <h1 class="brand-title">
          B&amp;C PERFORMANCE AUDIO
        </h1>
        <p class="brand-subtitle">
          Authorized Wholesale Distribution Hub
        </p>
        <p class="brand-hotline">
          Helpdesk Hotline: <span>1-866-319-8547</span>
        </p>
      </div>

      <!-- Top-right categorized expansion dropdown -->
      <div class="catalog-select-wrapper">
        <label class="catalog-label" for="catalog-select">
          Catalog
        </label>
        <select
          id="catalog-select"
          v-model="selectedProductId"
          class="catalog-select"
        >
          <option disabled value="">
            Browse wholesale catalog…
          </option>
          <optgroup
            v-for="(items, segment) in groupedProducts"
            :key="segment"
            :label="segment"
          >
            <option
              v-for="item in items"
              :key="getProductId(item)"
              :value="getProductId(item)"
            >
              {{ getProductName(item) }}
            </option>
          </optgroup>
        </select>
      </div>
    </header>

    <!-- Main content -->
    <main class="page-main">
      <!-- Showroom mode -->
      <section v-if="isShowroom" class="showroom-grid">
        <article class="showroom-tile">
          <div class="tile-icon">💻</div>
          <h2 class="tile-title">
            Computers &amp; Enterprise Workstations
          </h2>
          <p class="tile-body">
            Precision-engineered systems for mission-critical workloads, secure deployments, and high-throughput creative pipelines.
          </p>
        </article>

        <article class="showroom-tile">
          <div class="tile-icon">📺</div>
          <h2 class="tile-title">
            Premium Home Theater &amp; Audio
          </h2>
          <p class="tile-body">
            Reference-grade sound stages, cinema-calibrated amplification, and immersive listening rooms tuned for pure fidelity.
          </p>
        </article>

        <article class="showroom-tile">
          <div class="tile-icon">⚓</div>
          <h2 class="tile-title">
            Element-Proof Marine Sound Systems
          </h2>
          <p class="tile-body">
            Salt, spray, and sun–certified audio arrays built to survive open-water abuse without sacrificing clarity or punch.
          </p>
        </article>
      </section>

      <!-- Detail view mode -->
      <section v-else class="detail-view">
        <header class="detail-header">
          <button class="back-link" type="button" @click="resetSelection">
            ← Back to Genesis Showroom
          </button>
          <h2 class="detail-title">
            {{ getProductName(selectedProduct) }}
          </h2>
        </header>

        <div class="detail-layout">
          <!-- Image placeholder / icon matrix -->
          <div class="detail-media">
            <div class="media-frame">
              <div class="media-label">
                ✓ AUTHORIZED WHOLESALE PICTURE ASSET MATRIX
              </div>

              <div v-if="getProductImage(selectedProduct)" class="media-image-wrap">
                <img
                  :src="getProductImage(selectedProduct)"
                  :alt="getProductName(selectedProduct)"
                  class="media-image"
                  loading="lazy"
                >
              </div>
              <div v-else class="media-icon">
                {{ getIconForProduct(selectedProduct) }}
              </div>
            </div>
          </div>

          <!-- Product data deck -->
          <div class="detail-body">
            <dl class="detail-meta">
              <div class="meta-row">
                <dt>Model SKU</dt>
                <dd>{{ getProductSku(selectedProduct) }}</dd>
              </div>
              <div class="meta-row">
                <dt>Brand</dt>
                <dd>{{ getProductBrand(selectedProduct) }}</dd>
              </div>
              <div class="meta-row">
                <dt>Segment</dt>
                <dd>{{ getProductSegment(selectedProduct) }}</dd>
              </div>
              <div class="meta-row">
                <dt>Price</dt>
                <dd>{{ getProductPrice(selectedProduct) }}</dd>
              </div>
              <div class="meta-row">
                <dt>Availability</dt>
                <dd>{{ getProductAvailability(selectedProduct) }}</dd>
              </div>
            </dl>

            <section class="detail-specs">
              <h3>Technical Specifications</h3>
              <p>
                {{ getProductDescription(selectedProduct) }}
              </p>
            </section>

            <section class="detail-actions">
              <button
                type="button"
                class="btn btn-cart"
                @click="handleAddToCart(selectedProduct)"
              >
                Add to Cart
              </button>
              <button
                type="button"
                class="btn btn-buy"
                :disabled="checkoutBusy"
                @click="handleStripeExpress(selectedProduct)"
              >
                {{ checkoutBusy ? 'Starting checkout…' : 'Buy Now (Stripe Express)' }}
              </button>
            </section>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from '#app'

const selectedProductId = ref<string>('')
const { addItem, itemCount } = useCart()
const checkoutBusy = ref(false)

async function createBcLiveCheckout (body: Record<string, unknown>) {
  try {
    return await $fetch('/api/checkout/live-split-payment', { method: 'POST', body })
  } catch {
    const config = useRuntimeConfig()
    const supabaseUrl = String(config.public.supabaseUrl || '').replace(/\/$/, '')
    const supabaseKey = String(config.public.supabaseKey || '')
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

// Load live Petra catalog JSON from your site runtime:
// https://www.bcpoweraudio.com/catalog/petra-products.json
const { data: productsData } = await useFetch('/catalog/petra-products.json')

// Normalize products safely
const products = computed<any[]>(() => {
  const raw = productsData.value
  if (Array.isArray(raw)) return raw
  if (Array.isArray((raw as any)?.products)) return (raw as any).products
  if (Array.isArray((raw as any)?.items)) return (raw as any).items
  return []
})

const getProductId = (product: any) => {
  if (!product) return ''
  return (
    product.id ||
    product.sku ||
    product.vendorSku ||
    product.code ||
    product.slug ||
    product.name ||
    product.title ||
    JSON.stringify(product)
  )
}

const getProductName = (product: any) => {
  if (!product) return 'Unnamed product'
  return product.name || product.title || 'Unnamed product'
}

const getProductSku = (product: any) => {
  if (!product) return 'N/A'
  return product.sku || product.vendorSku || 'N/A'
}

const getProductBrand = (product: any) => {
  if (!product) return 'Unbranded'
  return product.brand || 'Unbranded'
}

const getProductSegment = (product: any) => {
  if (!product) return 'Uncategorized'
  return product.category || product.productClass || 'Uncategorized'
}

const getProductDescription = (product: any) => {
  if (!product) return 'No specifications available.'
  return (
    product.description ||
    product.longDesc ||
    product.specs ||
    'No specifications available.'
  )
}

// Only show customer-facing price (no wholesale/MSRP/MAP)
const getProductPrice = (product: any) => {
  if (!product) return 'Contact for pricing'
  const raw = product.price
  if (raw == null || raw === '') return 'Contact for pricing'
  const numeric = Number(raw)
  if (Number.isNaN(numeric)) return String(raw)
  return `$${numeric.toFixed(2)}`
}

const getProductAvailability = (product: any) => {
  if (!product) return 'Unknown'
  if (product.inStock === true) return 'In stock'
  if (product.inStock === false) return 'Out of stock'
  if (typeof product.available === 'number') {
    return product.available > 0 ? `In stock (${product.available})` : 'Out of stock'
  }
  return 'Check availability'
}

// Image helper: use image field or Petra CDN fallback
const getProductImage = (product: any) => {
  if (!product) return ''
  if (product.image && typeof product.image === 'string') {
    return product.image.replace('http://', 'https://')
  }
  if (product.sku) {
    return `https://petraimages.com.s3.amazonaws.com/600x600/${String(
      product.sku
    ).toUpperCase()}.jpg`
  }
  return ''
}

// Group products by category for <optgroup>
const groupedProducts = computed<Record<string, any[]>>(() => {
  const groups: Record<string, any[]> = {}
  for (const p of products.value) {
    const segment = getProductSegment(p)
    if (!groups[segment]) groups[segment] = []
    groups[segment].push(p)
  }
  return groups
})

const selectedProduct = computed<any | null>(
  () =>
    products.value.find((p) => getProductId(p) === selectedProductId.value) ||
    null
)

const isShowroom = computed<boolean>(() => !selectedProduct.value)

// Icon placeholder based on niche
const getIconForProduct = (product: any) => {
  const segment = getProductSegment(product).toLowerCase()
  if (
    segment.includes('computer') ||
    segment.includes('workstation') ||
    segment.includes('server') ||
    segment.includes('laptop')
  ) {
    return '💻'
  }
  if (
    segment.includes('theater') ||
    segment.includes('audio') ||
    segment.includes('speaker') ||
    segment.includes('home') ||
    segment.includes('cinema')
  ) {
    return '📺'
  }
  if (
    segment.includes('marine') ||
    segment.includes('boat') ||
    segment.includes('water') ||
    segment.includes('offshore')
  ) {
    return '⚓'
  }
  return '🛒'
}

const handleAddToCart = (product: any) => {
  if (!product) return
  const price = Number(product.price)
  if (!Number.isFinite(price) || price <= 0) {
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
  if (!product || checkoutBusy.value) return
  const retailPrice = Number(product.price)
  if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
    alert('Contact helpdesk for pricing on this item.')
    return
  }

  const customerEmail = window.prompt('Email for your receipt:')?.trim()
  if (!customerEmail) return

  const customerZip = window.prompt('Shipping ZIP code:', '70801')?.trim() || '70801'
  const customerName = window.prompt('Ship to name:', 'Wholesale Buyer')?.trim() || 'Wholesale Buyer'

  checkoutBusy.value = true
  try {
    const wholesaleCost = Math.round(retailPrice * 0.7 * 100) / 100
    const checkout = await createBcLiveCheckout({
      productId: getProductId(product),
      productName: getProductName(product),
      productSku: getProductSku(product),
      customerEmail,
      customerZip,
      shippingAddress: `${customerName} — B&C wholesale order`,
      retailPrice,
      wholesaleCost,
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
  }
}

const resetSelection = () => {
  selectedProductId.value = ''
}
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top left, #1f2933 0, #020617 55%, #000 100%);
  color: #f9fafb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text',
    'Segoe UI', sans-serif;
}

/* Header */
.site-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.75rem 2.5rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  backdrop-filter: blur(18px);
  background: linear-gradient(
    to right,
    rgba(15, 23, 42, 0.96),
    rgba(15, 23, 42, 0.88)
  );
}

.brand-block {
  max-width: 32rem;
}

.brand-title {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e5e7eb;
}

.brand-subtitle {
  margin: 0.25rem 0 0.35rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9ca3af;
}

.brand-hotline {
  margin: 0;
  font-size: 0.85rem;
  color: #e5e7eb;
}

.brand-hotline span {
  font-weight: 600;
  color: #f97316;
}

/* Catalog select */
.catalog-select-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.catalog-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9ca3af;
}

.catalog-select {
  min-width: 16rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.96);
  color: #e5e7eb;
  font-size: 0.9rem;
  outline: none;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #e5e7eb 50%),
    linear-gradient(135deg, #e5e7eb 50%, transparent 50%);
  background-position: calc(100% - 14px) calc(50% - 3px),
    calc(100% - 9px) calc(50% - 3px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.catalog-select:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.6);
}

/* Main */
.page-main {
  flex: 1;
  padding: 2.5rem 2.5rem 3rem;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

/* Showroom */
.showroom-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.75rem;
  max-width: 72rem;
  width: 100%;
}

.showroom-tile {
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  background: radial-gradient(circle at top, #111827, #020617);
  border: 1px solid rgba(148, 163, 184, 0.45);
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.9);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tile-icon {
  font-size: 2.2rem;
  margin-bottom: 0.25rem;
}

.tile-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e5e7eb;
}

.tile-body {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #9ca3af;
}

/* Detail view */
.detail-view {
  max-width: 72rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.back-link {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}

.back-link:hover {
  color: #e5e7eb;
}

.detail-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #f9fafb;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.6fr);
  gap: 2rem;
}

/* Media placeholder */
.detail-media {
  display: flex;
  align-items: stretch;
}

.media-frame {
  border-radius: 1.25rem;
  border: 1px dashed rgba(148, 163, 184, 0.9);
  background: radial-gradient(circle at top, #020617, #020617 40%, #000 100%);
  padding: 1.25rem 1rem 1.75rem;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.media-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 1.25rem;
}

.media-image-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-image {
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: 0.75rem;
  background: #020617;
}

.media-icon {
  font-size: 4rem;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Detail body */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-meta {
  margin: 0;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}

.meta-row dt {
  color: #9ca3af;
}

.meta-row dd {
  margin: 0;
  color: #e5e7eb;
  font-weight: 500;
}

.detail-specs h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #e5e7eb;
}

.detail-specs p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #d1d5db;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease,
    border-color 0.15s ease, transform 0.05s ease;
}

.btn-cart {
  background: #e5e7eb;
  color: #020617;
}

.btn-cart:hover {
  background: #f9fafb;
  transform: translateY(-1px);
}

.btn-buy {
  background: #f97316;
  color: #111827;
}

.btn-buy:hover {
  background: #fb923c;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .showroom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .site-header {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem 1.25rem 1rem;
  }

  .page-main {
    padding: 1.5rem 1.25rem 2.25rem;
  }

  .showroom-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .catalog-select-wrapper {
    align-items: flex-start;
  }

  .catalog-select {
    min-width: 0;
    width: 100%;
  }
}
</style>
