<template>
  <div class="learn-page">
    <section class="learn-hero">
      <div class="container">
        <p class="eyebrow"><NuxtLink to="/learn">Learn</NuxtLink> · Videos</p>
        <h1>Video tutorials &amp; platform demos</h1>
        <p class="lead text-muted">
          Showcase escrow checkout, COA requirements, eBay import, and video inspect —
          post on <strong>YouTube</strong>, then add each video ID here to embed on this page and share on social.
        </p>
        <p v-if="!channelUrl" class="text-muted small">
          Set your channel URL in <code>utils/contentHub.js</code> → <code>CONTENT_SOCIAL.youtubeChannel</code>.
        </p>
        <a
          v-else
          :href="channelUrl"
          class="btn btn-outline btn-sm mt-1"
          target="_blank"
          rel="noopener noreferrer"
        >Subscribe on YouTube ↗</a>
      </div>
    </section>

    <section class="learn-section">
      <div class="container">
        <VideoLibrary :videos="LEARN_VIDEOS" />
      </div>
    </section>

    <section class="learn-section learn-section-alt">
      <div class="container">
        <h2 class="learn-section-title">Suggested filming queue (owner)</h2>
        <ol class="film-queue">
          <li v-for="v in LEARN_VIDEOS" :key="v.id">
            <strong>{{ v.title }}</strong> — {{ v.duration }} — {{ v.description }}
          </li>
        </ol>
        <p class="text-muted small mt-2">Playbook: <code>docs/CONTENT-MARKETING.md</code> in the repo.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { LEARN_VIDEOS, CONTENT_SOCIAL } from '~/utils/contentHub.js'

const channelUrl = CONTENT_SOCIAL.youtubeChannel || ''

useSeoMeta({
  title: 'Video tutorials | The Franks Standard',
  description: 'YouTube-ready tutorials: platform tour, eBay import, COA guarantees, video inspect, and seller protection.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.eyebrow a { color: #146eb4; font-weight: 700; }
.film-queue { padding-left: 1.25rem; line-height: 1.65; font-weight: 600; color: #374151; }
.film-queue li { margin-bottom: 10px; }
</style>
