<script setup>
useSeoMeta({ title: 'List an item — The Franks Standard' })
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <NuxtLink to="/sell/start" class="text-sm text-primary hover:underline">← Start selling</NuxtLink>
      <h1 class="text-2xl font-bold mt-3 mb-2 text-white">List an item</h1>
      <p class="text-sm text-white/80 mb-6 max-w-xl">
        Listings are scanned for contact info, prohibited items, and collectible COA requirements before publish.
      </p>
      <ListingPublishForm />
    </main>
    <MainFooter />
  </div>
</template>
