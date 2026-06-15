<script setup>
import productsCatalog from '~/data/products.json'

const route = useRoute()
const product = computed(() =>
  productsCatalog.find((p) => p.id === route.params.id)
)

useHead({
  title: () =>
    product.value
      ? `${product.value.name} — The Franks Standard`
      : 'Item — The Franks Standard'
})

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Item not found' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <MainHeader />
    <main v-if="product" class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <div class="grid md:grid-cols-2 gap-8">
        <div class="aspect-video bg-surface2 border border-border rounded-lg overflow-hidden">
          <img
            :src="product.images?.[0] || '/img/franks-pavilion.png'"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <p class="text-xs text-textMuted uppercase mb-1">{{ product.category }}</p>
          <h1 class="text-2xl font-bold mb-3">{{ product.name }}</h1>
          <p class="text-sm text-textMuted mb-4">{{ product.description }}</p>
          <p v-if="product.coaId" class="text-sm text-secondary mb-4">
            COA verified · ID {{ product.coaId }}
          </p>
          <NuxtLink to="/browse" class="text-sm text-primary hover:underline">
            ← Back to browse
          </NuxtLink>
        </div>
      </div>
    </main>
    <MainFooter />
  </div>
</template>
