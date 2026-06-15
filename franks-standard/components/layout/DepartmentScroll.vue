<script setup>
const departments = [
  { label: 'Sports Cards', img: '/img/showcase/cards.jpg', href: '/browse' },
  { label: 'Watches', img: '/img/showcase/watches.jpg', href: '/browse' },
  { label: 'Sneakers', img: '/img/showcase/sneakers.jpg', href: '/browse' },
  { label: 'Coins', img: '/img/showcase/coins.jpg', href: '/browse' },
  { label: 'Art', img: '/img/showcase/art.jpg', href: '/browse' },
  { label: 'Vintage', img: '/img/showcase/vintage.jpg', href: '/browse' },
  { label: 'Estate Finds', img: '/img/showcase/estate.jpg', href: '/browse' },
  { label: 'Comics', img: '/img/showcase/comics.jpg', href: '/browse' },
  { label: 'Guitars', img: '/img/showcase/guitars.jpg', href: '/browse' },
  { label: 'Cameras', img: '/img/showcase/camera.jpg', href: '/browse' }
]
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 pb-4">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
      <h2 class="text-sm font-semibold text-textMuted uppercase tracking-wide">
        Shop by department
      </h2>
      <NuxtLink to="/browse" class="text-xs text-primary hover:underline">
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
        <div class="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-surface2 group-hover:border-primary transition">
          <img
            :src="dept.img"
            :alt="dept.label"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <p class="text-[0.7rem] font-medium text-center mt-1.5 line-clamp-2 group-hover:text-primary transition">
          {{ dept.label }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
