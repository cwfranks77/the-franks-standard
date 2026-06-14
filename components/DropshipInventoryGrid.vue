<script setup>
import { processCatalogArrays } from '~/utils/dropshipCatalogs.js'

const props = defineProps({
  /** Raw catalog array(s) — flattened and normalized automatically */
  catalogs: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Dropship inventory — live partner catalog',
  },
  subtitle: {
    type: String,
    default: 'Automated fulfillment from verified wholesale partners.',
  },
  /** When true, show Buy Now and emit @buy instead of linking to store */
  interactive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['buy'])

const selectedCategory = ref('All')

const processedItems = computed(() => processCatalogArrays(props.catalogs))

const categories = computed(() => {
  const set = new Set(processedItems.value.map((i) => i.category).filter(Boolean))
  return ['All', ...Array.from(set)]
})

const filteredItems = computed(() => {
  if (selectedCategory.value === 'All') return processedItems.value
  return processedItems.value.filter((i) => i.category === selectedCategory.value)
})
</script>

<template>
  <section class="dropship-grid-section" aria-labelledby="dropship-grid-heading">
    <div class="container">
      <header class="dropship-grid-header">
        <p class="dropship-grid-eyebrow">Automated dropship</p>
        <h2 id="dropship-grid-heading" class="dropship-grid-title">{{ title }}</h2>
        <p class="dropship-grid-sub">{{ subtitle }}</p>
      </header>

      <div v-if="categories.length > 1" class="dropship-grid-filters">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="dropship-filter-btn"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="filteredItems.length" class="dropship-grid">
        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="dropship-card"
        >
          <div class="dropship-card__img-wrap">
            <img :src="item.image || '/img/hero-showcase-v2.svg'" :alt="item.name" class="dropship-card__img" loading="lazy">
            <span v-if="item.badge" class="dropship-card__badge">{{ item.badge }}</span>
          </div>
          <div class="dropship-card__body">
            <p class="dropship-card__brand">{{ item.brand }}</p>
            <h3 class="dropship-card__name">{{ item.name }}</h3>
            <p class="dropship-card__tagline">{{ item.tagline }}</p>
            <p class="dropship-card__store">
              <span class="dropship-card__store-dot" :style="{ background: item.accent }" />
              {{ item.storeName }}
            </p>
            <div class="dropship-card__footer">
              <span class="dropship-card__price">{{ item.formattedPrice }}</span>
              <button
                v-if="interactive"
                type="button"
                class="dropship-card__cta"
                @click="emit('buy', item)"
              >
                Buy now
              </button>
              <NuxtLink v-else :to="item.storePath || '/shop'" class="dropship-card__cta">
                View store
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <p v-else class="dropship-grid-empty">No catalog items in this category yet.</p>
    </div>
  </section>
</template>

<style scoped>
.dropship-grid-section {
  padding: 56px 0;
  background: linear-gradient(180deg, #0a0a0c 0%, #121216 100%);
  border-top: 1px solid rgba(211, 47, 47, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.dropship-grid-header {
  max-width: 720px;
  margin-bottom: 28px;
}
.dropship-grid-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #d32f2f;
  margin: 0 0 10px;
}
.dropship-grid-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: #f5f5f7;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}
.dropship-grid-sub {
  color: #7a8190;
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0;
}
.dropship-grid-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.dropship-filter-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #16161c;
  color: #b8bcc6;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.15s;
}
.dropship-filter-btn:hover {
  border-color: rgba(211, 47, 47, 0.4);
  color: #f5f5f7;
}
.dropship-filter-btn.active {
  background: #d32f2f;
  border-color: #d32f2f;
  color: #fff;
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.35);
}
.dropship-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.dropship-card {
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.dropship-card:hover {
  transform: translateY(-4px);
  border-color: rgba(211, 47, 47, 0.4);
  box-shadow: 0 12px 40px rgba(211, 47, 47, 0.12);
}
.dropship-card__img-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #0a0a0c;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dropship-card__img {
  max-height: 80%;
  max-width: 80%;
  object-fit: contain;
}
.dropship-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(10, 10, 12, 0.9);
  border: 1px solid rgba(211, 47, 47, 0.5);
  color: #ff5252;
}
.dropship-card__body {
  padding: 18px;
}
.dropship-card__brand {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d32f2f;
  margin: 0 0 6px;
}
.dropship-card__name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #f5f5f7;
  margin: 0 0 6px;
  line-height: 1.25;
}
.dropship-card__tagline {
  font-size: 0.78rem;
  color: #7a8190;
  margin: 0 0 12px;
  line-height: 1.4;
}
.dropship-card__store {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #b8bcc6;
  margin: 0 0 14px;
}
.dropship-card__store-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dropship-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.dropship-card__price {
  font-size: 1.25rem;
  font-weight: 900;
  color: #f5f5f7;
}
.dropship-card__cta {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 8px 14px;
  border-radius: 8px;
  background: #d32f2f;
  color: #fff !important;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.dropship-card__cta:hover {
  background: #ff5252;
  color: #fff !important;
}
.dropship-grid-empty {
  text-align: center;
  color: #7a8190;
  padding: 40px 0;
}
</style>
