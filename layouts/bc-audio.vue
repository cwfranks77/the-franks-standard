<template>
  <div class="bc-audio-shell">
    <BcAudioNav />
    <main class="bc-audio-main">
      <slot />
    </main>

    <!--
      ClientOnly + shared useState modal: do not clear opModalOpen on mount —
      that raced remounts (logo NuxtLink / lazy shell) and closed the unlock popup.
    -->
    <ClientOnly>
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
    </ClientOnly>

    <BcAiSupportDrawer />
    <BcInstallApp />
  </div>
</template>

<script setup>
import '~/assets/css/bc-premium-theme.css'
import { BC_LEGAL_NAME } from '~/utils/bcSeo.js'

useBcTheme()

const { refresh: refreshCatalog } = useBcProductCatalog()
onMounted(() => { refreshCatalog() })

useHead({
  titleTemplate: (title) => title || BC_LEGAL_NAME,
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
