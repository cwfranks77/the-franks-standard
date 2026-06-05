<script setup>
import { SHOP_STORES } from '~/utils/dropshipCatalogs.js'
import { getBcExternalSiteUrl } from '~/utils/bcExternalSite.js'

const config = useRuntimeConfig()
const bcExternalUrl = computed(() => getBcExternalSiteUrl(config))

const menuOpen = ref(false)
const storesOpen = ref(false)
const storesRoot = ref(null)

const partnerStores = SHOP_STORES.filter((s) => s.id !== 'store-directory')

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
      <NuxtLink to="/bc-audio" class="bc-nav__brand" @click="closeAll">
        <span class="bc-nav__logo">B<span class="bc-nav__amp">&</span>C</span>
        <span class="bc-nav__name">Performance Audio</span>
      </NuxtLink>

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
            <NuxtLink
              v-for="store in partnerStores"
              :key="store.id"
              :to="store.path"
              class="bc-nav__stores-item"
              @click="closeAll"
            >
              <span class="bc-nav__stores-dot" :style="{ background: store.accent }" />
              <span>
                <strong>{{ store.name }}</strong>
                <small>{{ store.tagline }}</small>
              </span>
            </NuxtLink>
            <NuxtLink to="/stores" class="bc-nav__stores-all" @click="closeAll">All stores on The Franks Standard →</NuxtLink>
          </div>
        </div>
        <NuxtLink to="/bc-audio" class="bc-nav__link" @click="closeAll">Catalog</NuxtLink>
        <a
          v-if="bcExternalUrl"
          :href="bcExternalUrl"
          class="bc-nav__link bc-nav__link--external"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeAll"
        >Full website ↗</a>
        <NuxtLink to="/" class="bc-nav__link bc-nav__link--muted" @click="closeAll">The Franks Standard</NuxtLink>
        <a href="tel:+18778370527" class="bc-nav__link" @click="closeAll">Support</a>
      </nav>

      <button type="button" class="bc-nav__toggle" aria-label="Menu" @click="menuOpen = !menuOpen">
        <span /><span /><span />
      </button>
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
}
.bc-nav__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.25rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.bc-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #f5f5f7;
  flex-shrink: 0;
}
.bc-nav__brand:hover { color: #ff5252; }
.bc-nav__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  font-weight: 900;
  font-size: 0.95rem;
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.35);
}
.bc-nav__amp { color: #fff; }
.bc-nav__name {
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}
.bc-nav__links {
  display: flex;
  align-items: center;
  gap: 8px;
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
.bc-nav__link--muted { color: #9ca3af; }
.bc-nav__link--external { color: #ffd814; }
.bc-nav__link--external:hover { color: #fff; background: rgba(255, 216, 20, 0.12); }
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
@media (max-width: 768px) {
  .bc-nav__toggle { display: flex; }
  .bc-nav__links {
    display: none;
    position: absolute;
    top: 64px;
    left: 0; right: 0;
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    background: #0a0a0c;
    border-bottom: 1px solid rgba(211, 47, 47, 0.25);
  }
  .bc-nav__links.open { display: flex; }
  .bc-nav__stores-panel { position: static; margin-top: 8px; width: 100%; }
}
</style>
