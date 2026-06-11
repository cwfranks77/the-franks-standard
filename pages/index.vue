<template>
  <div class="portal-root bc-audio-theme">
    <div class="portal-ribbon">
      <span class="portal-ribbon__left">🔊 B&amp;C PERFORMANCE AUDIO — AUTHORIZED DISTRIBUTION CENTER</span>
      <span class="portal-ribbon__right">Sovereign Dealer Network</span>
    </div>

    <nav class="portal-nav">
      <div class="portal-nav__brand">
        <div class="portal-nav__logo">B&amp;C</div>
        <div>
          <h1 class="portal-nav__title">B&amp;C PERFORMANCE AUDIO</h1>
          <p class="portal-nav__subtitle">Enterprise Systems Portal</p>
        </div>
      </div>

      <div class="portal-nav__gate">
        <select
          v-model="selectedSku"
          class="portal-nav__select"
          @change="handleMenuSelection"
        >
          <option value="none">📂 WHOLESALE CATALOG DEPARTMENTS...</option>
          <optgroup label="💻 COMPUTERS &amp; WORKSTATIONS">
            <option value="PETRA-AS-PRO64">🔴 Enterprise Pro Workstation Laptop (64GB RAM)</option>
          </optgroup>
          <optgroup label="📺 HOME THEATER &amp; AUDIO">
            <option value="PETRA-DEN-4K9CH">🔴 Audiophile 4K Surround Sound Receiver</option>
          </optgroup>
          <optgroup label="⚓ MARINE &amp; POWERSPORTS">
            <option value="PETRA-KM-MAR65">🔴 High-Output Element-Proof 6.5&quot; Speakers</option>
          </optgroup>
        </select>
        <a href="tel:1-866-319-8547" class="portal-nav__phone">1-866-319-8547</a>
      </div>
    </nav>

    <main class="portal-main">
      <!-- SHOWROOM: cleared canvas + faded guide grid only -->
      <div v-if="viewMode === 'showroom'" class="portal-fade">
        <div class="portal-hero">
          <span class="portal-hero__eyebrow">Official Dealer Grid</span>
          <h2 class="portal-hero__title">Authorized Dealer Distribution Network</h2>
          <p class="portal-hero__lede">
            Please expand the top-right wholesale department menu folder selector to call up official inventory lines.
            All content fields remain hidden on the homepage canvas until an item is explicitly chosen.
          </p>
        </div>

        <section class="portal-guide" aria-hidden="true">
          <article class="portal-guide__tile">
            <div class="portal-guide__visual"><span>💻</span></div>
            <h3>Computers &amp; Workstations</h3>
          </article>
          <article class="portal-guide__tile">
            <div class="portal-guide__visual"><span>📺</span></div>
            <h3>Home Theater Audio</h3>
          </article>
          <article class="portal-guide__tile">
            <div class="portal-guide__visual"><span>⚓</span></div>
            <h3>Marine Sound Systems</h3>
          </article>
        </section>
      </div>

      <!-- DETAIL: revealed only after dropdown selection -->
      <div v-else class="portal-detail portal-fade">
        <button type="button" class="portal-detail__back" @click="resetToHome">
          ← Return to Master Showroom
        </button>

        <article v-if="currentProduct" class="portal-detail__card">
          <div class="portal-detail__grid">
            <div class="portal-detail__media">
              <div class="portal-detail__media-overlay" />
              <span class="portal-detail__icon">{{ currentProduct.icon }}</span>
              <div class="portal-detail__media-badge">
                <p>✓ AUTHORIZED RETAIL MANIFEST ASSET</p>
              </div>
            </div>

            <div class="portal-detail__body">
              <span class="portal-detail__dept">{{ currentProduct.category }}</span>
              <h2 class="portal-detail__name">{{ currentProduct.name }}</h2>
              <p class="portal-detail__sku">MODEL SKU: {{ currentProduct.sku }}</p>

              <div class="portal-detail__desc">
                <p>{{ currentProduct.description }}</p>
              </div>

              <div class="portal-detail__price-row">
                <span class="portal-detail__price-label">MSRP / Retail Price</span>
                <span class="portal-detail__price">${{ currentProduct.price }}</span>
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
      <p>B&amp;C Performance Audio — Authorized Distribution Hub</p>
    </footer>
  </div>
</template>

<script setup>
const viewMode = ref('showroom')
const selectedSku = ref('none')
const checkoutBusy = ref(false)

const productCatalog = {
  'PETRA-AS-PRO64': {
    sku: 'PETRA-AS-PRO64',
    name: 'Enterprise Pro Workstation Laptop (64GB RAM)',
    category: 'Computers & Workstations',
    icon: '💻',
    price: '2,023.65',
    priceNum: 2023.65,
    description:
      'High-capacity technical laptop packed with 64GB DDR5 unthrottled memory, 2TB NVMe solid-state storage, and an advanced multi-core processing layout. Optimized for developer compilation engines, heavy server database executions, and complex script execution workloads.',
  },
  'PETRA-DEN-4K9CH': {
    sku: 'PETRA-DEN-4K9CH',
    name: 'Audiophile 4K Surround Sound Receiver',
    category: 'Home Theater & Audio',
    icon: '📺',
    price: '1,394.45',
    priceNum: 1394.45,
    description:
      'Premium high-fidelity 9.2 channel surround sound home theater distribution receiver. Features intelligent continuous power management units to deliver crisp, un-distorted acoustic frequency control arrays across custom residential and sanctuary audio speaker fields.',
  },
  'PETRA-KM-MAR65': {
    sku: 'PETRA-KM-MAR65',
    name: 'High-Output Element-Proof 6.5" Marine Audio Speakers',
    category: 'Marine & Powersports',
    icon: '⚓',
    price: '411.35',
    priceNum: 411.35,
    description:
      'Heavy-duty weatherized 6.5 inch dual cone marine acoustics sound array. Engineered with composite injection cones and protective structural thresholds meeting strict salt-fog and UV treatment parameters to eliminate data degradation on open waters.',
  },
}

const currentProduct = computed(() => productCatalog[selectedSku.value] || null)

function handleMenuSelection () {
  if (selectedSku.value === 'none' || !selectedSku.value) {
    resetToHome()
    return
  }
  if (productCatalog[selectedSku.value]) {
    viewMode.value = 'detail'
  }
}

function resetToHome () {
  selectedSku.value = 'none'
  viewMode.value = 'showroom'
}

const { addItem, itemCount } = useCart()

function handleAddToCart () {
  const product = currentProduct.value
  if (!product) return
  addItem({
    id: product.sku,
    name: product.name,
    sku: product.sku,
    price: product.priceNum,
  })
  alert(`Added "${product.name}" to cart. (${itemCount.value} item${itemCount.value === 1 ? '' : 's'} total)`)
}

async function handleBuyNow () {
  const product = currentProduct.value
  if (!product || checkoutBusy.value) return

  const customerEmail = window.prompt('Email for your receipt:')?.trim()
  if (!customerEmail) return

  const customerZip = window.prompt('Shipping ZIP code:', '70801')?.trim() || '70801'
  const customerName = window.prompt('Ship to name:', 'Wholesale Buyer')?.trim() || 'Wholesale Buyer'

  checkoutBusy.value = true
  try {
    const config = useRuntimeConfig()
    const retailPrice = product.priceNum
    const wholesaleCost = Math.round(retailPrice * 0.7 * 100) / 100
    const body = {
      productId: product.sku,
      productName: product.name,
      productSku: product.sku,
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
      const supabaseUrl = String(config.public.supabase?.url || '').replace(/\/$/, '')
      const supabaseKey = String(config.public.supabase?.key || '')
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
  padding: 0.5rem 1.5rem;
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
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--portal-bg);
}

.portal-nav__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.portal-nav__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.72rem;
  color: #fff;
  background: linear-gradient(135deg, var(--portal-red) 0%, var(--portal-charcoal) 100%);
  border: 1px solid rgba(211, 47, 47, 0.35);
  box-shadow: 0 4px 14px rgba(211, 47, 47, 0.25);
}

.portal-nav__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
}

.portal-nav__subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.62rem;
  color: var(--portal-red-bright);
  font-weight: 700;
}

.portal-nav__gate {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.portal-nav__select {
  min-width: 16rem;
  max-width: 24rem;
  padding: 0.65rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: var(--portal-charcoal);
  color: var(--portal-ink);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.portal-nav__select:focus {
  outline: none;
  border-color: var(--portal-red);
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.25);
}

.portal-nav__phone {
  display: none;
  padding: 0.55rem 0.85rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--portal-red-bright);
  font-size: 0.75rem;
  font-weight: 800;
  font-family: ui-monospace, monospace;
  text-decoration: none;
  white-space: nowrap;
}

.portal-nav__phone:hover {
  background: rgba(255, 255, 255, 0.08);
}

@media (min-width: 768px) {
  .portal-nav__phone {
    display: inline-block;
  }
}

.portal-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.portal-hero {
  text-align: center;
  max-width: 42rem;
  margin: 0 auto 4rem;
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

.portal-guide {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  opacity: 0.4;
  pointer-events: none;
}

.portal-guide__tile {
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #171717 0%, var(--portal-bg) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 2px solid #262626;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.portal-guide__visual {
  height: 12rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border-radius: 0.85rem;
  background: var(--portal-bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.portal-guide__visual span {
  font-size: 3rem;
}

.portal-guide__tile h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #737373;
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

.portal-detail__media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(1px);
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
  z-index: 1;
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

.portal-fade {
  animation: portalFade 0.3s ease-in-out forwards;
}

@keyframes portalFade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .portal-guide {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .portal-ribbon__right {
    display: none;
  }

  .portal-nav__select {
    width: 100%;
    max-width: none;
  }

  .portal-detail__grid {
    grid-template-columns: 1fr;
  }

  .portal-detail__actions {
    grid-template-columns: 1fr;
  }
}
</style>
