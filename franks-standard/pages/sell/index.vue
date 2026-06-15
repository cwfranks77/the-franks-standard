<script setup>
useHead({ title: 'Sell — The Franks Standard' })
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <MainHeader />
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <h1 class="text-2xl font-bold mb-2">Start selling</h1>
      <p class="text-sm text-textMuted mb-6">
        List with a COA or signed authenticity guarantee. Owner tools handle tax, escrow, and catalog.
      </p>
      <div class="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <NuxtLink
          to="/owner"
          class="block bg-surface2 border border-border rounded-lg p-4 hover:border-primary transition"
        >
          <h2 class="font-semibold mb-1">Owner dashboard</h2>
          <p class="text-xs text-textMuted">Add products, tax calculators, COA tools, and more.</p>
        </NuxtLink>
        <div class="bg-surface2 border border-border rounded-lg p-4">
          <h2 class="font-semibold mb-1">Seller policies</h2>
          <p class="text-xs text-textMuted">Digital signature required before first listing. Escrow until delivery confirmed.</p>
        </div>
      </div>
    </main>
    <MainFooter />
  </div>
</template>
