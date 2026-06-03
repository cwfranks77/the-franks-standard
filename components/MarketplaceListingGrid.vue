<template>
  <div class="mkt-grid">
    <header v-if="title || subtitle" class="mkt-grid__head">
      <h2 v-if="title" class="mkt-grid__title">{{ title }}</h2>
      <p v-if="subtitle" class="mkt-grid__sub">{{ subtitle }}</p>
    </header>

    <div v-if="items.length" class="mkt-grid__cards">
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="mkt-grid__card hover-lift"
      >
        <div class="mkt-grid__img-wrap">
          <img
            :src="item.image"
            :alt="item.title"
            loading="lazy"
            @error="onImgError($event, item)"
          />
          <span v-if="item.badge" class="mkt-grid__badge">{{ item.badge }}</span>
        </div>
        <div class="mkt-grid__body">
          <h3 class="mkt-grid__item-title">{{ item.title }}</h3>
          <p class="mkt-grid__price">{{ item.priceLabel }}</p>
          <p class="mkt-grid__seller">
            <span class="mkt-grid__seller-label">Seller:</span>
            <span class="mkt-grid__seller-badge" :class="{ 'mkt-grid__seller-badge--bc': item.isBcSeller }">
              {{ item.seller }}
            </span>
          </p>
        </div>
      </NuxtLink>
    </div>

    <p v-else class="mkt-grid__empty">{{ emptyMessage }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: 'No listings to show yet.' },
})

function onImgError (e, item) {
  const el = e?.target
  if (!el || el.dataset?.fallback) return
  el.dataset.fallback = '1'
  el.src = item.fallbackImage || '/logo.svg'
}
</script>

<style scoped>
.mkt-grid__head { margin-bottom: 1.25rem; }
.mkt-grid__title {
  font-size: 1.35rem;
  font-weight: 900;
  color: #f5f5f7;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}
.mkt-grid__sub {
  margin: 0;
  font-size: 0.88rem;
  color: #9ca3af;
  line-height: 1.45;
}
.mkt-grid__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.mkt-grid__card {
  display: flex;
  flex-direction: column;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.mkt-grid__card:hover {
  border-color: rgba(211, 47, 47, 0.45);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 24px rgba(211, 47, 47, 0.12);
}
.mkt-grid__img-wrap {
  position: relative;
  aspect-ratio: 1;
  background: #0a0a0c;
  overflow: hidden;
}
.mkt-grid__img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mkt-grid__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(211, 47, 47, 0.92);
  color: #fff;
}
.mkt-grid__body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; }
.mkt-grid__item-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #f5f5f7;
  margin: 0 0 8px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mkt-grid__price {
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffd814;
  margin: 0 0 8px;
}
.mkt-grid__seller {
  margin: auto 0 0;
  font-size: 0.72rem;
  color: #7a8190;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.mkt-grid__seller-label { font-weight: 700; }
.mkt-grid__seller-badge {
  font-weight: 800;
  color: #c5cdd8;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.mkt-grid__seller-badge--bc {
  color: #ff5252;
  border-color: rgba(211, 47, 47, 0.45);
  background: rgba(211, 47, 47, 0.12);
  box-shadow: 0 0 10px rgba(211, 47, 47, 0.2);
}
.mkt-grid__empty {
  padding: 2rem;
  text-align: center;
  color: #7a8190;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}
</style>
