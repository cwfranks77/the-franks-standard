<template>
  <section class="home-browse section" aria-labelledby="home-browse-title">
    <div class="container">
      <header class="home-browse-head">
        <div class="home-browse-head-text">
          <p class="home-browse-live">
            <span class="live-dot" aria-hidden="true" />
            Live floor
          </p>
          <h2 id="home-browse-title" class="section-title">Trending on the floor</h2>
          <p class="section-subtitle text-muted">
            <NuxtLink v-if="liveListingCount > 0" to="/browse" class="live-count-link">
              {{ liveListingCount }} listing{{ liveListingCount === 1 ? '' : 's' }} live
            </NuxtLink>
            <span v-else>Browse by category — seller proof on collectibles</span>
          </p>
        </div>
        <NuxtLink to="/browse" class="mkt-btn mkt-btn--primary mkt-btn--compact">See all</NuxtLink>
      </header>

      <div class="home-browse-grid">
        <NuxtLink
          v-for="(item, idx) in displayItems"
          :key="item.id"
          :to="item.to"
          class="home-browse-card"
          :style="{ '--card-i': idx }"
        >
          <div class="home-browse-img-wrap">
            <img
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              width="200"
              height="160"
              :data-showcase-key="item.showcaseKey || ''"
              @error="onShowcaseImageError"
            />
          </div>
          <div class="home-browse-meta">
            <p class="home-browse-cat">{{ item.category }}</p>
            <h3>{{ item.title }}</h3>
          </div>
        </NuxtLink>
      </div>

      <div class="home-browse-links">
        <NuxtLink to="/browse" class="home-browse-link-chip">All listings</NuxtLink>
        <NuxtLink to="/categories" class="home-browse-link-chip">Categories</NuxtLink>
        <NuxtLink to="/sell/start" class="home-browse-link-chip">Start selling</NuxtLink>
        <NuxtLink to="/sell/import" class="home-browse-link-chip">Import eBay</NuxtLink>
        <NuxtLink to="/collections" class="home-browse-link-chip">Collections</NuxtLink>
        <NuxtLink to="/top-sellers" class="home-browse-link-chip">Top sellers</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  HOME_BROWSE_SAMPLES,
  shuffleItems,
  browseLinkForCategory,
} from '~/utils/homeBrowseSamples.js'
import { onShowcaseImageError } from '~/utils/marketplaceShowcaseImages.js'

const supabase = useSupabaseClient()

function buildSampleItems (count = 10) {
  return shuffleItems(HOME_BROWSE_SAMPLES).slice(0, count).map((row) => ({
    ...row,
    to: browseLinkForCategory(row.category),
  }))
}

const displayItems = ref(buildSampleItems())
const liveListingCount = ref(0)

async function loadLiveCount () {
  try {
    const { count, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
    if (!error && count != null) liveListingCount.value = count
  } catch {
    liveListingCount.value = 0
  }
}

onMounted(() => {
  displayItems.value = buildSampleItems()
  loadLiveCount()
})
</script>

<style scoped>
.home-browse {
  background: #f8fafc;
  padding: 40px 0 48px;
  border-top: 1px solid #e2e8f0;
}
.home-browse-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.home-browse-head .section-title {
  margin-bottom: 4px;
  text-align: left;
  font-size: 1.35rem;
}
.home-browse-head-text { flex: 1; min-width: 0; }
.home-browse-head .section-subtitle {
  text-align: left;
  margin: 0;
  font-size: 0.88rem;
}
.home-browse-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #059669;
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: live-pulse 2s ease-out infinite;
}
@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.live-count-link {
  font-weight: 700;
  color: #146eb4;
  text-decoration: none;
}
.live-count-link:hover { text-decoration: underline; }

.home-browse-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
@media (max-width: 1100px) {
  .home-browse-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 800px) {
  .home-browse-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 520px) {
  .home-browse-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

.home-browse-card {
  text-decoration: none;
  color: inherit;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.home-browse-card:hover {
  border-color: #c9a84c;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}
.home-browse-img-wrap {
  aspect-ratio: 4 / 3;
  background: #0f172a;
  overflow: hidden;
}
.home-browse-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.home-browse-meta {
  padding: 8px 10px 10px;
}
.home-browse-cat {
  margin: 0 0 2px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.home-browse-meta h3 {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-browse-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}
.home-browse-link-chip {
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e40af;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  text-decoration: none;
}
.home-browse-link-chip:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

@media (prefers-reduced-motion: reduce) {
  .live-dot { animation: none; }
}
</style>
