<script setup>
import productsCatalog from '~/data/products.json'

const products = ref(productsCatalog)
const featured = computed(() => products.value.filter((p) => p.featured))
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <MainHeader />
    <HeroBanner />
    <SpotlightCarousel :products="featured.length ? featured : products" />
    <ProductGrid :products="products" />
    <MainFooter />
  </div>
</template>
