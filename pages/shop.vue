<script setup>
if (import.meta.server) {
  await navigateTo('/bc-audio', { redirectCode: 301 })
}

onMounted(() => {
  navigateTo('/bc-audio', { replace: true })
})

useSeoMeta({
  title: 'Redirecting to B&C Performance Audio',
  robots: 'noindex,nofollow',
})
</script>

<template>
  <div class="shop-redirect">
    <p>Redirecting to <NuxtLink to="/bc-audio">B&amp;C Performance Audio</NuxtLink>…</p>
  </div>
</template>

<style scoped>
.shop-redirect {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0c;
  color: #9ca3af;
  font-size: 0.9rem;
}
.shop-redirect a { color: #ff5252; font-weight: 800; }
</style>
