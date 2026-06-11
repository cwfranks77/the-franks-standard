<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AiSupportDrawer v-if="showFranksHelp" />
</template>

<script setup>
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const route = useRoute()
const config = useRuntimeConfig()
const showFranksHelp = computed(() => {
  if (isBcPowerAudioPrimarySite(config.public.siteUrl)) return false
  return !route.path.startsWith('/bc-audio')
})
</script>
