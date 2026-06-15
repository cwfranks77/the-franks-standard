<script setup>
import productsCatalog from '~/data/products.json'

useHead({ title: 'Browse — The Franks Standard' })

const products = ref(productsCatalog)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <MainHeader />
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <h1 class="text-2xl font-bold mb-2">Browse marketplace</h1>
      <p class="text-sm text-textMuted mb-6">All verified listings with COA or signed guarantee.</p>
      <DepartmentScroll />
      <ProductGrid :products="products" />
    </main>
    <MainFooter />
  </div>
</template>
