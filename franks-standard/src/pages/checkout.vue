<script setup>
/** Route shell — redirects to listing Buy Now or cart (no layout changes). */
definePageMeta({ middleware: 'requires-auth' })

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const listingId = String(route.query.listing_id || '').trim()
  if (listingId) {
    router.replace(`/listing/${listingId}`)
    return
  }
  router.replace('/cart')
})
</script>

<template>
  <div />
</template>
