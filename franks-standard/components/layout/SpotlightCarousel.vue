<script setup>
const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 pb-8">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold">Spotlight</h2>
      <p class="text-xs text-textMuted">Curated pieces worth your attention.</p>
    </div>
    <div class="overflow-x-auto">
      <div class="flex gap-4">
        <article
          v-for="product in products"
          :key="product.id"
          class="min-w-[220px] bg-surface2 border border-border rounded-lg p-3 hover:border-primary transition"
        >
          <div class="aspect-video bg-bg rounded mb-2 overflow-hidden">
            <img
              v-if="product.images && product.images[0]"
              :src="product.images[0]"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>
          <h3 class="text-sm font-medium mb-1 line-clamp-2">
            {{ product.name }}
          </h3>
          <p class="text-xs text-textMuted line-clamp-2">
            {{ product.description }}
          </p>
          <NuxtLink
            :to="`/item/${product.id}`"
            class="mt-2 inline-flex text-xs text-primary hover:underline"
          >
            View details
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>
