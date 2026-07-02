<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <OwnerUnlockModal
    v-if="showFranksShell"
    :open="ownerKnock.modalOpen"
    :phrase="ownerKnock.phrase"
    :error="ownerKnock.error"
    :submitting="ownerKnock.submitting"
    :key-configured="ownerKnock.keyConfigured"
    @update:phrase="ownerKnock.phrase = $event"
    @close="ownerKnock.closeModal()"
    @submit="ownerKnock.submitModal()"
  />
</template>

<script setup>
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const config = useRuntimeConfig()
const route = useRoute()
const ownerKnock = useLogoOwnerKnock()

const showFranksShell = computed(() => {
  if (isBcPowerAudioPrimarySite(config.public.siteUrl)) return false
  return !route.path.startsWith('/bc-audio')
})
</script>
