<template>

  <NuxtPwaManifest />

  <NuxtLayout>

    <NuxtPage />

  </NuxtLayout>

  <LazyFranksOwnerKnockShell v-if="showFranksShell" />

</template>



<script setup>

import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'



const config = useRuntimeConfig()

const route = useRoute()



const showFranksShell = computed(() => {

  if (isBcPowerAudioPrimarySite(config.public.siteUrl)) return false

  return !route.path.startsWith('/bc-audio')

})

</script>

