<script setup>
import { SHOP_STORES } from '~/utils/dropshipCatalogs.js'

const emit = defineEmits(['navigate'])

const open = ref(false)
const root = ref(null)

const stores = SHOP_STORES.filter((s) => s.id !== 'store-directory')

function toggle () {
  open.value = !open.value
}

function close () {
  open.value = false
}

function onNavigate () {
  close()
  emit('navigate')
}

function onDocClick (e) {
  if (root.value && !root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="root" class="shop-stores-dd" :class="{ open }">
    <button
      type="button"
      class="shop-stores-dd__trigger"
      aria-haspopup="true"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      Shop Stores
      <span class="shop-stores-dd__chev" aria-hidden="true" />
    </button>
    <div v-show="open" class="shop-stores-dd__panel" role="menu">
      <NuxtLink
        v-for="store in stores"
        :key="store.id"
        :to="store.path"
        class="shop-stores-dd__item"
        role="menuitem"
        @click="onNavigate"
      >
        <span class="shop-stores-dd__dot" :style="{ background: store.accent }" />
        <span class="shop-stores-dd__copy">
          <span class="shop-stores-dd__name">{{ store.name }}</span>
          <span class="shop-stores-dd__tag">{{ store.tagline }}</span>
        </span>
        <span v-if="store.status === 'live'" class="shop-stores-dd__pill shop-stores-dd__pill--live">Live</span>
        <span v-else-if="store.status === 'opening_soon'" class="shop-stores-dd__pill">Soon</span>
      </NuxtLink>
      <NuxtLink to="/stores" class="shop-stores-dd__footer" @click="onNavigate">
        View all stores →
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.shop-stores-dd {
  position: relative;
}
.shop-stores-dd__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(211, 47, 47, 0.45);
  background: rgba(211, 47, 47, 0.1);
  color: #ff5252;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}
.shop-stores-dd__trigger:hover,
.shop-stores-dd.open .shop-stores-dd__trigger {
  background: rgba(211, 47, 47, 0.2);
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.25);
}
.shop-stores-dd__chev {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #ff5252;
  transition: transform 0.2s;
}
.shop-stores-dd.open .shop-stores-dd__chev {
  transform: rotate(180deg);
}
.shop-stores-dd__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 320px;
  padding: 8px 0;
  background: #16161c;
  border: 1px solid rgba(211, 47, 47, 0.25);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55);
  z-index: 300;
}
.shop-stores-dd__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  color: #f5f5f7;
  text-decoration: none;
  transition: background 0.15s;
}
.shop-stores-dd__item:hover {
  background: rgba(211, 47, 47, 0.08);
}
.shop-stores-dd__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}
.shop-stores-dd__copy {
  flex: 1;
  min-width: 0;
}
.shop-stores-dd__name {
  display: block;
  font-weight: 800;
  font-size: 0.9rem;
}
.shop-stores-dd__tag {
  display: block;
  font-size: 0.75rem;
  color: #7a8190;
  margin-top: 2px;
  line-height: 1.35;
}
.shop-stores-dd__pill {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  flex-shrink: 0;
}
.shop-stores-dd__pill--live {
  background: rgba(211, 47, 47, 0.2);
  color: #ff5252;
  border: 1px solid rgba(211, 47, 47, 0.4);
}
.shop-stores-dd__footer {
  display: block;
  padding: 10px 16px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ff5252;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-decoration: none;
}
.shop-stores-dd__footer:hover {
  background: rgba(211, 47, 47, 0.06);
}
@media (max-width: 768px) {
  .shop-stores-dd { width: 100%; }
  .shop-stores-dd__trigger { width: 100%; justify-content: space-between; }
  .shop-stores-dd__panel {
    position: static;
    margin-top: 8px;
    width: 100%;
    box-shadow: none;
  }
}
</style>
