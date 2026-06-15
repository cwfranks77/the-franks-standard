<script setup>
import productsCatalog from '~/data/products.json'

const products = ref(productsCatalog)
const featured = computed(() => products.value.filter((p) => p.featured))
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <MainHeader />
    <HeroBanner />
    <DepartmentScroll />
    <SpotlightCarousel :products="featured.length ? featured : products" />
    <section class="max-w-6xl mx-auto px-4 pb-2">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">Verified listings</h2>
        <p class="text-xs text-textMuted">COA-backed · escrow protected</p>
      </div>
    </section>
    <ProductGrid :products="products" />
    <MainFooter />
  </div>
</template>
