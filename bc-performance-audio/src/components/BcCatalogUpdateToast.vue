<script setup>
const {
  updateNotice,
  checking,
  dismissNotice,
  checkForCatalogUpdates,
  startCatalogAutoRefresh,
  stopCatalogAutoRefresh,
} = useBcCatalogAutoRefresh()

onMounted(() => {
  startCatalogAutoRefresh()
})

onUnmounted(() => {
  stopCatalogAutoRefresh()
})
</script>

<template>
  <div class="bc-catalog-watch" aria-live="polite">
    <button
      type="button"
      class="bc-catalog-watch__btn"
      :disabled="checking"
      title="Check Petra catalog for new or removed items"
      @click="checkForCatalogUpdates()"
    >
      {{ checking ? 'Checking…' : '↻ Inventory' }}
    </button>

    <div v-if="updateNotice" class="bc-catalog-watch__toast" role="status">
      <p class="bc-catalog-watch__msg">{{ updateNotice.message }}</p>
      <p v-if="updateNotice.total" class="bc-catalog-watch__meta">
        {{ updateNotice.total.toLocaleString() }} audio items on the floor now.
      </p>
      <button type="button" class="bc-catalog-watch__dismiss" @click="dismissNotice">Dismiss</button>
    </div>
  </div>
</template>

<style scoped>
.bc-catalog-watch {
  position: fixed;
  right: 1rem;
  bottom: 5.5rem;
  z-index: 180;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  pointer-events: none;
}

.bc-catalog-watch__btn,
.bc-catalog-watch__toast {
  pointer-events: auto;
}

.bc-catalog-watch__btn {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(211, 47, 47, 0.45);
  background: rgba(10, 10, 12, 0.92);
  color: #ff5252;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.bc-catalog-watch__btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.bc-catalog-watch__toast {
  max-width: min(92vw, 320px);
  padding: 0.75rem 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: rgba(16, 16, 20, 0.96);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.bc-catalog-watch__msg {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #f5f5f7;
}

.bc-catalog-watch__meta {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  color: #9ca3af;
}

.bc-catalog-watch__dismiss {
  margin-top: 0.55rem;
  padding: 0;
  border: none;
  background: none;
  color: #ff5252;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}
</style>
