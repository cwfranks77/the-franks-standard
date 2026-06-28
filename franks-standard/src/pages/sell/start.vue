<script setup>
useHead({ title: 'Start selling — The Franks Standard' })
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <h1 class="text-2xl font-bold mb-2 text-white">Start selling</h1>
      <p class="text-sm text-white mb-6">
        Choose your path. Collectibles need COA proof. Use the AI tools to build your store brand and dropship plan.
      </p>
      <div class="grid sm:grid-cols-2 gap-4 max-w-4xl">
        <NuxtLink
          to="/store-builder"
          class="block bg-surface2 border border-border rounded-lg p-5 hover:border-primary transition"
        >
          <span class="text-xs font-bold uppercase tracking-wide text-cyan-400">AI-Powered</span>
          <h2 class="font-semibold mb-2 text-white mt-1">AI Store Builder</h2>
          <p class="text-sm text-white">
            Store bio, SEO for Google and Bing, listing title formulas, meta tags, and search-engine checklist.
          </p>
        </NuxtLink>
        <NuxtLink
          to="/sell/dropship-setup"
          class="block bg-surface2 border border-border rounded-lg p-5 hover:border-primary transition"
        >
          <span class="text-xs font-bold uppercase tracking-wide text-cyan-400">AI-Powered</span>
          <h2 class="font-semibold mb-2 text-white mt-1">Dropshipping AI Store Builder</h2>
          <p class="text-sm text-white">
            Supplier recommendation, fulfillment plan, catalog import steps, and store slug — saved on your device.
          </p>
        </NuxtLink>
        <NuxtLink
          to="/sell/coa"
          class="block bg-surface2 border border-border rounded-lg p-5 hover:border-primary transition"
        >
          <h2 class="font-semibold mb-2 text-white">Collectible or antique</h2>
          <p class="text-sm text-white">
            Cards, coins, watches, memorabilia — COA upload or Franks serial with your e-signature.
          </p>
        </NuxtLink>
        <NuxtLink
          to="/sell/list"
          class="block bg-surface2 border border-border rounded-lg p-5 hover:border-primary transition"
        >
          <h2 class="font-semibold mb-2 text-white">List an item</h2>
          <p class="text-sm text-white">
            General merchandise or collectibles — compliance scan blocks contact info, prohibited items, and missing COA.
          </p>
        </NuxtLink>
      </div>
    </main>
    <MainFooter />
  </div>
</template>
