<template>
  <section class="home-browse section home-browse-alive" aria-labelledby="home-browse-title">
    <div class="container">
      <header class="home-browse-head">
        <div>
          <p class="home-browse-live">
            <span class="live-dot" aria-hidden="true" />
            Live floor preview
          </p>
          <h2 id="home-browse-title" class="section-title">On the floor right now</h2>
          <p class="section-subtitle text-muted">
            Tap a category to browse that niche — every public listing is COA- or guarantee-backed.
            <NuxtLink v-if="liveListingCount > 0" to="/browse" class="live-count-link">{{ liveListingCount }} live listing{{ liveListingCount === 1 ? '' : 's' }} on the floor now →</NuxtLink>
          </p>
        </div>
        <NuxtLink to="/browse" class="action-tile action-tile--primary home-browse-cta">Browse marketplace</NuxtLink>
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
              width="320"
              height="320"
            />
          </div>
          <div class="home-browse-meta">
            <p class="home-browse-cat">{{ item.category }}</p>
            <h3>{{ item.title }}</h3>
            <p class="home-browse-sample-hint">Browse this category →</p>
          </div>
        </NuxtLink>
      </div>

      <div class="action-dock home-browse-foot">
        <NuxtLink to="/browse" class="action-tile action-tile--dark">
          <span class="action-tile-label">Browse all listings →</span>
          <span class="action-tile-hint">COA or guarantee on every item</span>
        </NuxtLink>
        <NuxtLink to="/sell" class="action-tile action-tile--primary">
          <span class="action-tile-label">List your item</span>
          <span class="action-tile-hint">Free to list · escrow checkout</span>
        </NuxtLink>
        <NuxtLink to="/sell/import" class="action-tile action-tile--accent">
          <span class="action-tile-label">Import from eBay</span>
          <span class="action-tile-hint">Bring your catalog here</span>
        </NuxtLink>
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

const supabase = useSupabaseClient()

function buildSampleItems (count = 8) {
  return shuffleItems(HOME_BROWSE_SAMPLES).slice(0, count).map(mapSample)
}

const displayItems = ref(buildSampleItems())
const liveListingCount = ref(0)

function mapSample (row) {
  return {
    ...row,
    to: browseLinkForCategory(row.category),
    isSample: true,
    fallbackImage: row.image,
  }
}

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
  background: linear-gradient(180deg, rgba(0, 224, 255, 0.05) 0%, transparent 55%);
  padding-top: 48px;
  padding-bottom: 56px;
  position: relative;
}
.home-browse-alive::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.45), rgba(0, 224, 255, 0.35), transparent);
  pointer-events: none;
}
.home-browse-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 24px;
  margin-bottom: 28px;
}
.home-browse-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--trust-green, #00f5a0);
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--trust-green, #00f5a0);
  box-shadow: 0 0 0 0 rgba(0, 245, 160, 0.55);
  animation: live-pulse 2s ease-out infinite;
}
@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 245, 160, 0.55); }
  70% { box-shadow: 0 0 0 10px rgba(0, 245, 160, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 245, 160, 0); }
}
.home-browse-head .section-title { margin-bottom: 8px; text-align: left; }
.home-browse-head .section-subtitle { text-align: left; max-width: 560px; margin: 0; }
.sample-note { display: block; margin-top: 6px; font-size: 0.88rem; font-style: italic; }
.live-count-link {
  display: block;
  margin-top: 8px;
  font-weight: 700;
  color: #146eb4;
  text-decoration: none;
}
.live-count-link:hover { text-decoration: underline; }
.home-browse-cta {
  flex-shrink: 0;
  text-decoration: none;
  min-width: 180px;
}
.home-browse-foot {
  margin-top: 32px;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}
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
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
  animation: card-rise 0.55s ease both;
  animation-delay: calc(var(--card-i, 0) * 55ms);
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.home-browse-card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 168, 76, 0.65);
  box-shadow: 0 16px 40px rgba(201, 168, 76, 0.14), 0 8px 24px rgba(0, 0, 0, 0.1);
}
.home-browse-img-wrap {
  position: relative;
  aspect-ratio: 1;
  background: linear-gradient(145deg, #111827 0%, #1f2937 100%);
  overflow: hidden;
}
.home-browse-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}
.home-browse-card:hover .home-browse-img-wrap img {
  transform: scale(1.04);
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
.home-browse-sample-hint {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #146eb4;
}
@media (prefers-reduced-motion: reduce) {
  .home-browse-card { animation: none; }
  .live-dot { animation: none; }
  .home-browse-card:hover .home-browse-img-wrap img { transform: none; }
}
</style>
