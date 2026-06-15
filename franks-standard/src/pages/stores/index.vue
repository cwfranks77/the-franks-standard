<template>
  <div class="stores-page">
    <div class="container">
      <section class="stores-hero">
        <div class="stores-hero-copy">
          <p class="eyebrow">Stores & storefronts</p>
          <h1>Discover sellers opening on The Franks Standard</h1>
          <p class="text-muted">
            Find shops by name or category, then jump straight to their official Franks Standard storefront.
            We make new stores easy to find, whether you're browsing from the homepage or the marketplace.
          </p>
          <div class="stores-actions">
            <NuxtLink to="/browse" class="btn btn-outline btn-sm">Browse listings</NuxtLink>
            <NuxtLink to="/sellers" class="btn btn-primary btn-sm">Apply as a store</NuxtLink>
          </div>
        </div>
      </section>

      <section class="stores-search mt-4">
        <input
          v-model="searchQuery"
          type="search"
          class="input search-input"
          placeholder="Search stores by name or slug..."
          aria-label="Search stores"
        />
      </section>

      <div class="store-directory-grid mt-4">
        <NuxtLink
          v-for="store in filteredStores"
          :key="store.slug"
          :to="store.path || `/store/${store.slug}`"
          class="store-card card"
        >
          <div class="store-card-top">
            <span class="store-badge">STORE</span>
            <span v-if="store.onHold" class="store-status">Opening soon</span>
          </div>
          <h2>{{ store.displayName }}</h2>
          <p class="text-muted">{{ store.subhead }}</p>
          <div class="store-card-meta">
            <span class="store-slug">/store/{{ store.slug }}</span>
            <span v-if="store.stats" class="store-stats">• {{ store.stats.review_count }} reviews</span>
          </div>
        </NuxtLink>
      </div>

      <div v-if="!filteredStores.length" class="empty-state text-center mt-4">
        <p class="text-muted">No stores match that search yet. Try a broader seller name or return as more shops launch.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { resolveStoreSlug, isBrandyStoreOnHold } from '~/utils/storeSlug'

const supabase = useSupabaseClient()
const searchQuery = ref('')
const stores = ref([])
const loadError = ref('')

const defaultFeaturedStores = [
  {
    displayName: 'B&C Performance Audio',
    slug: 'bc-performance-audio',
    path: '/shop',
    subhead: 'Competition-grade audio — live dropship storefront with automated split-payment.',
    onHold: false,
    stats: null,
  },
  {
    displayName: "Brandy's Sporting Goods",
    slug: 'brandyssportinggoods',
    subhead: 'Opening soon on The Franks Standard — first storefront for authenticated gear.',
    onHold: true,
    stats: null,
  },
]

const filteredStores = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return stores.value
  return stores.value.filter((store) => {
    return (
      store.displayName.toLowerCase().includes(q) ||
      store.slug.toLowerCase().includes(q) ||
      store.subhead.toLowerCase().includes(q)
    )
  })
})

useSeoMeta({
  title: 'Store directory — The Franks Standard',
  description: 'Browse shops opening on The Franks Standard and visit seller storefronts on the marketplace.',
})

async function loadStores() {
  loadError.value = ''
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, store_name, store_slug')
    .neq('store_slug', '')
    .order('store_name', { ascending: true })

  if (error) {
    loadError.value = error.message
    stores.value = [...defaultFeaturedStores]
    return
  }

  const profiles = (data || []).map((profile) => {
    const slug = resolveStoreSlug(profile.store_slug)
    return {
      displayName: profile.store_name || profile.full_name || 'Store',
      slug,
      path: null,
      subhead: profile.store_name
        ? `Shop ${profile.store_name} on the marketplace.`
        : `Visit ${profile.full_name || 'this seller'} on The Franks Standard.`,
      onHold: isBrandyStoreOnHold(slug),
      stats: null,
    }
  })

  const unique = new Map()
  for (const store of [...defaultFeaturedStores, ...profiles]) {
    if (!store.slug) continue
    if (!unique.has(store.slug)) unique.set(store.slug, store)
  }
  stores.value = Array.from(unique.values())
}

onMounted(loadStores)
</script>

<style scoped>
.stores-page { padding: 40px 0; }
.stores-hero { padding: 32px 0; border: 1px solid rgba(37, 43, 52, 0.08); border-radius: 18px; background: rgba(255, 255, 255, 0.92); }
.stores-hero-copy { max-width: 760px; }
.stores-hero .eyebrow { text-transform: uppercase; letter-spacing: 0.18em; font-weight: 700; color: #111827; margin-bottom: 12px; }
.stores-hero h1 { margin: 0 0 16px; font-size: clamp(2rem, 2.4vw, 2.7rem); }
.stores-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.store-directory-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.store-card { display: block; padding: 22px; transition: transform 0.2s ease, box-shadow 0.2s ease; border: 1px solid rgba(16, 24, 40, 0.08); background: #ffffff; }
.store-card:hover { transform: translateY(-2px); box-shadow: 0 16px 45px rgba(15, 23, 42, 0.06); }
.store-card-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.store-badge { display: inline-flex; text-transform: uppercase; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.2em; color: #146eb4; }
.store-status { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-size: 0.78rem; color: #92400e; background: rgba(249, 115, 22, 0.12); }
.store-card h2 { margin: 0 0 10px; font-size: 1.2rem; }
.store-card-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.95rem; color: #6b7280; margin-top: 18px; }
.store-slug { font-weight: 700; }
</style>
