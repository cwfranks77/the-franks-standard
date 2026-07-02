<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const listingTo = computed(() => `/listing/${props.product.id}`)
const priceLabel = computed(() => {
  const p = props.product.price
  if (p == null || Number.isNaN(Number(p))) return null
  return `$${Number(p).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
})
</script>

<template>
  <article class="bg-surface2 border border-border rounded-lg overflow-hidden hover:border-gold transition flex flex-col text-textMain">
    <div class="aspect-video bg-bg">
      <img
        :src="product.image || '/img/franks-pavilion.png'"
        :alt="product.title || product.name"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="p-3 flex-1 flex flex-col">
      <h3 class="text-sm font-semibold mb-1 line-clamp-2 text-white">
        {{ product.title || product.name }}
      </h3>
      <p v-if="priceLabel" class="text-sm font-semibold text-gold mb-1">{{ priceLabel }}</p>
      <p class="text-xs text-white/80 line-clamp-3 mb-2">
        {{ product.description }}
      </p>
      <div class="mt-auto flex items-center justify-between text-xs text-white/75">
        <span>{{ product.category }}</span>
        <span v-if="product.coaSerial" class="text-secondary">COA verified</span>
      </div>
      <NuxtLink
        :to="listingTo"
        class="mt-2 inline-flex text-xs text-gold hover:underline"
      >
        View listing
      </NuxtLink>
    </div>
  </article>
</template>
