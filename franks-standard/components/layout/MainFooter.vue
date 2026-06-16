<template>
  <footer class="border-t border-border bg-surface mt-8 text-white/80">
    <div class="max-w-6xl mx-auto px-4 py-6 text-xs text-textMuted space-y-3">
      <nav class="flex flex-wrap gap-x-4 gap-y-1">
        <NuxtLink to="/terms" class="hover:text-primary">Terms</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-primary">Privacy</NuxtLink>
        <NuxtLink to="/marketplace-policy" class="hover:text-primary">Marketplace policies</NuxtLink>
        <NuxtLink to="/seller-agreement" class="hover:text-primary">Seller agreement</NuxtLink>
        <NuxtLink to="/prohibited-items" class="hover:text-primary">Prohibited items</NuxtLink>
      </nav>
      <p class="text-white/55 max-w-3xl leading-relaxed">
        The Franks Standard and affiliated companies guarantee authenticity processes (COA, escrow, enforcement).
        Sellers remain responsible for item accuracy. We are not liable for user conduct or off-platform deals —
        see Terms for full limits.
      </p>
      <div class="flex flex-wrap justify-between gap-2 pt-1">
        <span>© {{ new Date().getFullYear() }} The Franks Standard.</span>
        <span>Authenticity-first marketplace</span>
      </div>
    </div>
  </footer>
</template>
