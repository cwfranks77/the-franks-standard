<script setup>
import { COA_OWNER_MANAGER_LEAD } from '~/utils/franksCoaModel.js'

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
      <p class="text-sm text-white mb-2">{{ COA_OWNER_MANAGER_LEAD }}</p>
      <p class="text-sm text-white/85 mb-6">
        Upload <strong>item thumbnail photos</strong> below, complete every checklist step, then publish.
        A COA is <strong>never transferable</strong> to another item — fraud protections are enforced on our servers.
      </p>
      <SellerCoaWorkspace />
      <div class="flex flex-wrap gap-3 mt-8">
        <NuxtLink to="/sell/start?kind=collectible" class="text-sm text-primary hover:underline">New collectible listing →</NuxtLink>
        <NuxtLink to="/sell/start" class="text-sm text-white/70 hover:underline">← Sell options</NuxtLink>
      </div>
    </main>
    <MainFooter />
  </div>
</template>
