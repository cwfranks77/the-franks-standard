<script setup>
const route = useRoute()
const listing = ref(null)
const pending = ref(true)
const notFound = ref(false)

useHead({
  title: () =>
    listing.value
      ? `${listing.value.title} — The Franks Standard`
      : 'Listing — The Franks Standard',
})

onMounted(async () => {
  const id = String(route.params.id || '')
  pending.value = true
  notFound.value = false
  listing.value = await fetchPublishedListingById(id)
  if (!listing.value) notFound.value = true
  pending.value = false
})

const priceLabel = computed(() => {
  const p = listing.value?.price
  if (p == null) return null
  return `$${Number(p).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
})
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <p v-if="pending" class="text-sm text-white/70">Loading listing…</p>

      <MarketplaceEmptyState
        v-else-if="notFound"
        title="This listing is not available"
        message="It may have sold, been removed, or was never a live listing. Browse the floor for items that are actually for sale."
      />

      <div v-else-if="listing" class="grid md:grid-cols-2 gap-8">
        <div class="aspect-video bg-surface2 border border-border rounded-lg overflow-hidden">
          <img
            :src="listing.image"
            :alt="listing.title"
            class="w-full h-full object-cover"
          >
        </div>
        <div>
          <p class="text-xs text-white/70 uppercase mb-1">{{ listing.category }}</p>
          <h1 class="text-2xl font-bold mb-3 text-white">{{ listing.title }}</h1>
          <p v-if="priceLabel" class="text-xl font-semibold text-primary mb-3">{{ priceLabel }}</p>
          <p class="text-sm text-white/85 mb-4">{{ listing.description }}</p>
          <p v-if="listing.coaSerial" class="text-sm text-secondary mb-4">
            COA verified · {{ listing.coaSerial }}
          </p>
          <NuxtLink to="/browse" class="text-sm text-primary hover:underline">
            ← Back to browse
          </NuxtLink>
        </div>
      </div>
    </main>
    <MainFooter />
  </div>
</template>
