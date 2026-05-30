<template>
  <div class="browse-page">
    <div class="container">
      <div class="browse-header">
        <div class="browse-title-row">
          <h1>Browse Marketplace</h1>
          <span v-if="listings.length" class="browse-count-badge">{{ listings.length }} {{ listings.length === 1 ? 'listing' : 'listings' }} live</span>
        </div>
        <p class="text-muted">
          Live inventory from sellers and shops. Collectible listings show seller-provided proof; we facilitate sales and enforce policies — we do not guarantee authenticity.
          <NuxtLink to="/sellers">Apply to add your store</NuxtLink>.
          · <NuxtLink to="/collections">Niche collections &amp; limited drops</NuxtLink>
        </p>
        <p v-if="filterBanner" class="filter-banner">{{ filterBanner }}</p>
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
            <span class="coa-badge listing-coa">{{ item.coaSerial ? `COA ${item.coaSerial}` : 'COA Verified' }}</span>
            <span v-if="item.saleType === 'auction'" class="auction-badge listing-coa">
              {{ item.buyNowPrice ? 'Auction + BIN' : 'Auction' }}
            </span>
            <span v-if="item.donateProceeds" class="charity-badge listing-coa">
              {{ item.charityPercent >= 100 ? 'Charity' : `${item.charityPercent}% charity` }}
            </span>
            <span v-if="item.limitedLabel" class="limited-badge listing-coa">{{ item.limitedLabel }}</span>
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
        <NuxtLink to="/sell/start" class="btn btn-primary mt-3">List Your First Item</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'
import {
  isLimitedEditionListing,
  limitedBadgeLabel,
  getNicheBySlug,
  getLimitedDropBySlug,
} from '~/utils/nicheCollections.js'

const { publicUrlForPath } = useListingImageUrl()
const supabase = useSupabaseClient()

const browseDockTiles = [
  { to: '/sell/start', icon: '📤', label: 'Sell an item', hint: 'Collectible or general', variant: 'primary' },
  { to: '/collections', icon: '✨', label: 'Collections', hint: 'Limited drops & niches', variant: 'accent' },
  { to: '/sell/import', icon: '📥', label: 'Import from eBay', hint: 'CSV or store link' },
  { to: '/join/founders10', icon: '🎁', label: 'FOUNDERS10', hint: '3 mo Pro free', variant: 'dark' },
]

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedCondition = ref('')
const sortBy = ref('newest')
const loadError = ref('')
const onlyLimited = ref(false)
const filterCollectionSlug = ref('')

const categories = LISTING_CATEGORIES

const listings = ref([])

const LISTING_SELECT_WITH_COLLECTIONS =
  'id, title, description, category, price, condition, coa_type, coa_serial_number, image_paths, created_at, donate_proceeds, charity_name, charity_percent, sale_type, current_bid, starting_bid, auction_ends_at, buy_now_price, bid_count, is_limited_edition, collection_slug, collection_label, integrity_status, seller:profiles!listings_seller_id_fkey(full_name)'

const LISTING_SELECT_BASE =
  'id, title, category, price, condition, coa_type, image_paths, created_at, donate_proceeds, charity_name, charity_percent, sale_type, current_bid, starting_bid, auction_ends_at, buy_now_price, bid_count, seller:profiles!listings_seller_id_fkey(full_name)'

async function loadListings() {
  loadError.value = ''
  let select = LISTING_SELECT_WITH_COLLECTIONS
  let { data, error } = await supabase
    .from('listings')
    .select(select)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error && /collection_|is_limited_edition/i.test(error.message || '')) {
    select = LISTING_SELECT_BASE
    ;({ data, error } = await supabase
      .from('listings')
      .select(select)
      .eq('status', 'published')
      .order('created_at', { ascending: false }))
  }

  if (error) {
    loadError.value = error.message
    return
  }
  const rows = (data || []).filter((r) => {
    const st = r.integrity_status || 'clear'
    return st === 'clear'
  })
  listings.value = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description || '',
    category: r.category,
    collectionSlug: r.collection_slug || '',
    isLimitedEdition: !!r.is_limited_edition,
    price: Number(r.price),
    condition: r.condition || '',
    coaType: r.coa_type,
    coaSerial: r.coa_serial_number || '',
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
    limitedLabel: limitedBadgeLabel(r),
    isLimited: isLimitedEditionListing(r),
  }))
}

const route = useRoute()

function applyFiltersFromRoute () {
  const q = route.query.category
  if (q && typeof q === 'string') {
    selectedCategory.value = decodeURIComponent(q)
  }
  onlyLimited.value = route.query.limited === '1' || route.query.limited === 'true'
  const coll = route.query.collection
  filterCollectionSlug.value = typeof coll === 'string' ? coll : ''
}

const filterBanner = computed(() => {
  if (onlyLimited.value) {
    return 'Limited-edition and exclusive-drop listings — seller proof where required, Stripe escrow on checkout.'
  }
  if (filterCollectionSlug.value) {
    const niche = getNicheBySlug(filterCollectionSlug.value)
    const drop = getLimitedDropBySlug(filterCollectionSlug.value)
    if (niche) return `Collection: ${niche.name} — ${niche.tagline}`
    if (drop) return `Floor drop: ${drop.label}`
  }
  return ''
})

onMounted(() => {
  applyFiltersFromRoute()
  loadListings()
})

watch(() => [route.query.category, route.query.limited, route.query.collection], () => {
  applyFiltersFromRoute()
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
  if (onlyLimited.value) {
    results = results.filter((i) => i.isLimited)
  }
  if (filterCollectionSlug.value) {
    const drop = getLimitedDropBySlug(filterCollectionSlug.value)
    const niche = getNicheBySlug(filterCollectionSlug.value)
    results = results.filter((i) => {
      if (i.collectionSlug === filterCollectionSlug.value) return true
      if (niche) return i.category === niche.category
      if (drop?.categories?.includes(i.category)) {
        return onlyLimited.value ? i.isLimited : true
      }
      return false
    })
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
.filter-banner {
  margin-top: 10px;
  padding: 10px 14px;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(180, 83, 9, 0.35);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  max-width: 640px;
}
.limited-badge {
  top: auto;
  bottom: 8px;
  left: 8px;
  background: #92400e;
}

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
