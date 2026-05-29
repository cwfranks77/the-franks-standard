<template>
  <div class="learn-page">
    <section class="learn-hero">
      <div class="container">
        <p class="eyebrow"><NuxtLink to="/learn">Learn</NuxtLink> · Tools</p>
        <h1>Free seller tools</h1>
        <p class="lead text-muted">Calculators and checklists — no account required. Share links in blog posts and social posts.</p>
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
  description: 'Fee savings calculator, listing cost estimator, and printable authenticity checklist for collectibles sellers.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.eyebrow a { color: #146eb4; font-weight: 700; }
</style>
