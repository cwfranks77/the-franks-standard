<script setup>
import { SHOP_STORES } from '~/utils/dropshipCatalogs.js'
import { getBcExternalSiteUrl } from '~/utils/bcExternalSite.js'
import { franksMarketplacePath } from '~/utils/franksMarketplaceUrl.js'
import { getBcSupport } from '~/utils/bcSupport.js'

const config = useRuntimeConfig()
const bcExternalUrl = computed(() => getBcExternalSiteUrl(config))
const franksStoresUrl = computed(() => franksMarketplacePath(config, '/stores'))
const franksHomeUrl = computed(() => franksMarketplacePath(config, '/'))
const support = computed(() => getBcSupport(config))
const onBrandKnock = inject('opsLogoKnock', null)

const menuOpen = ref(false)
const storesOpen = ref(false)
const storesRoot = ref(null)

const partnerStores = SHOP_STORES.filter((s) => s.id !== 'store-directory')

function storeHref (store) {
  if (store.id === 'bc-performance-audio') return store.path
  return franksMarketplacePath(config, store.path)
}

function isExternalStore (store) {
  return store.id !== 'bc-performance-audio'
}

function closeAll () {
  menuOpen.value = false
  storesOpen.value = false
}

function onDocClick (e) {
  if (storesRoot.value && !storesRoot.value.contains(e.target)) {
    storesOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header class="bc-nav">
    <div class="bc-nav__inner">
      <NuxtLink
        to="/bc-audio"
        class="bc-nav__brand"
        @click="(e) => { closeAll(); onBrandKnock?.(e) }"
      >
        <img
          src="/img/bc-logo-primary.png?v=20260612"
          alt="B&amp;C Performance Audio"
          class="bc-nav__logo-img"
          width="260"
          height="60"
          decoding="async"
          fetchpriority="high"
        >
      </NuxtLink>

      <div class="bc-nav__actions">
        <BcWholesaleDeptSelect class="bc-nav__dept" />
        <BcCatalogNavMenu @close="closeAll" />

        <button type="button" class="bc-nav__toggle" aria-label="Menu" @click="menuOpen = !menuOpen">
          <span /><span /><span />
        </button>
      </div>

      <nav class="bc-nav__links" :class="{ open: menuOpen }">
        <div ref="storesRoot" class="bc-nav__stores">
          <button
            type="button"
            class="bc-nav__stores-btn"
            :aria-expanded="storesOpen"
            @click.stop="storesOpen = !storesOpen"
          >
            Shop Stores
            <span class="bc-nav__chev" />
          </button>
          <div v-show="storesOpen" class="bc-nav__stores-panel">
            <template v-for="store in partnerStores" :key="store.id">
              <a
                v-if="isExternalStore(store)"
                :href="storeHref(store)"
                class="bc-nav__stores-item"
                target="_blank"
                rel="noopener noreferrer"
                @click="closeAll"
              >
                <span class="bc-nav__stores-dot" :style="{ background: store.accent }" />
                <span>
                  <strong>{{ store.name }}</strong>
                  <small>{{ store.tagline }}</small>
                </span>
              </a>
              <NuxtLink
                v-else
                :to="storeHref(store)"
                class="bc-nav__stores-item"
                @click="closeAll"
              >
                <span class="bc-nav__stores-dot" :style="{ background: store.accent }" />
                <span>
                  <strong>{{ store.name }}</strong>
                  <small>{{ store.tagline }}</small>
                </span>
              </NuxtLink>
            </template>
            <a :href="franksStoresUrl" class="bc-nav__stores-all" target="_blank" rel="noopener noreferrer" @click="closeAll">All stores on The Franks Standard ↗</a>
          </div>
        </div>
        <BcWholesaleDeptSelect class="bc-nav__dept-mobile" @click="closeAll" />
        <NuxtLink to="/bc-audio/catalog" class="bc-nav__link bc-nav__link--catalog" @click="closeAll">Full catalog</NuxtLink>
        <NuxtLink to="/bc-audio/open-door" class="bc-nav__link bc-nav__link--door" @click="closeAll">Open Door</NuxtLink>
        <a
          :href="franksHomeUrl"
          class="bc-nav__link bc-nav__link--muted"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeAll"
        >The Franks Standard ↗</a>
        <a
          v-if="bcExternalUrl"
          :href="bcExternalUrl"
          class="bc-nav__link bc-nav__link--external"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeAll"
        >Full website ↗</a>
        <a :href="`tel:${support.phoneTel}`" class="bc-nav__link bc-nav__phone" @click="closeAll">{{ support.phoneDisplay }}</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.bc-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(10, 10, 12, 0.94);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(211, 47, 47, 0.25);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  overflow: visible;
}
.bc-nav__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3px 1.25rem 0;
  min-height: 64px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  overflow: visible;
}
.bc-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #f5f5f7;
  flex-shrink: 0;
  transform: translateY(-2px);
}
.bc-nav__brand:hover { color: #ff5252; }
.bc-nav__logo-img {
  display: block;
  width: auto;
  max-width: min(260px, 62vw);
  height: 56px;
  object-fit: contain;
}
.bc-nav__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.bc-nav__dept { display: none; }
@media (min-width: 900px) {
  .bc-nav__dept { display: block; }
}
.bc-nav__links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  overflow: visible;
}
.bc-nav__link {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f5f5f7;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.bc-nav__link:hover { background: rgba(211, 47, 47, 0.12); color: #ff5252; }
.bc-nav__link--catalog { color: #ffd814; }
.bc-nav__link--muted { color: #9ca3af; }
.bc-nav__link--external { color: #ffd814; }
.bc-nav__link--external:hover { color: #fff; background: rgba(255, 216, 20, 0.12); }
.bc-nav__link--door { color: #ff5252; }
.bc-nav__phone { color: #ff5252; white-space: nowrap; }
.bc-nav__stores { position: relative; }
.bc-nav__stores-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(211, 47, 47, 0.5);
  background: rgba(211, 47, 47, 0.12);
  color: #ff5252;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
}
.bc-nav__stores-btn:hover { background: rgba(211, 47, 47, 0.22); }
.bc-nav__chev {
  width: 0; height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #ff5252;
}
.bc-nav__stores-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 300px;
  background: #16161c;
  border: 1px solid rgba(211, 47, 47, 0.3);
  border-radius: 12px;
  padding: 8px 0;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55);
  z-index: 250;
}
.bc-nav__stores-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  color: #f5f5f7;
  text-decoration: none;
}
.bc-nav__stores-item:hover { background: rgba(211, 47, 47, 0.08); }
.bc-nav__stores-item strong { display: block; font-size: 0.88rem; }
.bc-nav__stores-item small { display: block; font-size: 0.72rem; color: #7a8190; margin-top: 2px; }
.bc-nav__stores-dot {
  width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0;
}
.bc-nav__stores-all {
  display: block;
  padding: 10px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #ff5252;
  border-top: 1px solid rgba(255,255,255,0.06);
  text-decoration: none;
}
.bc-nav__toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.bc-nav__toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: #f5f5f7;
  border-radius: 2px;
}
@media (min-width: 769px) {
  .bc-nav__inner {
    flex-wrap: nowrap;
    height: 64px;
  }
  .bc-nav__actions {
    order: 3;
    margin-left: 0;
  }
  .bc-nav__links {
    order: 2;
    flex: 1;
    justify-content: flex-end;
    margin-left: auto;
  }
}
@media (max-width: 768px) {
  .bc-nav__toggle { display: flex; }
  .bc-nav__dept { display: none; }
  .bc-nav__dept-mobile { display: block; width: 100%; }
  .bc-nav__dept-mobile :deep(.bc-dept__select) { width: 100%; max-width: none; }
  .bc-nav__links {
    display: none;
    width: 100%;
    order: 4;
    flex-direction: column;
    align-items: stretch;
    padding: 0 0 16px;
    background: #0a0a0c;
    border-bottom: 1px solid rgba(211, 47, 47, 0.25);
  }
  .bc-nav__links.open { display: flex; }
  .bc-nav__stores-panel { position: static; margin-top: 8px; width: 100%; }
}
@media (min-width: 769px) {
  .bc-nav__dept-mobile { display: none; }
}
</style>
