<template>
  <div class="store-page">
    <div class="container">
      <div v-if="storeOnHold" class="store-hold card">
        <p class="eyebrow">Opening soon</p>
        <h1>{{ holdHeadline }}</h1>
        <p class="text-muted">{{ holdMessage }}</p>
        <p class="text-muted small">
          Switching from eBay or another marketplace?
          <NuxtLink to="/sellers/switch?from=ebay">See our easy transition guide</NuxtLink>.
        </p>
        <div class="store-actions mt-3">
          <NuxtLink to="/browse" class="btn btn-primary btn-sm">Browse marketplace</NuxtLink>
          <NuxtLink to="/sellers/switch" class="btn btn-outline btn-sm">Seller switching guide</NuxtLink>
        </div>
      </div>

      <header v-else-if="store" class="store-hero">
        <p class="eyebrow">Seller storefront</p>
        <h1>{{ store.displayName }}</h1>
        <p class="text-muted store-tagline">
          Tactical, hunting, fishing, and outdoor gear — checkout and buyer protection on
          <NuxtLink to="/">The Franks Standard</NuxtLink>.
        </p>
        <p v-if="sellerStats.review_count" class="store-rating">
          <strong>{{ Number(sellerStats.rating_avg).toFixed(1) }}</strong>★ seller rating
          · {{ sellerStats.review_count }} review{{ sellerStats.review_count === 1 ? '' : 's' }}
          <span v-if="sellerStats.completed_sales"> · {{ sellerStats.completed_sales }} completed sales</span>
        </p>
        <p class="store-contact text-muted small">
          Buyer questions go through the marketplace — escrow checkout and Video Call on listings. Off-platform deals are not allowed.
        </p>
        <div class="store-actions">
          <NuxtLink to="/browse" class="btn btn-outline btn-sm">All marketplace</NuxtLink>
          <a :href="platformStoreMailto" class="btn btn-outline btn-sm">Message store (via platform)</a>
        </div>
      </header>

      <p v-else-if="!loading && notFound" class="text-muted">
        Store not found. <NuxtLink to="/browse">Browse the marketplace</NuxtLink>.
      </p>

      <p v-if="loadError" class="text-muted">{{ loadError }}</p>

      <div v-if="store && !storeOnHold" class="browse-filters mt-3">
        <input
          v-model="searchQuery"
          type="search"
          class="input search-input"
          placeholder="Search this store..."
        />
      </div>

      <div v-if="store && !storeOnHold && filteredListings.length" class="grid grid-4 mt-4">
        <NuxtLink
          v-for="item in filteredListings"
          :key="item.id"
          :to="`/listing/${item.id}`"
          class="listing-card card"
        >
          <div class="listing-image">
            <img
              :src="item.image"
              :alt="item.title"
              :data-category="item.category"
              loading="lazy"
              @error="onListingImageError"
            />
            <span class="coa-badge listing-coa">COA Verified</span>
          </div>
          <div class="card-body">
            <p class="listing-category text-muted">{{ item.category }}</p>
            <h3 class="listing-title">{{ item.title }}</h3>
            <div class="listing-footer">
              <span class="listing-price">${{ item.price.toLocaleString() }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="store && !storeOnHold && !loading" class="empty-state text-center mt-4">
        <h3>No listings yet</h3>
        <p class="text-muted">Check back soon — new gear is being added.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  resolveStoreSlug,
  isBrandyStoreOnHold,
  BRANDY_HOLD_HEADLINE,
  BRANDY_HOLD_MESSAGE,
} from '~/utils/storeSlug'
import { onListingImageError } from '~/utils/marketplaceShowcaseImages.js'

const route = useRoute()
const { publicUrlForPath } = useListingImageUrl()
const supabase = useSupabaseClient()

const loading = ref(true)
const notFound = ref(false)
const loadError = ref('')
const store = ref(null)
const listings = ref([])
const searchQuery = ref('')
const sellerStats = ref({ rating_avg: 0, review_count: 0, completed_sales: 0 })

const canonicalSlug = computed(() => resolveStoreSlug(route.params.slug))
const storeOnHold = computed(() => isBrandyStoreOnHold(canonicalSlug.value))
const holdHeadline = BRANDY_HOLD_HEADLINE
const holdMessage = BRANDY_HOLD_MESSAGE

const platformStoreMailto = computed(() => {
  if (!store.value?.displayName) return 'mailto:info@thefranksstandard.com'
  const subject = encodeURIComponent(`Store question: ${store.value.displayName}`)
  const body = encodeURIComponent(
    `Hi,\n\nI have a question about the store "${store.value.displayName}" on The Franks Standard.\n\n`,
  )
  return `mailto:info@thefranksstandard.com?subject=${subject}&body=${body}`
})

const filteredListings = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return listings.value
  return listings.value.filter(
    (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
  )
})

useSeoMeta({
  title: () =>
    storeOnHold.value
      ? "Brandy's Sporting Goods — opening soon"
      : store.value
        ? `${store.value.displayName} — The Franks Standard`
        : 'Store',
  description: () =>
    storeOnHold.value
      ? 'Brandy\'s Sporting Goods on The Franks Standard — catalog opening soon. Browse the marketplace meanwhile.'
      : store.value
        ? `Shop ${store.value.displayName} on The Franks Standard — tactical, outdoor, and hunting gear.`
        : 'Seller storefront on The Franks Standard',
})

async function loadStore () {
  loading.value = true
  loadError.value = ''
  notFound.value = false
  store.value = null
  listings.value = []

  const slug = canonicalSlug.value
  if (!slug) {
    notFound.value = true
    loading.value = false
    return
  }

  if (storeOnHold.value) {
    store.value = { displayName: "Brandy's Sporting Goods", contactEmail: null }
    loading.value = false
    return
  }

  const { data: profile, error: pErr } = await supabase
    .from('public_store_profiles')
    .select('id, full_name, store_name, store_slug')
    .eq('store_slug', slug)
    .maybeSingle()

  if (pErr) {
    loadError.value = pErr.message
    loading.value = false
    return
  }
  if (!profile) {
    notFound.value = true
    loading.value = false
    return
  }

  let contactEmail = null
  const { data: ds } = await supabase
    .from('seller_dropship_settings')
    .select('store_contact_email')
    .eq('seller_id', profile.id)
    .maybeSingle()
  if (ds?.store_contact_email) contactEmail = ds.store_contact_email

  store.value = {
    id: profile.id,
    displayName: profile.store_name || profile.full_name || 'Store',
    contactEmail,
  }

  const { data: lb } = await supabase
    .from('seller_leaderboard')
    .select('rating_avg, review_count, completed_sales')
    .eq('seller_id', profile.id)
    .maybeSingle()
  if (lb) {
    sellerStats.value = {
      rating_avg: lb.rating_avg ?? 0,
      review_count: lb.review_count ?? 0,
      completed_sales: lb.completed_sales ?? 0,
    }
  } else {
    sellerStats.value = { rating_avg: 0, review_count: 0, completed_sales: 0 }
  }

  const { data: rows, error: lErr } = await supabase
    .from('listings')
    .select('id, title, category, price, condition, image_paths, created_at')
    .eq('seller_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (lErr) {
    loadError.value = lErr.message
  } else {
    listings.value = (rows || []).map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      price: Number(r.price),
      image: publicUrlForPath(r.image_paths?.[0]),
    }))
  }
  loading.value = false
}

onMounted(loadStore)
watch(canonicalSlug, loadStore)
</script>

<style scoped>
.store-page { padding: 40px 0 64px; }
.store-hold {
  max-width: 720px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(201, 168, 76, 0.35);
}
.store-hold .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #00f5a0;
  font-weight: 700;
  margin: 0 0 8px;
}
.store-hero { margin-bottom: 8px; max-width: 720px; }
.store-hero h1 { margin: 8px 0; }
.store-tagline { margin-bottom: 12px; }
.store-rating { margin: 0 0 10px; font-size: 0.92rem; color: var(--gold); }
.store-rating strong { font-size: 1.1rem; }
.store-contact { margin-bottom: 16px; }
.store-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.search-input { max-width: 420px; }
</style>
