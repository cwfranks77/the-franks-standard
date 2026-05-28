<template>
  <div class="redirect-page">
    <p>Opening seller lookup tool…</p>
    <p>
      <a :href="lookupHref" class="btn btn-primary">Open seller lookup</a>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Find sellers — Google', robots: 'noindex' })

const route = useRoute()
const lookupHref = computed(() => {
  const q = route.query.url || route.query.q
  if (q) return `/seller-lookup.html?url=${encodeURIComponent(String(q))}`
  return '/seller-lookup.html'
})

onMounted(() => {
  if (import.meta.client) {
    window.location.replace(lookupHref.value)
  }
})
</script>

<style scoped>
.redirect-page {
  padding: 48px 20px;
  text-align: center;
}
</style>
