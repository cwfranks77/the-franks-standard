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
const route = useRoute()
const selectedProduct = ref(null)
const checkoutCancelled = computed(() => route.query.cancelled === '1')
const { data: dropshipData } = useBcDropshipCatalog()

const storeLive = computed(() => dropshipData.value?.store?.is_live !== false && !dropshipData.value?.offline)
const storeName = computed(() => dropshipData.value?.store?.name || BC_BRAND.full)
const ownerName = computed(() => support.value.ownerName)

const catalogItems = computed(() => {
  const api = Array.isArray(dropshipData.value?.items) ? dropshipData.value.items : []
  const local = Array.isArray(megastoreItems.value) ? megastoreItems.value : []
  const merged = new Map(local.map((i) => [i.id, i]))
  for (const item of api) merged.set(item.id, item)
  return [...merged.values()]
})

const showroomDepts = [
  {
    icon: '💻',
    title: 'Computers & Enterprise Workstations',
    blurb: 'Factory-direct systems with high-memory configurations for continuous database and commercial workloads.',
    category: 'Computers & Computer Accessories',
    tone: 'indigo',
  },
  {
    icon: '📺',
    title: 'Premium Home Theater & Audio',
    blurb: 'Multi-channel receivers and acoustic arrays for residential and architectural sound enclosures.',
    category: 'Home Audio & Theater',
    tone: 'red',
  },
  {
    icon: '⚓',
    title: 'Marine & Powersports Sound',
    blurb: 'Weatherproof acoustic modules built for salt, spray, and UV exposure on open water.',
    category: 'Marine Electronics',
    tone: 'blue',
  },
]

const siteUrl = computed(() => String(config.public.siteUrl || metaConfig.url).replace(/\/$/, ''))

function deptCatalogLink (category) {
  return `/bc-audio/catalog?category=${encodeURIComponent(category)}`
}

function applyPickFromQuery () {
  const pick = String(route.query.pick || '')
  if (!pick) return
  const item = catalogItems.value.find((i) => String(i.id) === pick)
  if (item) {
    selectedProduct.value = item
    return
  }
  navigateTo(`/bc-audio/catalog?pick=${encodeURIComponent(pick)}`, { replace: true })
}

onMounted(applyPickFromQuery)
watch(() => route.query.pick, applyPickFromQuery)

useHead(() => ({
  title: pageMeta.value.title,
  meta: [
    { name: 'description', content: pageMeta.value.description },
    { name: 'keywords', content: BC_SEO_KEYWORDS },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: metaConfig.url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify(bcStoreJsonLd(siteUrl.value, catalogItems.value.slice(0, 50), support.value.phoneTel)),
  }],
}))
</script>

<template>
  <div class="bc-showroom">
    <div class="bc-showroom__ribbon" role="status">
      <span>A division of {{ pageMeta.parentCompany }}</span>
      <span class="bc-showroom__ribbon-tag">Authorized dealer network</span>
    </div>

    <section v-if="!storeLive" class="bc-showroom__offline">
      <h1>{{ storeName }} is temporarily offline</h1>
      <p>Check back soon or call {{ support.phoneDisplay }}.</p>
    </section>

    <template v-else>
      <section v-if="checkoutCancelled" class="bc-showroom__alert" role="status">
        Checkout was cancelled. Your card was not charged — pick a product from <strong>Products</strong> (top right).
      </section>

      <header class="bc-showroom__hero">
        <p class="bc-showroom__badge">Official dealer showroom</p>
        <h1 class="bc-showroom__title">Commercial technology &amp; competition-grade audio</h1>
        <p class="bc-showroom__lead">
          {{ catalogPending ? 'Loading catalog…' : `${catalogItems.length.toLocaleString()} wholesale SKUs` }}
          — use <strong>Products</strong> or <strong>Wholesale departments</strong> in the top-right menu. No full catalog dump on this page.
        </p>
        <div class="bc-showroom__hero-actions">
          <NuxtLink to="/bc-audio/catalog" class="bc-showroom__btn">Open full catalog</NuxtLink>
          <a :href="`tel:${support.phoneTel}`" class="bc-showroom__btn bc-showroom__btn--ghost">{{ support.phoneDisplay }}</a>
        </div>
      </header>

      <section class="bc-showroom__grid" aria-label="Wholesale department showcase">
        <article
          v-for="dept in showroomDepts"
          :key="dept.category"
          class="bc-showroom__card"
          :class="`bc-showroom__card--${dept.tone}`"
        >
          <div class="bc-showroom__card-visual" aria-hidden="true">
            <span class="bc-showroom__card-icon">{{ dept.icon }}</span>
          </div>
          <div class="bc-showroom__card-body">
            <h2 class="bc-showroom__card-title">{{ dept.title }}</h2>
            <p class="bc-showroom__card-blurb">{{ dept.blurb }}</p>
            <NuxtLink :to="deptCatalogLink(dept.category)" class="bc-showroom__card-link">
              Browse department →
            </NuxtLink>
          </div>
        </article>
      </section>

      <section v-if="selectedProduct" class="bc-showroom__order">
        <BcDropshipOrderForm :product="selectedProduct" />
      </section>

      <footer class="bc-showroom__footer">
        <p class="bc-showroom__footer-entity">{{ pageMeta.parentCompany }} — parent distribution</p>
        <p class="bc-showroom__footer-line">
          {{ storeName }} · Operator {{ ownerName }} ·
          <a :href="`tel:${support.phoneTel}`">{{ support.phoneDisplay }}</a>
          · <NuxtLink to="/bc-audio/open-door">Open Door</NuxtLink>
        </p>
        <p class="bc-showroom__copy">&copy; 2026 {{ storeName }}</p>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.bc-showroom {
  background: #0a0a0c;
  color: #f5f5f7;
  min-height: calc(100vh - 64px);
}
.bc-showroom__ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 8px 1.25rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(90deg, #4a0e0e 0%, #1a0a14 50%, #0f1020 100%);
  border-bottom: 1px solid rgba(211, 47, 47, 0.25);
}
.bc-showroom__ribbon-tag {
  color: #ffd814;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
}
.bc-showroom__offline {
  padding: 4rem 1.5rem;
  text-align: center;
}
.bc-showroom__alert {
  max-width: 48rem;
  margin: 1rem auto 0;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.35);
  color: #fcd34d;
  font-size: 0.85rem;
  text-align: center;
}
.bc-showroom__hero {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 1.5rem;
  text-align: center;
}
.bc-showroom__badge {
  display: inline-block;
  margin: 0;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: rgba(211, 47, 47, 0.12);
  color: #ff5252;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.bc-showroom__title {
  margin: 14px 0 0;
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  font-weight: 900;
  line-height: 1.15;
}
.bc-showroom__lead {
  margin: 12px 0 0;
  font-size: 0.92rem;
  color: #9ca3af;
  line-height: 1.55;
}
.bc-showroom__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 1.25rem;
}
.bc-showroom__btn {
  display: inline-block;
  padding: 11px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: #fff;
  border: 1px solid rgba(211, 47, 47, 0.55);
}
.bc-showroom__btn--ghost {
  background: transparent;
  color: #ff5252;
}
.bc-showroom__grid {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 1.5rem 2.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .bc-showroom__grid { grid-template-columns: repeat(3, 1fr); }
}
.bc-showroom__card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, #141418 0%, #0a0a0c 100%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  transition: border-color 0.15s;
}
.bc-showroom__card:hover { border-color: rgba(211, 47, 47, 0.35); }
.bc-showroom__card-visual {
  height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.bc-showroom__card--indigo .bc-showroom__card-visual {
  background: linear-gradient(135deg, #1e1b4b, #0f172a 60%, #0a0a0c);
}
.bc-showroom__card--red .bc-showroom__card-visual {
  background: linear-gradient(135deg, #450a0a, #1a0a0a 60%, #0a0a0c);
}
.bc-showroom__card--blue .bc-showroom__card-visual {
  background: linear-gradient(135deg, #172554, #0f172a 60%, #0a0a0c);
}
.bc-showroom__card-icon { font-size: 3rem; }
.bc-showroom__card-body {
  padding: 1.1rem 1.15rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.bc-showroom__card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}
.bc-showroom__card-blurb {
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: #9ca3af;
  line-height: 1.45;
}
.bc-showroom__card-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #ff5252;
  text-decoration: none;
}
.bc-showroom__card-link:hover { text-decoration: underline; }
.bc-showroom__order {
  max-width: 32rem;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
}
.bc-showroom__footer {
  padding: 2rem 1.5rem;
  border-top: 1px solid rgba(211, 47, 47, 0.15);
  text-align: center;
  font-size: 0.75rem;
  color: #7a8190;
}
.bc-showroom__footer-entity {
  margin: 0;
  font-weight: 800;
  color: #c4c7cf;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.bc-showroom__footer-line {
  margin: 8px 0 0;
}
.bc-showroom__footer-line a { color: #ff5252; text-decoration: none; }
.bc-showroom__copy { margin: 10px 0 0; color: #52525b; }
</style>
