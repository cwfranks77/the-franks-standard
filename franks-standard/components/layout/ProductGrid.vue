<script setup>
const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 pb-10">
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>
