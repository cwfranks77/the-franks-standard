<script setup>
useHead({
  title: 'COA for sellers — The Franks Standard',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
      <p class="text-xs uppercase tracking-wide text-primary font-semibold mb-2">Collectible listing</p>
      <h1 class="text-2xl font-bold mb-2 text-white">Certificate of Authenticity (COA)</h1>
      <p class="text-sm text-white mb-6">
        Sellers can prepare a Franks COA here. It stays <strong>locked</strong> — not printable and not transferable —
        until you issue a serial number and sign with your full legal name.
      </p>
      <SellerCoaWorkspace />
      <div class="flex flex-wrap gap-3 mt-8">
        <NuxtLink to="/sell/start" class="text-sm text-primary hover:underline">← Back to sell options</NuxtLink>
      </div>
    </main>
    <MainFooter />
  </div>
</template>
