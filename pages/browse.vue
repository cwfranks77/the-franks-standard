<template>
  <div class="browse-page">
    <div class="container">
      <div class="browse-header">
        <div class="browse-title-row">
          <h1>Browse Marketplace</h1>
          <span v-if="listings.length" class="browse-count-badge">{{ listings.length }} {{ listings.length === 1 ? 'listing' : 'listings' }} live</span>
        </div>
        <p class="text-muted">
          The floor lists live inventory as sellers and shops go on board; every public item is COA- or guarantee-backed.
          <NuxtLink to="/sellers">Apply to add your store</NuxtLink>.
        </p>
      </div>

      <MarketplacePageDock :tiles="browseDockTiles" aria-label="Browse shortcuts" />

      <!-- Filters -->
      <p v-if="loadError" class="text-muted" style="max-width: 640px;">
        Could not load listings (check Supabase env and the SQL migration in the repo was run in your project). {{ loadError }}
      </p>
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
          <select class="select filter-select" v-model="selectedCondition">
            <option value="">All Conditions</option>
            <option value="new">New / Sealed</option>
            <option value="like-new">Like New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
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
            <span v-if="item.saleType === 'auction'" class="auction-badge listing-coa">
              {{ item.buyNowPrice ? 'Auction + BIN' : 'Auction' }}
            </span>
            <span v-if="item.donateProceeds" class="charity-badge listing-coa">
              {{ item.charityPercent >= 100 ? 'Charity' : `${item.charityPercent}% charity` }}
            </span>
          </div>
          <div class="card-body">
            <p class="listing-category text-muted">{{ item.category }}</p>
            <h3 class="listing-title">{{ item.title }}</h3>
            <div class="listing-footer">
              <span class="listing-price">
                <template v-if="item.saleType === 'auction'">
                  {{ item.currentBid != null ? `$${item.currentBid.toLocaleString()} bid` : `$${item.price.toLocaleString()} start` }}
                  <span v-if="item.buyNowPrice && !item.currentBid" class="text-muted small"> · BIN ${{ item.buyNowPrice.toLocaleString() }}</span>
                </template>
                <template v-else>${{ item.price.toLocaleString() }}</template>
              </span>
              <span v-if="item.condition" class="listing-condition-tag">{{ item.condition.replace(/-/g, ' ') }}</span>
            </div>
            <p class="listing-seller text-muted">{{ item.seller }}</p>
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
import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'

const { publicUrlForPath } = useListingImageUrl()
const supabase = useSupabaseClient()

const browseDockTiles = [
  { to: '/sell', icon: '📤', label: 'Sell an item', hint: 'COA or signed guarantee', variant: 'primary' },
  { to: '/sell/import', icon: '📥', label: 'Import from eBay', hint: 'CSV or store link', variant: 'accent' },
  { to: '/categories', icon: '🏷️', label: 'Categories', hint: 'Curated niches' },
  { to: '/join/founders10', icon: '🎁', label: 'FOUNDERS10', hint: '3 mo Pro free', variant: 'dark' },
]

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedCondition = ref('')
const sortBy = ref('newest')
const loadError = ref('')

const categories = LISTING_CATEGORIES

const listings = ref([])

async function loadListings() {
  loadError.value = ''
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, category, price, condition, coa_type, image_paths, created_at, donate_proceeds, charity_name, charity_percent, sale_type, current_bid, starting_bid, auction_ends_at, buy_now_price, bid_count, seller:profiles!listings_seller_id_fkey(full_name)')

    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    loadError.value = error.message
    return
  }
  listings.value = (data || []).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    price: Number(r.price),
    condition: r.condition || '',
    coaType: r.coa_type,
    createdAt: r.created_at,
    image: publicUrlForPath(r.image_paths?.[0]),
    seller: (r.seller && r.seller.full_name) ? r.seller.full_name : 'Seller',
    donateProceeds: !!r.donate_proceeds,
    charityName: r.charity_name || '',
    charityPercent: r.donate_proceeds
      ? Math.min(100, Math.max(1, Number(r.charity_percent ?? 100)))
      : 0,
    saleType: r.sale_type || 'fixed',
    currentBid: r.current_bid != null ? Number(r.current_bid) : null,
    startingBid: r.starting_bid != null ? Number(r.starting_bid) : null,
    auctionEndsAt: r.auction_ends_at,
    buyNowPrice: r.buy_now_price != null ? Number(r.buy_now_price) : null,
    bidCount: r.bid_count ?? 0,
  }))
}

const route = useRoute()

function applyCategoryFromRoute () {
  const q = route.query.category
  if (q && typeof q === 'string') {
    selectedCategory.value = decodeURIComponent(q)
  }
}

onMounted(() => {
  applyCategoryFromRoute()
  loadListings()
})

watch(() => route.query.category, () => {
  applyCategoryFromRoute()
})

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
  if (selectedCondition.value) {
    results = results.filter((i) => i.condition === selectedCondition.value)
  }
  if (sortBy.value === 'newest') {
    results = [...results].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  if (sortBy.value === 'price-low') {
    results = [...results].sort((a, b) => a.price - b.price)
  }
  if (sortBy.value === 'price-high') {
    results = [...results].sort((a, b) => b.price - a.price)
  }
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
.charity-badge {
  left: auto;
  right: 10px;
  background: rgba(0, 245, 160, 0.9);
  color: #0c0619;
}
.auction-badge {
  top: auto;
  bottom: 10px;
  left: 10px;
  background: rgba(234, 88, 12, 0.92);
  color: #fff;
}
.listing-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
.listing-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 4px 0 10px;
  color: #111827;
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
.listing-seller { font-size: 0.8rem; margin-top: 6px; }
.listing-condition-tag {
  font-size: 0.7rem; font-weight: 600; text-transform: capitalize;
  padding: 2px 8px; border-radius: 999px;
  background: rgba(0, 224, 255, 0.08); color: var(--cyan); border: 1px solid rgba(0, 224, 255, 0.2);
}

.empty-state { padding: 60px 0; }
.browse-title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.browse-count-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: 999px;
  font-size: 0.75rem; font-weight: 700;
  background: rgba(0, 245, 160, 0.1); color: var(--trust-green); border: 1px solid rgba(0, 245, 160, 0.3);
}
</style>
