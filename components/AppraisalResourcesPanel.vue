<template>
  <div class="appraisal-panel">
    <p class="appraisal-disclaimer text-muted">{{ disclaimer }}</p>
    <section
      v-for="section in sections"
      :key="section.id"
      class="appraisal-section card"
    >
      <h2 class="appraisal-section-title">{{ section.title }}</h2>
      <p class="text-muted small">{{ section.description }}</p>
      <ul class="appraisal-links">
        <li v-for="(link, i) in section.links" :key="i">
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="appraisal-link">
            {{ link.name }}
            <span class="link-arrow" aria-hidden="true">↗</span>
          </a>
          <span v-if="link.note" class="link-note text-muted small">{{ link.note }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { APPRAISAL_DISCLAIMER, APPRAISAL_SECTIONS } from '~/utils/appraisalResources.js'

defineProps({
  compact: { type: Boolean, default: false },
})

const disclaimer = APPRAISAL_DISCLAIMER
const sections = APPRAISAL_SECTIONS
</script>

<style scoped>
.appraisal-panel { display: flex; flex-direction: column; gap: 1rem; }
.appraisal-disclaimer {
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(4, 120, 87, 0.08);
  border: 1px solid rgba(4, 120, 87, 0.2);
}
.appraisal-section { padding: 1.25rem; }
.appraisal-section-title {
  font-size: 1.05rem;
  color: var(--gold, #f7ca00);
  margin-bottom: 0.35rem;
}
.appraisal-links {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.appraisal-link {
  font-weight: 600;
  color: #93c5fd;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.appraisal-link:hover { text-decoration: underline; color: #bfdbfe; }
.link-note { display: block; margin-top: 2px; }
</style>
