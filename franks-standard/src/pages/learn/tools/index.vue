<template>
  <div class="learn-page">
    <section class="learn-hero">
      <div class="container">
        <p class="eyebrow"><NuxtLink to="/learn">Learn</NuxtLink> · Tools</p>
        <h1>Free tools &amp; authenticity education</h1>
        <p class="lead text-muted">
          Calculators, checklists, and coin authentication guides for buyers and sellers — no account required.
          We are adding more collectibles literature over time. Educational only — not a Platform guarantee of genuineness.
        </p>
      </div>
    </section>
    <section class="learn-section">
      <div class="container learn-grid">
        <NuxtLink
          v-for="t in LEARN_TOOLS"
          :key="t.slug"
          :to="`/learn/tools/${t.slug}`"
          class="learn-card tool-card"
        >
          <span class="tool-icon">{{ t.icon }}</span>
          <h3>{{ t.title }}</h3>
          <p>{{ t.description }}</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { LEARN_TOOLS } from '~/utils/contentHub.js'

useSeoMeta({
  title: 'Free marketplace tools | The Franks Standard',
  description: 'Free coin study guide, authenticity checklist, fee calculators, and more education for collectibles buyers and sellers.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.eyebrow a { color: #146eb4; font-weight: 700; }
</style>
