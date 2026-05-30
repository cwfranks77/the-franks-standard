<template>
  <div class="learn-page">
    <section class="learn-hero">
      <div class="container">
        <p class="eyebrow">Learn</p>
        <h1>Guides, tools &amp; videos for collectibles sellers</h1>
        <p class="lead text-muted">
          Free how-tos, fee calculators, and <strong>authenticity education</strong> — including our printable
          <NuxtLink to="/learn/tools/coin-study-guide">coin study guide</NuxtLink> for identifying struck vs cast coins and common red flags.
          More buyer and seller literature for cards, watches, memorabilia, and other collectibles is coming.
          These tools teach what to look for; they do not mean the Platform guarantees an item is authentic.
        </p>
        <div class="learn-cta-actions mt-2">
          <NuxtLink to="/learn/tools" class="btn btn-primary btn-sm">Free tools</NuxtLink>
          <NuxtLink to="/learn/videos" class="btn btn-outline btn-sm">Video library</NuxtLink>
          <NuxtLink to="/sell" class="btn btn-outline btn-sm">Start selling</NuxtLink>
        </div>
      </div>
    </section>

    <section class="learn-section">
      <div class="container">
        <h2 class="learn-section-title">Free tools</h2>
        <div class="learn-grid">
          <NuxtLink
            v-for="t in LEARN_TOOLS"
            :key="t.slug"
            :to="`/learn/tools/${t.slug}`"
            class="learn-card tool-card"
          >
            <span class="tool-icon" aria-hidden="true">{{ t.icon }}</span>
            <h3>{{ t.title }}</h3>
            <p>{{ t.description }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-for="cat in LEARN_CATEGORIES"
      :key="cat.id"
      class="learn-section"
      :class="{ 'learn-section-alt': cat.id === 'best-of' }"
    >
      <div class="container">
        <h2 class="learn-section-title">{{ cat.label }}</h2>
        <div class="learn-grid">
          <NuxtLink
            v-for="a in articlesByCategory(cat.id)"
            :key="a.slug"
            :to="`/learn/${a.slug}`"
            class="learn-card"
          >
            <span class="learn-card-cat">{{ cat.label }}</span>
            <h3>{{ a.title }}</h3>
            <p>{{ a.description }}</p>
            <span class="learn-card-meta">{{ a.readMinutes }} min read</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="learn-section learn-section-alt">
      <div class="container">
        <h2 class="learn-section-title">Social promotion</h2>
        <p class="text-muted mb-2">Instagram, TikTok, and LinkedIn — captions, hashtags, Reels scripts, polls, and UGC contests.</p>
        <NuxtLink to="/social" class="btn btn-outline btn-sm">Open social hub</NuxtLink>
      </div>
    </section>

    <section class="learn-section">
      <div class="container">
        <h2 class="learn-section-title">Video tutorials</h2>
        <p class="text-muted mb-2">Platform tours, import walkthroughs, and trust explainers — publish to YouTube and embed here.</p>
        <NuxtLink to="/learn/videos" class="btn btn-outline btn-sm">Browse video library</NuxtLink>
      </div>
    </section>

    <section class="learn-section">
      <div class="container">
        <div class="learn-cta-band">
          <h2>Ready to list with proof?</h2>
          <p class="text-muted">10 free listings · {{ launchPct }}% fees for 90 days · seller proof on collectibles</p>
          <div class="learn-cta-actions">
            <NuxtLink to="/auth/register?account=sell" class="btn btn-primary">Create free account</NuxtLink>
            <NuxtLink to="/go/postcard?ref=learn" class="btn btn-outline">Founders offer</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  LEARN_CATEGORIES,
  LEARN_TOOLS,
  articlesByCategory,
} from '~/utils/contentHub.js'
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

const launchPct = PRICING_PUBLIC.launchTxPromoPercent

useSeoMeta({
  title: 'Learn — guides, tools & videos | The Franks Standard',
  description: 'Free collectibles seller guides, fee calculators, authenticity checklists, and video tutorials for The Franks Standard marketplace.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #92400e;
  font-weight: 800;
}
</style>
