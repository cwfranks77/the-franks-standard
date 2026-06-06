<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AiSupportDrawer v-if="showFranksHelp" />
</template>

<script setup>
const route = useRoute()
const showFranksHelp = computed(() => !route.path.startsWith('/bc-audio'))
</script>
