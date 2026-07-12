<template>
  <div class="bc-ads-page">
    <div class="container">
      <header class="bc-ads-head">
        <div>
          <p class="bc-ads-eyebrow">B&amp;C owner toolkit</p>
          <h1>Social media ads — B&amp;C Performance Audio</h1>
          <p class="bc-ads-lede">
            Paid and organic creatives for <strong>bcpoweraudio.com</strong>. Use the B&amp;C logo on every post — not Franks Standard branding.
          </p>
        </div>
        <NuxtLink to="/bc-audio/ops/panel" class="btn btn-outline btn-sm">← Owner console</NuxtLink>
      </header>

      <section class="bc-ads-card">
        <h2>Quick links</h2>
        <p class="text-muted small">
          Weekly post queue with image previews lives in
          <NuxtLink to="/bc-audio/ops/marketing-automation">Marketing automation</NuxtLink>.
        </p>
      </section>

      <div class="bc-ads-list">
        <section v-for="ad in ads" :key="ad.platform" class="bc-ads-card bc-ads-creative">
          <div class="bc-ads-creative-head">
            <span class="bc-ads-icon">{{ ad.icon }}</span>
            <div>
              <h2>{{ ad.platform }}</h2>
              <p class="text-muted small">{{ ad.format }}</p>
            </div>
            <button type="button" class="btn btn-primary btn-sm" @click="copyAd(ad)">
              {{ ad.copied ? 'Copied!' : 'Copy text' }}
            </button>
          </div>

          <figure v-if="ad.imageSrc" class="bc-ads-preview">
            <img
              :src="ad.imageSrc"
              :alt="`${ad.platform} creative preview`"
              class="bc-ads-preview__img"
              loading="lazy"
              decoding="async"
            >
            <figcaption class="text-muted small">{{ ad.image }}</figcaption>
          </figure>
          <p v-else-if="ad.image" class="text-muted small"><strong>Image:</strong> {{ ad.image }}</p>

          <pre class="bc-ads-text">{{ ad.text }}</pre>
          <p class="text-muted small"><strong>Tip:</strong> {{ ad.tip }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BC_SOCIAL_AD_CREATIVES } from '~/utils/bcMarketingAutomation.js'

definePageMeta({
  layout: 'bc-audio',
  middleware: ['bc-ops-host', 'bc-ops-auth'],
})

useSeoMeta({ title: 'Social Ads — B&C Performance Audio', robots: 'noindex, nofollow' })

const ads = reactive(BC_SOCIAL_AD_CREATIVES.map((ad) => ({ ...ad, copied: false })))

async function copyAd (ad) {
  try {
    await navigator.clipboard.writeText(ad.text)
    ad.copied = true
    setTimeout(() => { ad.copied = false }, 2000)
  } catch {
    ad.copied = false
  }
}
</script>

<style scoped>
.bc-ads-page {
  padding: 2rem 0 4rem;
  color: #f5f5f7;
}
.bc-ads-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.bc-ads-eyebrow {
  color: #d32f2f;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 0.35rem;
}
.bc-ads-head h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
.bc-ads-lede { margin: 0; color: #a8adb8; max-width: 42rem; line-height: 1.55; }
.bc-ads-list { display: flex; flex-direction: column; gap: 1rem; }
.bc-ads-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(211, 47, 47, 0.22);
  border-radius: 12px;
  padding: 1.25rem;
}
.bc-ads-card h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
.bc-ads-creative-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.bc-ads-icon { font-size: 1.5rem; line-height: 1; }
.bc-ads-preview {
  margin: 0 0 1rem;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: rgba(0, 0, 0, 0.35);
  text-align: center;
}
.bc-ads-preview__img {
  display: block;
  max-width: min(100%, 420px);
  max-height: 280px;
  margin: 0 auto;
  object-fit: contain;
  border-radius: 8px;
}
.bc-ads-text {
  white-space: pre-wrap;
  font-size: 0.84rem;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 1rem;
  max-height: 420px;
  overflow-y: auto;
  margin: 0 0 0.75rem;
}
.text-muted { color: #8b919c; }
.small { font-size: 0.82rem; }
</style>
