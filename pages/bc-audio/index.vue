<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'
import { BC_SEO_KEYWORDS, bcStoreJsonLd } from '~/utils/bcSeo.js'
import metaConfig from '~/content/meta-config.json'
definePageMeta({ layout: 'bc-audio' })

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))

const { data: bcSiteContent } = await useAsyncData('bc-site-meta', () =>
  $fetch('/api/public/site-content', { query: { keys: 'bcMeta' } }).catch(() => ({ bcMeta: null })),
)
const pageMeta = computed(() => ({
  ...metaConfig,
  ...(bcSiteContent.value?.bcMeta || {}),
}))

const { megastoreItems, pending: catalogPending } = useBcProductCatalog()

const ownerName = computed(() => support.value.ownerName)

const brandsCarried = [
  { name: 'Kicker', series: 'SoloBaric L7X' },
  { name: 'Rockford Fosgate', series: 'Punch Power' },
  { name: 'AudioControl', series: 'Epicenter Matrix' },
  { name: 'Skar Audio', series: 'EVL Competition' },
  { name: 'JL Audio', series: 'W7 Anniversary' },
]

const selectedProduct = ref(null)
const route = useRoute()
const checkoutCancelled = computed(() => route.query.cancelled === '1')

const { data: dropshipData } = await useFetch('/api/public/dropship-catalog', {
  query: { storeId: 'bc-performance-audio' },
})

const storeLive = computed(() => dropshipData.value?.store?.is_live !== false && !dropshipData.value?.offline)
const storeName = computed(() => dropshipData.value?.store?.name || BC_BRAND.full)
const heroEyebrow = computed(() => dropshipData.value?.store?.hero_json?.eyebrow || `Independent merchant store · ${BC_BRAND.full}`)
const heroSlogan = computed(() => dropshipData.value?.store?.hero_json?.slogan || dropshipData.value?.store?.tagline || BC_BRAND.tagline)
const catalogItems = computed(() => {
  const api = dropshipData.value?.items || []
  const merged = new Map(megastoreItems.map((i) => [i.id, i]))
  for (const item of api) merged.set(item.id, item)
  return [...merged.values()]
})

function onSelectProduct (item) {
  selectedProduct.value = item
}

const siteUrl = computed(() => String(config.public.siteUrl || metaConfig.url).replace(/\/$/, ''))

function applyPickFromQuery () {
  const pick = String(route.query.pick || '')
  if (!pick) return
  const item = catalogItems.value.find((i) => String(i.id) === pick)
  if (item) selectedProduct.value = item
}

onMounted(applyPickFromQuery)
watch(() => route.query.pick, applyPickFromQuery)

useHead(() => ({
  title: pageMeta.value.title,
  meta: [
    { name: 'description', content: pageMeta.value.description },
    { name: 'keywords', content: BC_SEO_KEYWORDS },
    { name: 'robots', content: 'index, follow' },
    { name: 'googlebot', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: metaConfig.url },
    { property: 'og:title', content: pageMeta.value.title },
    { property: 'og:description', content: pageMeta.value.description },
    { property: 'og:image', content: pageMeta.value.image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: metaConfig.url },
    { name: 'twitter:title', content: pageMeta.value.title },
    { name: 'twitter:description', content: pageMeta.value.description },
    { name: 'twitter:image', content: pageMeta.value.image },
  ],
  link: [{ rel: 'canonical', href: metaConfig.url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify(bcStoreJsonLd(siteUrl.value, catalogItems.value, support.value.phoneTel)),
  }],
}))
</script>

<template>
  <div class="bc-shop">
    <section v-if="!storeLive" class="bc-shop-offline">
      <div class="bc-shop-offline__inner">
        <h1>{{ storeName }} is temporarily offline</h1>
        <p>Check back soon.</p>
      </div>
    </section>

    <template v-else>
      <section class="bc-shop-hero">
        <div class="bc-shop-hero__glow" aria-hidden="true" />
        <div class="bc-shop-hero__inner">
          <p class="bc-shop-hero__eyebrow">{{ heroEyebrow }}</p>
          <h1 class="bc-shop-hero__title">
            <span class="bc-shop-hero__brand">{{ storeName.includes('&') ? storeName.split(' ')[0] : BC_BRAND.short }}</span>
            <span class="bc-shop-hero__accent">Performance Audio</span>
          </h1>
          <p class="bc-shop-hero__slogan">{{ heroSlogan }}</p>
          <p class="bc-shop-hero__parent">
            A proud division of {{ pageMeta.parentCompany }} ·
            <span class="bc-shop-hero__trust">Authorized Factory Direct Dealer</span>
          </p>
        </div>
      </section>

      <section class="bc-shop-brands" aria-label="Authorized brands">
        <div class="bc-shop-brands__row">
          <div v-for="brand in brandsCarried" :key="brand.name" class="bc-shop-brands__node">
            <p class="bc-shop-brands__name">{{ brand.name }}</p>
            <p class="bc-shop-brands__series">{{ brand.series }}</p>
          </div>
        </div>
      </section>

      <section v-if="checkoutCancelled" class="bc-shop-cancelled" role="status">
        <p>Checkout was cancelled. Your card was not charged — select a product and try again.</p>
      </section>

      <section class="bc-shop-split" aria-label="Catalog and dropship order">
        <div class="bc-shop-split__inner">
          <p v-if="catalogPending" class="bc-shop-catalog-loading">Loading product catalog…</p>
          <BcProductCatalogGrid
            v-else
            :catalogs="[catalogItems]"
            :selected-id="selectedProduct?.id ?? null"
            @select="onSelectProduct"
          />
          <BcDropshipOrderForm :product="selectedProduct" />
        </div>
      </section>

      <footer class="bc-shop-footer">
        <div class="bc-shop-footer__grid">
          <div>
            <p class="bc-shop-footer__brand">{{ storeName }}</p>
            <p class="bc-shop-footer__meta">Operator: {{ ownerName }}</p>
          </div>
          <div>
            <p class="bc-shop-footer__label">Central support</p>
            <p class="bc-shop-footer__phone">
              <a :href="`tel:${support.phoneTel}`">{{ support.phoneDisplay }}</a>
              · <NuxtLink to="/bc-audio/open-door">Open Door</NuxtLink>
            </p>
          </div>
        </div>
        <p class="bc-shop-footer__copy">&copy; 2026 {{ storeName }} · Independent merchant storefront</p>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.bc-shop { background: #0a0a0c; color: #f5f5f7; }
.bc-shop-catalog-loading {
  padding: 2rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
}
.bc-shop-offline {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}
.bc-shop-offline__inner h1 { margin: 0 0 12px; }
.bc-shop-offline__inner p { color: #9ca3af; margin: 0 0 20px; }

.bc-shop-hero {
  position: relative;
  padding: 3rem 1.5rem 2.5rem;
  text-align: center;
  overflow: hidden;
}
.bc-shop-hero__glow {
  position: absolute;
  inset: -20% 0 0;
  background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(211, 47, 47, 0.28) 0%, transparent 65%);
  pointer-events: none;
}
.bc-shop-hero__inner { position: relative; max-width: 720px; margin: 0 auto; }
.bc-shop-hero__eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #ff5252;
  margin: 0 0 12px;
}
.bc-shop-hero__title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
  line-height: 1.05;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35em;
}
.bc-shop-hero__brand { color: #f5f5f7; }
.bc-shop-hero__accent {
  color: #d32f2f;
  text-shadow: 0 0 32px rgba(211, 47, 47, 0.5);
}
.bc-shop-hero__slogan {
  margin: 14px 0 0;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 700;
}
.bc-shop-hero__parent {
  margin: 10px 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  letter-spacing: 0.04em;
}
.bc-shop-hero__trust {
  color: #e8eaed;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.68rem;
}

.bc-shop-brands {
  border-top: 1px solid rgba(211, 47, 47, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
}
.bc-shop-brands__row {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  min-width: 560px;
}
.bc-shop-brands__node {
  flex: 1;
  text-align: center;
  padding: 0 0.75rem;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
}
.bc-shop-brands__name { font-size: 0.85rem; font-weight: 800; margin: 0; }
.bc-shop-brands__series { font-size: 0.65rem; color: #7a8190; margin: 4px 0 0; font-family: monospace; }

.bc-shop-cancelled {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.bc-shop-cancelled p {
  margin: 0 0 1rem;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.35);
  color: #fcd34d;
  font-size: 0.85rem;
  text-align: center;
}

.bc-shop-split {
  padding: 2rem 1.5rem 3rem;
  background: linear-gradient(180deg, #0a0a0c 0%, #121216 100%);
}
.bc-shop-split__inner {
  max-width: 80rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (min-width: 1024px) {
  .bc-shop-split__inner {
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 2rem;
  }
}

.bc-shop-footer {
  margin-top: 0;
  padding: 2.5rem 1.5rem;
  border-top: 1px solid rgba(211, 47, 47, 0.15);
  text-align: center;
  font-size: 0.75rem;
  color: #7a8190;
}
.bc-shop-footer__grid {
  max-width: 64rem;
  margin: 0 auto 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
}
@media (min-width: 768px) {
  .bc-shop-footer__grid { flex-direction: row; text-align: left; }
}
.bc-shop-footer__brand { font-weight: 800; color: #e5e5e5; margin: 0; }
.bc-shop-footer__meta { margin: 4px 0 0; }
.bc-shop-footer__label { font-weight: 800; color: #f5f5f7; margin: 0; }
.bc-shop-footer__phone { margin: 4px 0 0; color: #ff5252; }
.bc-shop-footer__copy { margin: 0; color: #52525b; }
</style>
