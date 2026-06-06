<script setup>
import { processCatalogArrays } from '~/utils/dropshipCatalogs.js'
import { BC_BRAND } from '~/utils/bcBrand.js'

const props = defineProps({
  catalogs: { type: Array, default: () => [] },
  selectedId: { type: String, default: null },
})

const emit = defineEmits(['select'])

const filter = ref('All')

const items = computed(() => processCatalogArrays(props.catalogs))

const categories = computed(() => {
  const set = new Set(items.value.map((i) => i.category).filter(Boolean))
  return ['All', ...Array.from(set)]
})

const visible = computed(() => {
  if (filter.value === 'All') return items.value
  return items.value.filter((i) => i.category === filter.value)
})

function selectItem (item) {
  emit('select', item)
}
</script>

<template>
  <div class="bc-catalog">
    <header class="bc-catalog__head">
      <p class="bc-catalog__eyebrow">{{ BC_BRAND.short }} dropship catalog</p>
      <h2 class="bc-catalog__title">Product grid</h2>
      <p class="bc-catalog__sub">Select a unit — order form updates on the right.</p>
    </header>

    <div v-if="categories.length > 1" class="bc-catalog__filters">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="bc-catalog__filter"
        :class="{ 'bc-catalog__filter--active': filter === cat }"
        @click="filter = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div class="bc-catalog__grid">
      <article
        v-for="item in visible"
        :key="item.id"
        class="bc-catalog__card"
        :class="{ 'bc-catalog__card--selected': selectedId === item.id }"
        @click="selectItem(item)"
      >
        <div class="bc-catalog__img-wrap">
          <img :src="item.image || '/img/hero-showcase-v2.svg'" :alt="item.name" loading="lazy">
          <span v-if="item.badge" class="bc-catalog__badge">{{ item.badge }}</span>
        </div>
        <div class="bc-catalog__body">
          <p class="bc-catalog__brand">{{ item.brand }}</p>
          <h3 class="bc-catalog__name">
            <NuxtLink :to="`/bc-audio/product/${item.id}`" class="bc-catalog__name-link" @click.stop>
              {{ item.name }}
            </NuxtLink>
          </h3>
          <p class="bc-catalog__tagline">{{ item.tagline }}</p>
          <ul v-if="item.specs?.length" class="bc-catalog__specs">
            <li v-for="spec in item.specs.slice(0, 3)" :key="spec">{{ spec }}</li>
          </ul>
          <div class="bc-catalog__foot">
            <span class="bc-catalog__price">{{ item.formattedPrice }}</span>
            <span class="bc-catalog__pick">{{ selectedId === item.id ? 'Selected' : 'Select' }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.bc-catalog__head { margin-bottom: 1.25rem; }
.bc-catalog__eyebrow {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #d32f2f;
  margin: 0 0 8px;
}
.bc-catalog__title {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 6px;
  color: #f5f5f7;
}
.bc-catalog__sub { margin: 0; font-size: 0.85rem; color: #7a8190; }

.bc-catalog__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1rem;
}
.bc-catalog__filter {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #16161c;
  color: #b8bcc6;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.bc-catalog__filter--active {
  background: #d32f2f;
  border-color: #d32f2f;
  color: #fff;
  box-shadow: 0 0 16px rgba(211, 47, 47, 0.35);
}

.bc-catalog__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 640px) {
  .bc-catalog__grid { grid-template-columns: repeat(2, 1fr); }
}

.bc-catalog__card {
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.bc-catalog__card:hover {
  border-color: rgba(211, 47, 47, 0.35);
  transform: translateY(-2px);
}
.bc-catalog__card--selected {
  border-color: #d32f2f;
  box-shadow: 0 0 0 1px #d32f2f, 0 12px 32px rgba(211, 47, 47, 0.15);
}

.bc-catalog__img-wrap {
  position: relative;
  aspect-ratio: 16/10;
  background: #0a0a0c;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bc-catalog__img-wrap img {
  max-height: 75%;
  max-width: 75%;
  object-fit: contain;
}
.bc-catalog__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(10, 10, 12, 0.92);
  border: 1px solid rgba(211, 47, 47, 0.45);
  color: #ff5252;
}
.bc-catalog__body { padding: 14px; }
.bc-catalog__brand {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #d32f2f;
  margin: 0 0 4px;
}
.bc-catalog__name-link {
  color: inherit;
  text-decoration: none;
}
.bc-catalog__name-link:hover {
  color: #ff5252;
  text-decoration: underline;
}
.bc-catalog__name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #f5f5f7;
  margin: 0 0 4px;
  line-height: 1.25;
}
.bc-catalog__tagline {
  font-size: 0.72rem;
  color: #7a8190;
  margin: 0 0 8px;
  line-height: 1.35;
}
.bc-catalog__specs {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  font-size: 0.65rem;
  color: #9ca3af;
}
.bc-catalog__specs li::before { content: '▸ '; color: #d32f2f; }
.bc-catalog__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.bc-catalog__price { font-size: 1.1rem; font-weight: 900; color: #f5f5f7; }
.bc-catalog__pick {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ff5252;
}
</style>
