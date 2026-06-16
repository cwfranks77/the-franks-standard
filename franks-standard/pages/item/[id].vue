<script setup>
const route = useRoute()

onMounted(() => {
  const id = String(route.params.id || '')
  if (id) {
    navigateTo(`/listing/${id}`, { replace: true })
  } else {
    navigateTo('/browse', { replace: true })
  }
})
</script>

<template>
  <p class="text-white p-8">Redirecting…</p>
</template>
