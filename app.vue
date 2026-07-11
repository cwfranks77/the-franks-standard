<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <OwnerUnlockModal
      v-if="showFranksShell"
      :open="modalOpen"
      :error="error"
      :submitting="submitting"
      :key-configured="keyConfigured"
      @close="closeModal()"
      @submit="submitModal"
    />
  </ClientOnly>
</template>

<script setup>
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const config = useRuntimeConfig()
const route = useRoute()

const {
  modalOpen,
  error,
  submitting,
  keyConfigured,
  closeModal,
  submitModal,
} = useLogoOwnerKnock()

const showFranksShell = computed(() => {
  if (isBcPowerAudioPrimarySite(config.public.siteUrl)) return false
  return !route.path.startsWith('/bc-audio')
})

if (import.meta.client) {
  onMounted(() => {
    modalOpen.value = false
  })
}
</script>
