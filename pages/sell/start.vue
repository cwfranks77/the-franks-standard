<template>
  <div class="list-start-page">
    <div class="container" style="padding: 48px 16px 80px; max-width: 720px;">
      <SellListingPathChooser />
      <p class="text-muted small foot-note">
        Not sure?
        <NuxtLink to="/categories">Browse categories</NuxtLink>
        ·
        <NuxtLink to="/how-it-works">How listing proof works</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'List an item | The Franks Standard',
  description: 'Choose collectible (COA required) or non-collectible general merchandise listing.',
})
</script>

<style scoped>
.foot-note { margin-top: 24px; }
</style>
