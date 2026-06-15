<script setup>
const links = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/browse' },
  { label: 'About', href: '#' },
  { label: 'Help', href: '#' }
]
</script>

<template>
  <header class="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-border">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
      <div class="font-semibold text-lg tracking-tight">
        The Franks Standard
      </div>
      <div class="flex-1">
        <input
          type="search"
          placeholder="Search certified gear..."
          class="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <nav class="hidden md:flex gap-4 text-sm text-textMuted">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.href"
          class="hover:text-primary transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
