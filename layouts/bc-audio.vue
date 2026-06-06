<template>
  <div class="bc-audio-shell">
    <BcAudioNav />
    <main class="bc-audio-main">
      <slot />
    </main>

    <OperatorUnlockModal
      :open="opModalOpen"
      :phrase="opPhrase"
      :error="opError"
      :submitting="opSubmitting"
      :key-configured="keyConfigured"
      :is-dev="isDev"
      @update:phrase="opPhrase = $event"
      @close="closeOpModal"
      @submit="submitOpModal"
    />

    <BcAiSupportDrawer />
  </div>
</template>

<script setup>
import '~/assets/css/bc-premium-theme.css'
import { BC_BRAND } from '~/utils/bcBrand.js'

useBcTheme()

useHead({
  titleTemplate: (title) => title ? `${title} · ${BC_BRAND.full}` : BC_BRAND.full,
})

const {
  isDev,
  opModalOpen,
  opPhrase,
  opError,
  opSubmitting,
  keyConfigured,
  onBrandOrLogoClick,
  closeOpModal,
  submitOpModal,
} = useOpsLogoKnock()

provide('opsLogoKnock', onBrandOrLogoClick)
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
