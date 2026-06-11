<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'

const emit = defineEmits(['close'])

const config = useRuntimeConfig()
const siteUrl = computed(() => String(config.public.siteUrl || '').replace(/\/$/, ''))
const route = useRoute()

const open = ref(false)
const root = ref(null)
const activeCategory = ref('Amplifiers')

const { categories, itemsForCategory, pending, error, items } = useBcCatalogGroups()

const menuProducts = computed(() => itemsForCategory(activeCategory.value, 8))

const totalCount = computed(() => items.value.length)

watch(categories, (list) => {
  if (!list.length) return
  const names = list.map((c) => c.name)
  if (!names.includes(activeCategory.value)) {
    activeCategory.value = list[0].name
  }
}, { immediate: true })

function catalogLink (category) {
  const q = category ? `?category=${encodeURIComponent(category)}` : ''
  return `/bc-audio/catalog${q}`
}

function productLink (id) {
  return `/bc-audio/catalog?pick=${encodeURIComponent(id)}`
}

function toggle () {
  open.value = !open.value
}

function close () {
  open.value = false
  emit('close')
}

function onDocClick (e) {
  if (root.value && !root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

watch(() => route.fullPath, close)
</script>

<template>
  <div ref="root" class="bc-cat-nav">
    <button
      type="button"
      class="bc-cat-nav__btn"
      :aria-expanded="open"
      aria-haspopup="true"
      @click.stop="toggle"
    >
      Products
      <span class="bc-cat-nav__chev" :class="{ 'bc-cat-nav__chev--open': open }" />
    </button>

    <div v-show="open" class="bc-cat-nav__panel" role="menu">
      <header class="bc-cat-nav__head">
        <p class="bc-cat-nav__eyebrow">{{ BC_BRAND.short }} catalog</p>
        <p v-if="totalCount" class="bc-cat-nav__total">{{ totalCount.toLocaleString() }} products</p>
      </header>

      <p v-if="pending" class="bc-cat-nav__status">Loading catalog…</p>
      <p v-else-if="error" class="bc-cat-nav__status bc-cat-nav__status--err">Catalog unavailable</p>

      <template v-else>
        <div class="bc-cat-nav__cats" role="tablist" aria-label="Product categories">
          <button
            v-for="cat in categories"
            :key="cat.name"
            type="button"
            role="tab"
            class="bc-cat-nav__cat"
            :class="{ 'bc-cat-nav__cat--active': activeCategory === cat.name }"
            :aria-selected="activeCategory === cat.name"
            @click="activeCategory = cat.name"
          >
            {{ cat.name }}
            <span class="bc-cat-nav__cat-count">{{ cat.count }}</span>
          </button>
        </div>

        <div class="bc-cat-nav__grid" role="tabpanel">
          <NuxtLink
            v-for="item in menuProducts"
            :key="item.id"
            :to="productLink(item.id)"
            class="bc-cat-nav__card"
            role="menuitem"
            @click="close"
          >
            <img
              :src="bcProductImageSrc(item.image, siteUrl)"
              :alt="item.name"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
            >
            <span class="bc-cat-nav__card-brand">{{ item.brand }}</span>
            <span class="bc-cat-nav__card-name">{{ item.name }}</span>
          </NuxtLink>
        </div>

        <footer class="bc-cat-nav__foot">
          <NuxtLink
            :to="catalogLink(activeCategory)"
            class="bc-cat-nav__all"
            @click="close"
          >
            View all {{ activeCategory }} →
          </NuxtLink>
          <NuxtLink
            :to="catalogLink()"
            class="bc-cat-nav__all bc-cat-nav__all--muted"
            @click="close"
          >
            Full catalog
          </NuxtLink>
        </footer>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bc-cat-nav {
  position: relative;
  margin-left: auto;
}
.bc-cat-nav__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(211, 47, 47, 0.55);
  background: rgba(211, 47, 47, 0.18);
  color: #ff5252;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
}
.bc-cat-nav__btn:hover {
  background: rgba(211, 47, 47, 0.28);
}
.bc-cat-nav__chev {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #ff5252;
  transition: transform 0.15s;
}
.bc-cat-nav__chev--open {
  transform: rotate(180deg);
}
.bc-cat-nav__panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(420px, calc(100vw - 24px));
  max-height: min(70vh, 560px);
  overflow: auto;
  background: #141418;
  border: 1px solid rgba(211, 47, 47, 0.35);
  border-radius: 14px;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.65);
  padding: 14px;
  z-index: 300;
}
.bc-cat-nav__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.bc-cat-nav__eyebrow {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ff5252;
}
.bc-cat-nav__total {
  margin: 0;
  font-size: 0.72rem;
  color: #9ca3af;
}
.bc-cat-nav__status {
  margin: 0;
  padding: 1rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: #9ca3af;
}
.bc-cat-nav__status--err { color: #fecaca; }
.bc-cat-nav__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  max-height: 120px;
  overflow-y: auto;
}
.bc-cat-nav__cat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #e5e5e5;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}
.bc-cat-nav__cat:hover {
  border-color: rgba(211, 47, 47, 0.4);
}
.bc-cat-nav__cat--active {
  background: rgba(211, 47, 47, 0.22);
  border-color: rgba(211, 47, 47, 0.55);
  color: #fff;
}
.bc-cat-nav__cat-count {
  font-size: 0.65rem;
  color: #9ca3af;
  font-weight: 600;
}
.bc-cat-nav__cat--active .bc-cat-nav__cat-count {
  color: #ffcdd2;
}
.bc-cat-nav__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.bc-cat-nav__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.bc-cat-nav__card:hover {
  border-color: rgba(211, 47, 47, 0.45);
  background: rgba(211, 47, 47, 0.08);
}
.bc-cat-nav__card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  background: #0a0a0c;
  border-radius: 6px;
}
.bc-cat-nav__card-brand {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #ff5252;
}
.bc-cat-nav__card-name {
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.25;
  color: #f5f5f7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bc-cat-nav__foot {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.bc-cat-nav__all {
  font-size: 0.78rem;
  font-weight: 800;
  color: #ff5252;
  text-decoration: none;
}
.bc-cat-nav__all:hover { text-decoration: underline; }
.bc-cat-nav__all--muted { color: #9ca3af; }
</style>
