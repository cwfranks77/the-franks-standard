<script setup>
const phoneDisplay = '(877) 837-0527'
const phoneTel = '+18778370527'
</script>

<template>
  <footer class="border-t border-border bg-surface mt-8 text-white/80">
    <div class="max-w-6xl mx-auto px-4 py-6 text-xs text-textMuted space-y-4">
      <nav class="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <NuxtLink to="/about" class="hover:text-gold text-white/90">About us</NuxtLink>
        <NuxtLink to="/contact" class="hover:text-gold text-white/90">Contact us</NuxtLink>
        <NuxtLink to="/support" class="hover:text-gold text-white/90">Help</NuxtLink>
        <NuxtLink to="/terms" class="hover:text-gold">Terms</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-gold">Privacy</NuxtLink>
        <NuxtLink to="/marketplace-policy" class="hover:text-gold">Marketplace policies</NuxtLink>
        <NuxtLink to="/seller-agreement" class="hover:text-gold">Seller agreement</NuxtLink>
        <NuxtLink to="/prohibited-items" class="hover:text-gold">Prohibited items</NuxtLink>
      </nav>
      <div id="contact-us" class="rounded-lg border border-border bg-surface2/80 px-4 py-3">
        <p class="text-white/90 font-semibold mb-1">Contact us</p>
        <p class="text-white/75 leading-relaxed">
          Questions about orders, selling, or partnerships?
          <a :href="`tel:${phoneTel}`" class="text-gold font-bold hover:underline">{{ phoneDisplay }}</a>
          ·
          <a href="mailto:info@thefranksstandard.com" class="text-gold hover:underline">info@thefranksstandard.com</a>
        </p>
        <p class="text-white/55 mt-1">Help center on the <NuxtLink to="/support" class="text-gold hover:underline">Support</NuxtLink> page</p>
      </div>
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
