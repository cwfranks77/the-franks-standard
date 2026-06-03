<template>
  <div class="bc-audio-shell">
    <BcAudioNav />
    <main class="bc-audio-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'

useHead({
  titleTemplate: (title) => title ? `${title} · ${BC_BRAND.full}` : BC_BRAND.full,
})
</script>

<style scoped>
.bc-audio-shell {
  min-height: 100vh;
  background: #0a0a0c;
  color: #f5f5f7;
}
.bc-audio-main {
  min-height: calc(100vh - 64px);
}
</style>
