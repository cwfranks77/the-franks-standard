<script setup>
import { onShowcaseImageError } from '~/utils/marketplaceShowcaseImages.js'

const departments = [
  { label: 'Sports Cards', img: '/img/showcase/cards.jpg', key: 'cards', href: '/browse' },
  { label: 'Watches', img: '/img/showcase/watches.jpg', key: 'watches', href: '/browse' },
  { label: 'Sneakers', img: '/img/showcase/sneakers.jpg', key: 'sneakers', href: '/browse' },
  { label: 'Coins', img: '/img/showcase/coins.jpg', key: 'coins', href: '/browse' },
  { label: 'Art', img: '/img/showcase/art.jpg', key: 'art', href: '/browse' },
  { label: 'Vintage', img: '/img/showcase/vintage.jpg', key: 'vintage', href: '/browse' },
  { label: 'Estate Finds', img: '/img/showcase/estate.jpg', key: 'estate', href: '/browse' },
  { label: 'Comics', img: '/img/showcase/comics.jpg', key: 'comics', href: '/browse' },
  { label: 'Guitars', img: '/img/showcase/guitars.jpg', key: 'guitars', href: '/browse' },
  { label: 'Cameras', img: '/img/showcase/camera.jpg', key: 'camera', href: '/browse' },
]
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 pb-4">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
      <h2 class="text-sm font-semibold text-white uppercase tracking-wide">
        Shop by department
      </h2>
      <NuxtLink to="/browse" class="text-xs text-gold hover:underline">
        See all categories
      </NuxtLink>
    </div>
    <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      <NuxtLink
        v-for="dept in departments"
        :key="dept.label"
        :to="dept.href"
        class="flex-shrink-0 w-[100px] group"
      >
        <div class="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-surface2 group-hover:border-gold transition">
          <img
            :src="dept.img"
            :alt="dept.label"
            :data-showcase-key="dept.key"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            @error="onShowcaseImageError"
          />
        </div>
        <p class="text-[0.7rem] font-medium text-center mt-1.5 line-clamp-2 text-white group-hover:text-gold transition">
          {{ dept.label }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
