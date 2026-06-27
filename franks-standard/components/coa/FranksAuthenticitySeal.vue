<script setup>
import { SEAL_ASSET, SEAL_COMPACT_LABEL, SEAL_DOES_NOT_MEAN, SEAL_MEANS } from '~/utils/authenticitySeal.js'

defineProps({
  size: { type: String, default: 'md' },
  showDetails: { type: Boolean, default: true },
  lead: { type: String, default: '' },
})
</script>

<template>
  <div class="franks-seal" :class="`franks-seal--${size}`">
    <img :src="SEAL_ASSET" alt="The Franks Standard authenticity seal" class="franks-seal__img">
    <div class="franks-seal__text">
      <p class="franks-seal__label">{{ SEAL_COMPACT_LABEL }}</p>
      <p v-if="lead" class="franks-seal__lead">{{ lead }}</p>
      <template v-if="showDetails">
        <ul class="franks-seal__means">
          <li v-for="(line, i) in SEAL_MEANS" :key="'m-' + i">{{ line }}</li>
        </ul>
        <ul class="franks-seal__not">
          <li v-for="(line, i) in SEAL_DOES_NOT_MEAN" :key="'n-' + i">{{ line }}</li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.franks-seal {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: 8px;
  background: rgba(15, 20, 25, 0.5);
}
.franks-seal--sm .franks-seal__img { width: 56px; height: 56px; }
.franks-seal--md .franks-seal__img { width: 72px; height: 72px; }
.franks-seal--lg .franks-seal__img { width: 96px; height: 96px; }
.franks-seal__label {
  font-weight: 700;
  font-size: 0.85rem;
  color: #e8d5a3;
  margin: 0 0 4px;
}
.franks-seal__lead {
  font-size: 0.8rem;
  color: #d1d5db;
  margin: 0 0 8px;
  line-height: 1.45;
}
.franks-seal__means,
.franks-seal__not {
  font-size: 0.75rem;
  line-height: 1.45;
  padding-left: 1rem;
  margin: 6px 0 0;
  color: #9ca3af;
}
.franks-seal__not { color: #fbbf24; }
</style>
