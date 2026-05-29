<template>
  <section class="floor-hub" aria-labelledby="floor-hub-title">
    <div class="container">
      <header class="floor-hub-head">
        <h2 id="floor-hub-title" class="floor-hub-title">The Standard in one glance</h2>
        <p class="floor-hub-lead text-muted">
          What sets us apart, what we are built on, and where to go — links only, room left for offers and features.
        </p>
      </header>

      <div class="floor-built-on" aria-label="What we are built on">
        <span class="floor-label">Built on</span>
        <div class="floor-pills">
          <NuxtLink
            v-for="p in builtOn"
            :key="p.label"
            :to="p.to"
            class="floor-pill"
          >
            {{ p.label }}
          </NuxtLink>
        </div>
      </div>

      <div class="floor-main">
        <div class="floor-apart">
          <h3 class="floor-block-title">What sets us apart</h3>
          <ul class="floor-link-list">
            <li v-for="d in apartLinks" :key="d.id">
              <NuxtLink :to="d.to" class="floor-apart-link">
                <span class="floor-apart-icon" aria-hidden="true">{{ d.icon }}</span>
                <span class="floor-apart-text">
                  <strong>{{ d.title }}</strong>
                  <span class="floor-apart-short">{{ d.short }}</span>
                </span>
                <span class="floor-apart-arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </li>
          </ul>
          <p class="floor-more">
            <NuxtLink to="/compare">Compare to other marketplaces</NuxtLink>
            ·
            <NuxtLink to="/marketplace-policy">Marketplace policies</NuxtLink>
          </p>
        </div>

        <aside class="floor-aside" aria-label="Offers and featured">
          <h3 class="floor-block-title">Offers &amp; highlights</h3>
          <ul class="floor-ad-list">
            <li v-for="ad in offerAds" :key="ad.id">
              <NuxtLink :to="ad.to" class="floor-ad-link" :class="`floor-ad-link--${ad.tone}`">
                <span class="floor-ad-code">{{ ad.code }}</span>
                <span class="floor-ad-line">{{ ad.line }}</span>
                <span v-if="ad.id === 'founders10' && foundingSpots != null" class="floor-ad-meta">
                  {{ foundingSpots }} of 10 spots left
                </span>
              </NuxtLink>
            </li>
          </ul>
          <div class="floor-feature-slot" aria-label="Featured on the floor">
            <p class="floor-label">On the floor now</p>
            <div class="floor-feature-chips">
              <NuxtLink to="/browse" class="floor-feature-chip floor-feature-chip--primary">
                Browse listings →
              </NuxtLink>
              <NuxtLink to="/collections" class="floor-feature-chip">Collections</NuxtLink>
              <NuxtLink to="/launch-offer" class="floor-feature-chip">3% launch fees</NuxtLink>
            </div>
          </div>
        </aside>
      </div>

      <div class="floor-use-now">
        <div class="floor-use-head">
          <h3 class="floor-block-title">Use now</h3>
          <div class="floor-feature-tabs" role="tablist" aria-label="Features by role">
            <button
              v-for="t in featureTabs"
              :id="`floor-tab-${t.id}`"
              :key="t.id"
              type="button"
              role="tab"
              class="floor-feature-tab"
              :class="{ active: activeTab === t.id }"
              :aria-selected="activeTab === t.id"
              @click="activeTab = t.id"
            >
              {{ t.icon }} {{ t.label }}
            </button>
          </div>
        </div>
        <div
          v-for="t in featureTabs"
          :id="`floor-panel-${t.id}`"
          :key="`panel-${t.id}`"
          role="tabpanel"
          class="floor-feature-panel"
          :hidden="activeTab !== t.id"
        >
          <NuxtLink
            v-for="f in featuresForTab(t.id)"
            :key="f.title"
            :to="f.to"
            class="floor-feature-link"
          >
            {{ f.title }} →
          </NuxtLink>
        </div>
      </div>

      <div class="floor-nav-cloud" aria-label="Shop and tools">
        <span class="floor-label">Shop &amp; tools</span>
        <p class="floor-nav-line">
          <template v-for="(c, i) in categoryLinks" :key="c.label">
            <span v-if="i > 0" class="floor-sep" aria-hidden="true"> · </span>
            <NuxtLink :to="c.to" class="floor-nav-chip">{{ c.label }}</NuxtLink>
          </template>
        </p>
        <p class="floor-nav-line floor-nav-tools">
          <NuxtLink to="/browse">Browse</NuxtLink><span class="floor-sep"> · </span>
          <NuxtLink to="/sell">Sell</NuxtLink><span class="floor-sep"> · </span>
          <NuxtLink to="/sell/import">Import eBay</NuxtLink><span class="floor-sep"> · </span>
          <NuxtLink to="/video">Video</NuxtLink><span class="floor-sep"> · </span>
          <NuxtLink to="/protection">Protection</NuxtLink><span class="floor-sep"> · </span>
          <NuxtLink to="/pricing">Pricing</NuxtLink><span class="floor-sep"> · </span>
          <NuxtLink to="/categories">All categories</NuxtLink>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  HOME_BUILT_ON,
  HOME_APART_LINKS,
  HOME_OFFER_ADS,
  LIVE_NOW_TABS,
  LIVE_NOW_BY_TAB,
  homeCategoryLinks,
} from '~/utils/homeFloorContent.js'

const builtOn = HOME_BUILT_ON
const apartLinks = HOME_APART_LINKS
const offerAds = HOME_OFFER_ADS
const featureTabs = LIVE_NOW_TABS
const categoryLinks = homeCategoryLinks()
const activeTab = ref('buyers')

const { fetchAvailability } = usePromoCode()
const foundingSpots = ref(null)

onMounted(async () => {
  const avail = await fetchAvailability('founders10')
  if (avail?.remaining != null) foundingSpots.value = avail.remaining
})

function featuresForTab (id) {
  return LIVE_NOW_BY_TAB[id] || []
}
</script>
