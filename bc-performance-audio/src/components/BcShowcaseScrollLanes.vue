<script setup>
import {
  bcAudioDepartmentKey,
  bcAudioDepartmentLabel,
} from '~/utils/bcAudioOnlyCatalog.js'
import {
  fixPetraImageUrl,
  petraImageUrlFromSku,
  resolveBcProductImage,
} from '~/utils/bcProductImage.js'

const props = defineProps({
  products: { type: Array, default: () => [] },
})

const SCROLL_IMAGE_FALLBACK = '/img/hero-showcase-v2.svg'

const SHOWCASE_LANE_DEFS = [
  {
    deptKey: 'car',
    laneIndex: 0,
    title: 'Car Audio',
    description: 'Speakers, subwoofers, amplifiers, and wiring for street and competition installs.',
  },
  {
    deptKey: 'powersports',
    laneIndex: 1,
    title: 'Marine Audio',
    description: 'Marine and powersports speakers and amps for trail, boat, and offshore builds.',
  },
  {
    deptKey: 'home',
    laneIndex: 2,
    title: 'Home Audio',
    description: 'Receivers, speakers, amplifiers, and soundbars from authorized lines.',
  },
]

function getProductId (product) {
  if (!product) return ''
  return String(product.id || product.sku || product.vendorSku || product.code || product.slug || product.name || '')
}

function getProductName (product) {
  if (!product) return 'Product'
  return product.name || product.title || 'Product'
}

function getProductSku (product) {
  if (!product) return ''
  return product.sku || product.vendorSku || ''
}

function getProductImage (product) {
  return resolveBcProductImage(product)
}

function laneMatchesProduct (deptKey, product) {
  return bcAudioDepartmentKey(product) === deptKey
}

function pushTile (tiles, seen, product) {
  const productId = getProductId(product)
  if (!productId || seen.has(productId)) return
  const url = getProductImage(product)
  if (!url) return
  seen.add(productId)
  tiles.push({
    productId,
    url,
    alt: getProductName(product),
    sku: getProductSku(product),
  })
}

function buildLaneTiles (deptKey, perLane = 28) {
  const tiles = []
  const seen = new Set()
  const withImages = props.products.filter((product) => getProductImage(product))
  const deptProducts = withImages.filter((product) => laneMatchesProduct(deptKey, product))

  for (const product of deptProducts) {
    pushTile(tiles, seen, product)
    if (tiles.length >= perLane) return tiles
  }

  return tiles
}

const showcaseLanes = computed(() =>
  SHOWCASE_LANE_DEFS.map((lane) => ({
    ...lane,
    tiles: buildLaneTiles(lane.deptKey),
  })).filter((lane) => lane.tiles.length > 0),
)

function onScrollImageError (event, tile) {
  const img = event?.target
  if (!img || !tile) return
  const fixed = fixPetraImageUrl(tile.url) || petraImageUrlFromSku(tile.sku)
  if (fixed && img.src !== fixed) {
    img.src = fixed
    return
  }
  if (!img.src.endsWith(SCROLL_IMAGE_FALLBACK)) {
    img.src = SCROLL_IMAGE_FALLBACK
  }
}

function openProductFromTile (tile) {
  if (!tile?.productId) return
  navigateTo(`/bc-audio/product/${encodeURIComponent(tile.productId)}`)
}
</script>

<template>
  <div v-if="showcaseLanes.length" class="bc-showcase-stack" aria-label="Featured product showcases">
    <section
      v-for="lane in showcaseLanes"
      :key="lane.deptKey"
      class="bc-showcase"
    >
      <header class="bc-showcase__head">
        <div>
          <p class="bc-showcase__eyebrow">{{ bcAudioDepartmentLabel(lane.deptKey) }}</p>
          <h3 class="bc-showcase__title">{{ lane.title }}</h3>
          <p class="bc-showcase__desc">{{ lane.description }}</p>
        </div>
      </header>

      <div
        class="bc-scroll"
        :class="`bc-scroll--lane-${lane.laneIndex}`"
        :aria-label="`${lane.title} catalog images`"
      >
        <div class="bc-scroll__fade bc-scroll__fade--left" />
        <div class="bc-scroll__fade bc-scroll__fade--right" />
        <div class="bc-scroll__track">
          <div class="bc-scroll__row">
            <figure
              v-for="(tile, i) in lane.tiles"
              :key="`a-${lane.deptKey}-${i}-${tile.productId}`"
              class="bc-scroll__cell"
              role="button"
              tabindex="0"
              @click="openProductFromTile(tile)"
              @keydown.enter="openProductFromTile(tile)"
            >
              <div class="bc-scroll__img-wrap">
                <img
                  :src="tile.url"
                  :alt="tile.alt"
                  class="bc-scroll__img"
                  loading="eager"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="onScrollImageError($event, tile)"
                >
              </div>
            </figure>
          </div>
          <div class="bc-scroll__row" aria-hidden="true">
            <figure
              v-for="(tile, i) in lane.tiles"
              :key="`b-${lane.deptKey}-${i}-${tile.productId}`"
              class="bc-scroll__cell"
              role="button"
              tabindex="-1"
              aria-hidden="true"
              @click="openProductFromTile(tile)"
            >
              <div class="bc-scroll__img-wrap">
                <img
                  :src="tile.url"
                  :alt="tile.alt"
                  class="bc-scroll__img"
                  loading="eager"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="onScrollImageError($event, tile)"
                >
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bc-showcase-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
}

.bc-showcase {
  border-radius: 1.25rem;
  border: 1px solid rgba(211, 47, 47, 0.2);
  background: linear-gradient(180deg, rgba(23, 23, 23, 0.9) 0%, #0f0f0f 100%);
  overflow: hidden;
}

.bc-showcase__head {
  padding: 1.25rem 1.25rem 0.85rem;
}

.bc-showcase__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ff5252;
}

.bc-showcase__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bc-showcase__desc {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: #a3a3a3;
}

.bc-scroll {
  position: relative;
  overflow: hidden;
  padding: 0.85rem 0 1rem;
}

.bc-scroll__fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4rem;
  z-index: 2;
  pointer-events: none;
}

.bc-scroll__fade--left {
  left: 0;
  background: linear-gradient(90deg, #0f0f0f, transparent);
}

.bc-scroll__fade--right {
  right: 0;
  background: linear-gradient(270deg, #0f0f0f, transparent);
}

.bc-scroll__track {
  display: flex;
  width: max-content;
  animation: bcShowcaseScroll 50s linear infinite;
}

.bc-scroll--lane-1 .bc-scroll__track {
  animation-duration: 58s;
  animation-direction: reverse;
}

.bc-scroll--lane-2 .bc-scroll__track {
  animation-duration: 66s;
}

.bc-scroll__row {
  display: flex;
  gap: 0.85rem;
  padding: 0 0.5rem;
}

.bc-scroll__cell {
  margin: 0;
  flex: 0 0 auto;
  width: 9.5rem;
  border-radius: 0.85rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #171717;
  cursor: pointer;
}

.bc-scroll__cell:focus-visible {
  outline: 2px solid #ff5252;
  outline-offset: 2px;
}

.bc-scroll__img-wrap {
  height: 7.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
}

.bc-scroll__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

@keyframes bcShowcaseScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (max-width: 640px) {
  .bc-scroll__cell {
    width: 7rem;
  }

  .bc-scroll__img-wrap {
    height: 5.5rem;
  }
}
</style>
