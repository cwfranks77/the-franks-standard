<template>
  <div class="browse-page">
    <div class="container">
      <div class="browse-header">
        <h1>Browse Marketplace</h1>
        <p class="text-muted">Every item backed by a Certificate of Authenticity</p>
      </div>

      <!-- Filters -->
      <div class="browse-filters">
        <div class="filter-bar">
          <input
            type="text"
            class="input search-input"
            placeholder="Search authenticated items..."
            v-model="searchQuery"
          />
          <select class="select filter-select" v-model="selectedCategory">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select class="select filter-select" v-model="sortBy">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <!-- Listings grid -->
      <div class="grid grid-4 mt-4" v-if="filteredListings.length">
        <NuxtLink
          v-for="item in filteredListings"
          :key="item.id"
          :to="`/listing/${item.id}`"
          class="listing-card card"
        >
          <div class="listing-image">
            <img :src="item.image" :alt="item.title" />
            <span class="coa-badge listing-coa">COA Verified</span>
          </div>
          <div class="card-body">
            <p class="listing-category text-muted">{{ item.category }}</p>
            <h3 class="listing-title">{{ item.title }}</h3>
            <div class="listing-footer">
              <span class="listing-price">${{ item.price.toLocaleString() }}</span>
              <span class="listing-seller text-muted">{{ item.seller }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="empty-state text-center mt-4">
        <p style="font-size: 3rem;">🏛️</p>
        <h3 class="mt-2">No Listings Yet</h3>
        <p class="text-muted mt-1">The marketplace is just getting started. Be the first to list an item!</p>
        <NuxtLink to="/sell" class="btn btn-primary mt-3">List Your First Item</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest')

const categories = [
  'Sports Cards & Memorabilia',
  'Musical Instruments',
  'Firearms Accessories',
  'Coins & Currency',
  'Art & Antiques',
  'Watches & Jewelry',
  'Sneakers & Streetwear',
  'Vintage Electronics & Games',
]

// TODO: Replace with Supabase query
const listings = ref([])

const filteredListings = computed(() => {
  let results = [...listings.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(
      (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value) {
    results = results.filter((i) => i.category === selectedCategory.value)
  }
  if (sortBy.value === 'price-low') results.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-high') results.sort((a, b) => b.price - a.price)
  return results
})
</script>

<style scoped>
.browse-page { padding: 40px 0; }
.browse-header { margin-bottom: 24px; }
.browse-header h1 { font-size: 2rem; }

.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.search-input { flex: 2; min-width: 200px; }
.filter-select { flex: 1; min-width: 160px; }

.listing-card { text-decoration: none; color: inherit; }
.listing-image {
  position: relative;
  aspect-ratio: 1;
  background: var(--stone-800);
  overflow: hidden;
}
.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.listing-coa {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.7rem;
  padding: 4px 10px;
}
.listing-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
.listing-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 4px 0 10px;
  color: var(--stone-100);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.listing-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.listing-price {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--gold);
}
.listing-seller { font-size: 0.8rem; }

.empty-state { padding: 60px 0; }
</style>
