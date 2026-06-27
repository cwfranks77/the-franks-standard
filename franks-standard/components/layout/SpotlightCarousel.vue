<script setup>
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})

const displayProducts = computed(() =>
  (props.products || []).map((p) => ({
    id: p.id,
    title: p.title || p.name,
    description: p.description,
    category: p.category,
    price: p.price ?? null,
    image: p.image || (p.images && p.images[0]) || '/img/franks-pavilion.png',
    coaSerial: p.coaSerial || (p.coaId ? String(p.coaId) : ''),
  })),
)
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 pb-8">
    <div class="overflow-x-auto">
      <div class="flex gap-4">
        <article
          v-for="product in displayProducts"
          :key="product.id"
          class="min-w-[220px] bg-surface2 border border-border rounded-lg p-3 hover:border-primary transition"
        >
          <div class="aspect-video bg-bg rounded mb-2 overflow-hidden">
            <img
              :src="product.image"
              :alt="product.title"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3 class="text-sm font-medium mb-1 line-clamp-2 text-white">
            {{ product.title }}
          </h3>
          <p class="text-xs text-white/80 line-clamp-2">
            {{ product.description }}
          </p>
          <NuxtLink
            :to="`/listing/${product.id}`"
            class="mt-2 inline-flex text-xs text-primary hover:underline"
          >
            View listing
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>
