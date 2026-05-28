<template>
  <div class="action-dock" role="navigation" aria-label="Quick actions">
    <NuxtLink to="/browse" class="action-tile action-tile--primary">
      <span class="action-tile-icon" aria-hidden="true">🛍️</span>
      <span class="action-tile-label">Browse floor</span>
      <span class="action-tile-hint">Live listings with COA or guarantee</span>
    </NuxtLink>
    <NuxtLink to="/sell" class="action-tile action-tile--accent">
      <span class="action-tile-icon" aria-hidden="true">📤</span>
      <span class="action-tile-label">Sell an item</span>
      <span class="action-tile-hint">List free · import from eBay</span>
    </NuxtLink>
    <NuxtLink to="/video" class="action-tile">
      <span class="action-tile-icon" aria-hidden="true">📹</span>
      <span class="action-tile-label">Video meet</span>
      <span class="action-tile-hint">Inspect before you buy</span>
    </NuxtLink>
    <NuxtLink to="/join/founders10" class="action-tile action-tile--dark">
      <span class="action-tile-icon" aria-hidden="true">🎁</span>
      <span class="action-tile-label">3 mo Pro free</span>
      <span class="action-tile-hint">FOUNDERS10 · limited spots</span>
    </NuxtLink>
  </div>
</template>
