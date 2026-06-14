<template>
  <div class="action-dock page-dock" role="navigation" :aria-label="ariaLabel">
    <NuxtLink
      v-for="tile in tiles"
      :key="tile.to"
      :to="tile.to"
      class="action-tile"
      :class="tile.variant ? `action-tile--${tile.variant}` : ''"
    >
      <span v-if="tile.icon" class="action-tile-icon" aria-hidden="true">{{ tile.icon }}</span>
      <span class="action-tile-label">{{ tile.label }}</span>
      <span v-if="tile.hint" class="action-tile-hint">{{ tile.hint }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  tiles: { type: Array, required: true },
  ariaLabel: { type: String, default: 'Page shortcuts' },
})
</script>
