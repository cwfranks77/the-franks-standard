<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'
import { BC_SEO_KEYWORDS } from '~/utils/bcSeo.js'

definePageMeta({ layout: 'bc-audio' })

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))
const route = useRoute()

const { megastoreItems, pending: catalogPending, error: catalogError, refresh: refreshCatalog } = useBcProductCatalog()
const { data: dropshipData } = useBcDropshipCatalog()

const catalogItems = computed(() => {
  const api = Array.isArray(dropshipData.value?.items) ? dropshipData.value.items : []
  const local = Array.isArray(megastoreItems.value) ? megastoreItems.value : []
  const merged = new Map(local.map((i) => [i.id, i]))
  for (const item of api) merged.set(item.id, item)
  return [...merged.values()]
})

const initialCategory = computed(() => String(route.query.category || ''))
const selectedProduct = ref(null)

function onSelectProduct (item) {
  selectedProduct.value = item
}

function applyPickFromQuery () {
  const pick = String(route.query.pick || '')
  if (!pick) return
  const item = catalogItems.value.find((i) => String(i.id) === pick)
  if (item) selectedProduct.value = item
}

onMounted(() => {
  refreshCatalog()
  applyPickFromQuery()
})
watch(() => route.query.pick, applyPickFromQuery)

useHead(() => ({
  title: `Product catalog · ${BC_BRAND.full}`,
  meta: [
    { name: 'description', content: `Browse ${catalogItems.value.length.toLocaleString()} competition audio and dropship products from ${BC_BRAND.full}.` },
    { name: 'keywords', content: BC_SEO_KEYWORDS },
  ],
}))
</script>

<template>
  <div class="bc-catalog-page">
    <header class="bc-catalog-page__head">
      <p class="bc-catalog-page__eyebrow">{{ BC_BRAND.short }} dropship</p>
      <h1 class="bc-catalog-page__title">Product catalog</h1>
      <p class="bc-catalog-page__sub">
        Pick a unit from the grid — checkout form stays on the right.
        <NuxtLink to="/bc-audio" class="bc-catalog-page__home">← Store home</NuxtLink>
      </p>
    </header>

    <section class="bc-catalog-page__split" aria-label="Catalog and order">
      <div class="bc-catalog-page__split-inner">
        <p v-if="catalogPending" class="bc-catalog-page__loading">Loading product catalog…</p>
        <div v-else-if="catalogError" class="bc-catalog-page__error" role="alert">
          <p>Catalog could not load. Check your connection or call {{ support.phoneDisplay }}.</p>
          <button type="button" class="bc-catalog-page__retry" @click="refreshCatalog">Try again</button>
        </div>
        <BcProductCatalogGrid
          v-else-if="catalogItems.length"
          :catalogs="[catalogItems]"
          :selected-id="selectedProduct?.id ?? null"
          :initial-category="initialCategory"
          @select="onSelectProduct"
        />
        <BcDropshipOrderForm :product="selectedProduct" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.bc-catalog-page {
  background: #0a0a0c;
  color: #f5f5f7;
  min-height: calc(100vh - 64px);
}
.bc-catalog-page__head {
  padding: 1.75rem 1.5rem 0;
  max-width: 80rem;
  margin: 0 auto;
}
.bc-catalog-page__eyebrow {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #ff5252;
}
.bc-catalog-page__title {
  margin: 8px 0 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
}
.bc-catalog-page__sub {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: #9ca3af;
}
.bc-catalog-page__home {
  color: #ff5252;
  font-weight: 700;
  text-decoration: none;
  margin-left: 0.5rem;
}
.bc-catalog-page__home:hover { text-decoration: underline; }
.bc-catalog-page__split {
  padding: 1.5rem 1.5rem 3rem;
}
.bc-catalog-page__split-inner {
  max-width: 80rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (min-width: 1024px) {
  .bc-catalog-page__split-inner {
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 2rem;
  }
}
.bc-catalog-page__loading,
.bc-catalog-page__error {
  padding: 1.25rem;
  text-align: center;
  border-radius: 10px;
  font-size: 0.95rem;
}
.bc-catalog-page__loading {
  color: #9ca3af;
}
.bc-catalog-page__error {
  color: #fecaca;
  background: rgba(127, 29, 29, 0.35);
  border: 1px solid rgba(211, 47, 47, 0.45);
}
.bc-catalog-page__error p { margin: 0 0 10px; }
.bc-catalog-page__retry {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(211, 47, 47, 0.5);
  background: rgba(211, 47, 47, 0.15);
  color: #ff5252;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
</style>
