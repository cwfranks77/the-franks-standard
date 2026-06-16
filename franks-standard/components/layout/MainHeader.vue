<script setup>
const links = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/browse' },
  { label: 'Sell', href: '/sell/start' },
  { label: 'Help', href: '#' },
]

const { onLogoKnock } = useLogoOwnerKnock()
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface border-b border-border text-textMain shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          class="h-10 w-10 rounded-md overflow-hidden shrink-0 p-0 border-0 bg-transparent cursor-pointer touch-manipulation"
          aria-label="The Franks Standard — tap five times for operator access"
          @click="onLogoKnock"
        >
          <img
            src="/img/franks-pavilion.png"
            alt=""
            class="h-full w-full object-cover pointer-events-none select-none"
            width="40"
            height="40"
            decoding="async"
            draggable="false"
          >
        </button>
        <NuxtLink to="/" class="font-semibold text-lg tracking-tight text-white hover:text-primary transition-colors">
          The Franks Standard
        </NuxtLink>
      </div>
      <div class="flex-1">
        <input
          type="search"
          placeholder="Search collectibles and verified listings..."
          class="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-textMain placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-primary"
        >
      </div>
      <nav class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white shrink-0">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.href"
          class="text-white/90 hover:text-primary transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
