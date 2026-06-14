<template>
  <div class="learn-page">
    <div class="container" style="max-width: 640px; padding: 40px 16px 64px;">
      <p class="eyebrow"><NuxtLink to="/learn/tools">Tools</NuxtLink></p>
      <h1>Listing cost estimator</h1>
      <p class="text-muted mb-2">Estimate monthly listing fees after your first 10 free listings.</p>
      <ListingCostEstimator />
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Listing cost estimator | The Franks Standard',
  description: 'Free tool: estimate listing fees after 10 free listings on The Franks Standard.',
})
</script>

<style scoped>
.eyebrow a { font-weight: 700; color: #146eb4; }
h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; }
</style>
