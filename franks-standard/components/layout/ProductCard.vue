<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="bg-surface2 border border-border rounded-lg overflow-hidden hover:border-primary transition flex flex-col">
    <div class="aspect-video bg-bg">
      <img
        :src="product.images && product.images[0] ? product.images[0] : '/img/franks-pavilion.png'"
        :alt="product.name"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="p-3 flex-1 flex flex-col">
      <h3 class="text-sm font-semibold mb-1 line-clamp-2">
        {{ product.name }}
      </h3>
      <p class="text-xs text-textMuted line-clamp-3 mb-2">
        {{ product.description }}
      </p>
      <div class="mt-auto flex items-center justify-between text-xs text-textMuted">
        <span>{{ product.category }}</span>
        <span v-if="product.coaId" class="text-secondary">COA verified</span>
      </div>
      <NuxtLink
        :to="`/item/${product.id}`"
        class="mt-2 inline-flex text-xs text-primary hover:underline"
      >
        View item
      </NuxtLink>
    </div>
  </article>
</template>
