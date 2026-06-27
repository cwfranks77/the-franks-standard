<script setup>
useSeoMeta({
  title: 'Dropshipping AI Store Builder — The Franks Standard',
  description: 'AI-guided dropship setup: pick a supplier, get a store plan, fulfillment checklist, and SEO next steps.',
})
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 w-full">
      <DropshipAiBuilderPanel />
    </main>
    <MainFooter />
  </div>
</template>
