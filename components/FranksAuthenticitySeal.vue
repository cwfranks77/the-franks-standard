<template>
  <div class="fs-seal" :class="[`fs-seal--${size}`, compact ? 'fs-seal--compact' : '']">
    <img
      :src="SEAL_ASSET"
      class="fs-seal-img"
      :width="imgSize"
      :height="imgSize"
      alt=""
      aria-hidden="true"
    />
    <div v-if="!compact" class="fs-seal-copy">
      <p class="fs-seal-title">{{ SEAL_TITLE }}</p>
      <p class="fs-seal-lead">{{ lead }}</p>
      <details v-if="showDetails" class="fs-seal-details">
        <summary>What this seal means</summary>
        <ul class="fs-seal-list">
          <li v-for="(line, i) in SEAL_MEANS" :key="'m' + i">{{ line }}</li>
        </ul>
        <p class="fs-seal-sub">What it does <strong>not</strong> mean</p>
        <ul class="fs-seal-list fs-seal-list--muted">
          <li v-for="(line, i) in SEAL_DOES_NOT_MEAN" :key="'n' + i">{{ line }}</li>
        </ul>
        <NuxtLink to="/protection#authenticity-seal" class="fs-seal-link">Full authenticity &amp; liability policy →</NuxtLink>
      </details>
      <p v-else class="fs-seal-foot text-muted small">
        <NuxtLink to="/protection#authenticity-seal">What this seal means →</NuxtLink>
      </p>
    </div>
    <span v-else class="fs-seal-compact-label">{{ compactLabel }}</span>
  </div>
</template>

<script setup>
import {
  SEAL_ASSET,
  SEAL_COMPACT_LABEL,
  SEAL_DOES_NOT_MEAN,
  SEAL_LISTING_LEAD,
  SEAL_MEANS,
  SEAL_TITLE,
} from '~/utils/authenticitySeal.js'

const props = defineProps({
  size: { type: String, default: 'md' },
  compact: { type: Boolean, default: false },
  showDetails: { type: Boolean, default: true },
  lead: {
    type: String,
    default: SEAL_LISTING_LEAD,
  },
  compactLabel: { type: String, default: SEAL_COMPACT_LABEL },
})

const imgSize = computed(() => {
  if (props.size === 'sm') return 56
  if (props.size === 'lg') return 120
  return 88
})
</script>

<style scoped>
.fs-seal {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(201, 168, 76, 0.35);
  background: linear-gradient(135deg, rgba(15, 20, 25, 0.04), rgba(201, 168, 76, 0.08));
}
.fs-seal--compact {
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
}
.fs-seal-img { flex-shrink: 0; }
.fs-seal-title {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  color: var(--gold);
  margin: 0 0 6px;
  line-height: 1.3;
}
.fs-seal-lead {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--stone-700);
  font-weight: 600;
}
.fs-seal-details { margin-top: 10px; font-size: 0.85rem; }
.fs-seal-details summary {
  cursor: pointer;
  color: var(--gold);
  font-weight: 700;
}
.fs-seal-list {
  margin: 8px 0 12px;
  padding-left: 1.1rem;
  line-height: 1.5;
  color: var(--stone-700);
}
.fs-seal-list--muted { color: var(--stone-500); font-size: 0.82rem; }
.fs-seal-sub { margin: 8px 0 4px; font-size: 0.82rem; font-weight: 700; }
.fs-seal-link { font-size: 0.85rem; font-weight: 700; color: #146eb4; }
.fs-seal-foot { margin: 8px 0 0; }
.fs-seal-compact-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gold);
}
</style>
