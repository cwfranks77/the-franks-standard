<template>
  <div class="rounded-xl border border-border bg-surface2 p-8 text-center max-w-lg mx-auto">
    <p class="text-3xl mb-3" aria-hidden="true">🏛️</p>
    <h2 class="text-lg font-semibold text-white mb-2">{{ title }}</h2>
    <p class="text-sm text-white/80 mb-5">{{ message }}</p>
    <NuxtLink
      to="/sell/start"
      class="inline-flex items-center px-4 py-2 rounded-md bg-primary text-bg text-sm font-medium hover:bg-primary/90 transition"
    >
      Start selling
    </NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'No live listings yet' },
  message: {
    type: String,
    default: 'We only show real inventory from verified sellers. Nothing is listed on the floor right now — check back soon.',
  },
})
</script>
