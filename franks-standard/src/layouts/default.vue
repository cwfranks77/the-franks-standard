<template>
  <div class="franks-main-container">
    <!-- app.vue already wraps NuxtLayout > NuxtPage; layout must use slot, not a second NuxtPage -->
    <slot />
  </div>
</template>

<script setup>
// Minimal Franks shell — marketplace chrome lives on each page (MainHeader, etc.).
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
</style>
