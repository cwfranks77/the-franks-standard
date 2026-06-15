<script setup>
const { data: products } = await useFetch('/data/products.json', {
  default: () => [],
})

const featured = computed(() => (products.value || []).filter((p) => p.featured))
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
