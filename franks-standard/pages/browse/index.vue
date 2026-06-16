<script setup>

useHead({ title: 'Browse — The Franks Standard' })



const { listings, pending, loadError } = usePublishedListings()

</script>



<template>

  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">

    <MainHeader />

    <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">

      <h1 class="text-2xl font-bold mb-2 text-white">Browse marketplace</h1>

      <p class="text-sm text-white/80 mb-2">

        Live inventory from verified sellers only. We never show fake sample listings.

      </p>

      <p v-if="listings.length" class="text-xs text-primary mb-6">

        {{ listings.length }} {{ listings.length === 1 ? 'listing' : 'listings' }} live now

      </p>

      <p v-if="loadError" class="text-sm text-amber-200 mb-4" role="alert">{{ loadError }}</p>

      <p v-else-if="pending" class="text-sm text-white/70 mb-6">Loading listings…</p>



      <DepartmentScroll />



      <ProductGrid v-if="listings.length" :products="listings" />

      <MarketplaceEmptyState

        v-else-if="!pending"

        title="No listings on the floor yet"

        message="When sellers publish real items, they will show up here. We do not display placeholder products that are not for sale."

      />

    </main>

    <MainFooter />

  </div>

</template>

