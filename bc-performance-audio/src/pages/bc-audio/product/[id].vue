<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { bcProductJsonLd, bcProductSeoTitle, BC_SEO_KEYWORDS } from '~/utils/bcSeo.js'
definePageMeta({ layout: 'bc-audio' })

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = computed(() => String(config.public.siteUrl || 'https://www.bcpoweraudio.com').replace(/\/$/, ''))

const { data: dropshipData } = useBcDropshipCatalog()

const { findProduct, pending: catalogPending } = useBcProductCatalog()

const productId = computed(() => String(route.params.id || ''))

const catalogItem = computed(() => {
  const fromApi = (dropshipData.value?.items || []).find((i) => String(i.id) === productId.value)
  if (fromApi) return fromApi
  return findProduct(productId.value)
})

watch([catalogItem, catalogPending], () => {
  if (catalogPending.value) return
  if (catalogItem.value) return
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}, { immediate: true })

const buyUrl = computed(() => `/bc-audio/catalog?pick=${encodeURIComponent(productId.value)}`)

const { addItem, hasItem } = useCart()
const justAdded = ref(false)
let addedTimer = null

const showGoToCart = computed(() => {
  if (!catalogItem.value) return false
  return justAdded.value || hasItem(productId.value)
})

function handleAddToCart () {
  const item = catalogItem.value
  if (!item) return
  const price = Number(item.retailPrice ?? item.price)
  if (!Number.isFinite(price) || price <= 0) return
  addItem({
    id: productId.value,
    name: item.name,
    sku: item.sku || productId.value,
    price,
    image: item.image || undefined,
  })
  justAdded.value = true
  if (addedTimer) clearTimeout(addedTimer)
  addedTimer = setTimeout(() => { justAdded.value = false }, 8000)
}

useSeoMeta({
  title: () => (catalogItem.value ? bcProductSeoTitle(catalogItem.value.name) : 'Product'),
  description: () => catalogItem.value?.tagline || catalogItem.value?.description || `${BC_BRAND.full} competition car audio.`,
  keywords: BC_SEO_KEYWORDS,
  robots: 'index, follow',
  ogTitle: () => (catalogItem.value ? bcProductSeoTitle(catalogItem.value.name) : BC_BRAND.full),
  ogDescription: () => catalogItem.value?.tagline || catalogItem.value?.description,
  ogImage: () => bcProductImageSrc(catalogItem.value?.image, siteUrl.value),
})

useHead(() => ({
  link: [{ rel: 'canonical', href: `${siteUrl.value}/bc-audio/product/${productId.value}` }],
  script: catalogItem.value ? [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify(bcProductJsonLd(siteUrl.value, catalogItem.value)),
  }] : [],
}))
</script>

<template>
  <article v-if="catalogItem" class="bc-product-page">
    <nav class="bc-product-page__crumb">
      <NuxtLink to="/bc-audio/catalog">Catalog</NuxtLink>
      <span aria-hidden="true"> / </span>
      <span>{{ catalogItem.category }}</span>
    </nav>

    <div class="bc-product-page__grid">
      <div class="bc-product-page__media">
        <img
          :src="bcProductImageSrc(catalogItem.image, siteUrl)"
          :alt="catalogItem.name"
          width="480"
          height="480"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
        >
      </div>
      <div class="bc-product-page__copy">
        <p class="bc-product-page__brand">{{ catalogItem.brand || catalogItem.category }}</p>
        <h1>{{ catalogItem.name }}</h1>
        <p class="bc-product-page__price" v-if="catalogItem.retailPrice">
          ${{ Number(catalogItem.retailPrice).toFixed(2) }}
        </p>
        <p class="bc-product-page__desc">{{ catalogItem.tagline || catalogItem.description }}</p>
        <BcShippingEstimate />
        <div class="bc-product-page__actions">
          <button type="button" class="bc-product-page__btn bc-product-page__btn--cart" @click="handleAddToCart">
            Add to Cart
          </button>
          <NuxtLink :to="buyUrl" class="bc-product-page__btn bc-product-page__btn--buy">Buy It Now</NuxtLink>
          <NuxtLink
            v-if="showGoToCart"
            to="/bc-audio/cart"
            class="bc-product-page__btn bc-product-page__btn--goto"
          >
            Go to Cart →
          </NuxtLink>
        </div>
        <p class="bc-product-page__legal">Sold by {{ BC_BRAND.full }} · B&amp;C Performance Audio LLC · Louisiana tax at checkout</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.bc-product-page { max-width: 960px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
.bc-product-page__crumb { font-size: 0.85rem; color: #9ca3af; margin-bottom: 1.5rem; }
.bc-product-page__crumb a { color: #ff5252; text-decoration: none; }
.bc-product-page__grid { display: grid; gap: 2rem; grid-template-columns: 1fr; }
@media (min-width: 768px) { .bc-product-page__grid { grid-template-columns: 1fr 1fr; } }
.bc-product-page__media img {
  width: 100%; max-width: 420px; border-radius: 12px;
  border: 1px solid rgba(211,47,47,0.25); background: #16161c;
}
.bc-product-page__brand { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.12em; color: #ff5252; margin: 0 0 8px; }
.bc-product-page h1 { font-size: 1.6rem; margin: 0 0 12px; line-height: 1.25; }
.bc-product-page__price { font-size: 1.5rem; font-weight: 800; color: #ffd814; margin: 0 0 12px; }
.bc-product-page__desc { color: #b8bcc6; line-height: 1.6; margin: 0 0 20px; }
.bc-product-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.bc-product-page__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 22px;
  border-radius: 10px;
  font-weight: 800;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font: inherit;
}
.bc-product-page__btn--cart {
  background: #0a0a0c;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}
.bc-product-page__btn--buy {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: #fff;
}
.bc-product-page__btn--goto {
  flex: 1 1 100%;
  background: rgba(211, 47, 47, 0.12);
  color: #ff5252;
  border: 1px solid #d32f2f;
}
.bc-product-page__legal { font-size: 0.78rem; color: #7a8190; margin-top: 16px; }
</style>
