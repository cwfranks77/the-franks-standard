<script setup>
const { listings, pending, loadError } = usePublishedListings()
const featured = computed(() => listings.value.slice(0, 6))
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <HeroBanner />
    <DepartmentScroll />

    <section class="max-w-6xl mx-auto px-4 pb-2 w-full">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-white">Live listings</h2>
        <p class="text-xs text-white/80">Only real seller inventory — no sample items</p>
      </div>
      <p v-if="loadError" class="text-sm text-amber-200 mb-4" role="alert">{{ loadError }}</p>
      <p v-else-if="pending" class="text-sm text-white/70 mb-4">Loading live listings…</p>
    </section>

    <SpotlightCarousel v-if="featured.length" :products="featured" />
    <section v-else-if="!pending" class="px-4 pb-6">
      <MarketplaceEmptyState />
    </section>

    <section v-if="listings.length > featured.length" class="max-w-6xl mx-auto px-4 pb-2">
      <h2 class="text-lg font-semibold text-white mb-3">More on the floor</h2>
    </section>
    <ProductGrid v-if="listings.length > featured.length" :products="listings.slice(featured.length)" />

    <MainFooter />
  </div>
</template>
