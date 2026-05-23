<template>
  <section class="home-browse section" aria-labelledby="home-browse-title">
    <div class="container">
      <header class="home-browse-head">
        <div>
          <h2 id="home-browse-title" class="section-title">On the floor right now</h2>
          <p class="section-subtitle text-muted">
            Real listings when sellers publish — every public item is COA- or guarantee-backed.
            <span v-if="usingSamples" class="sample-note">Showing sample categories until more inventory goes live.</span>
          </p>
        </div>
        <NuxtLink to="/browse" class="btn btn-primary btn-lg home-browse-cta">Browse marketplace</NuxtLink>
      </header>

      <div class="home-browse-grid">
        <NuxtLink
          v-for="item in displayItems"
          :key="item.id"
          :to="item.to"
          class="home-browse-card"
        >
          <div class="home-browse-img-wrap">
            <img
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              width="320"
              height="320"
              @error="onImgError($event, item)"
            />
            <span v-if="item.isSample" class="home-browse-sample-tag">Sample</span>
            <span v-else-if="item.saleType === 'auction'" class="home-browse-auction-tag">Auction</span>
            <span v-else class="home-browse-coa-tag">COA / guarantee</span>
          </div>
          <div class="home-browse-meta">
            <p class="home-browse-cat">{{ item.category }}</p>
            <h3>{{ item.title }}</h3>
            <p class="home-browse-price">
              <template v-if="item.saleType === 'auction'">
                {{ item.currentBid != null ? `$${formatPrice(item.currentBid)} bid` : `$${formatPrice(item.price)} start` }}
              </template>
              <template v-else>${{ formatPrice(item.price) }}</template>
            </p>
          </div>
        </NuxtLink>
      </div>

      <div class="home-browse-foot">
        <NuxtLink to="/browse" class="btn btn-dark btn-lg">Browse all listings →</NuxtLink>
        <NuxtLink to="/sell" class="btn btn-outline btn-lg">List your item</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { HOME_BROWSE_SAMPLES, shuffleItems } from '~/utils/homeBrowseSamples.js'

const { publicUrlForPath } = useListingImageUrl()
const supabase = useSupabaseClient()

function buildSampleItems (count = 8) {
  return shuffleItems(HOME_BROWSE_SAMPLES).slice(0, count).map(mapSample)
}

const loading = ref(false)
const displayItems = ref(buildSampleItems())
const usingSamples = ref(true)

function formatPrice (n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function onImgError (e, item) {
  const el = e?.target
  if (!el || el.dataset?.fallback) return
  el.dataset.fallback = '1'
  el.src = '/img/hero-showcase-v2.svg'
}

function mapListing (row) {
  const saleType = row.sale_type || 'fixed'
  const currentBid = row.current_bid != null ? Number(row.current_bid) : null
  return {
    id: row.id,
    title: row.title,
    category: row.category || 'Listing',
    price: Number(row.price),
    saleType,
    currentBid,
    image: publicUrlForPath(row.image_paths?.[0]),
    to: `/listing/${row.id}`,
    isSample: false,
  }
}

function mapSample (row) {
  return {
    ...row,
    to: '/browse',
    isSample: true,
  }
}

async function loadFloorPreview () {
  try {
    let { data, error } = await supabase
      .from('listings')
      .select('id, title, category, price, image_paths, sale_type, current_bid, starting_bid')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24)

    if (error) {
      const fallback = await supabase
        .from('listings')
        .select('id, title, category, price, image_paths')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(24)
      data = fallback.data
      error = fallback.error
    }

    let live = error ? [] : (data || []).map(mapListing)
    live = shuffleItems(live)

    const target = 8
    let items = live.slice(0, target)

    if (items.length < target) {
      const need = target - items.length
      const samples = shuffleItems(HOME_BROWSE_SAMPLES).slice(0, need).map(mapSample)
      items = shuffleItems([...items, ...samples])
      usingSamples.value = items.some((i) => i.isSample)
    } else {
      usingSamples.value = false
    }

    displayItems.value = items
  } catch {
    displayItems.value = buildSampleItems()
    usingSamples.value = true
  }
}

onMounted(() => {
  loadFloorPreview()
})
</script>

<style scoped>
.home-browse {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, transparent 100%);
  padding-top: 48px;
  padding-bottom: 56px;
}
.home-browse-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 24px;
  margin-bottom: 28px;
}
.home-browse-head .section-title { margin-bottom: 8px; text-align: left; }
.home-browse-head .section-subtitle { text-align: left; max-width: 560px; margin: 0; }
.sample-note { display: block; margin-top: 6px; font-size: 0.88rem; font-style: italic; }
.home-browse-cta { flex-shrink: 0; }
.home-browse-loading { padding: 48px 0; text-align: center; }
.home-browse-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .home-browse-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .home-browse-grid { grid-template-columns: 1fr; }
}
.home-browse-card {
  text-decoration: none;
  color: inherit;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(0, 224, 255, 0.22);
  background: #fff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.home-browse-card:hover {
  transform: translateY(-3px);
  border-color: rgba(201, 168, 76, 0.55);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.12);
}
.home-browse-img-wrap {
  position: relative;
  aspect-ratio: 1;
  background: #111827;
  overflow: hidden;
}
.home-browse-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.home-browse-coa-tag,
.home-browse-sample-tag,
.home-browse-auction-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
}
.home-browse-coa-tag {
  background: rgba(0, 0, 0, 0.72);
  color: var(--gold, #c9a84c);
}
.home-browse-sample-tag {
  background: rgba(255, 255, 255, 0.92);
  color: #374151;
}
.home-browse-auction-tag {
  background: rgba(234, 88, 12, 0.92);
  color: #fff;
}
.home-browse-meta { padding: 12px 14px 16px; }
.home-browse-cat {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin: 0 0 4px;
  font-weight: 700;
}
.home-browse-meta h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #111827;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.home-browse-price {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--gold, #c9a84c);
}
.home-browse-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
}
</style>
