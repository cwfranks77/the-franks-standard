<template>
  <div class="caption-builder card-panel">
    <div class="builder-grid">
      <label>
        Platform
        <select v-model="platform" class="select">
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
          <option value="reddit">Reddit (text post)</option>
        </select>
      </label>
      <label>
        Format
        <select v-model="format" class="select">
          <option v-for="f in formatOptions" :key="f.id" :value="f.id">{{ f.label }}</option>
        </select>
      </label>
      <label>
        Topic
        <select v-model="topic" class="select">
          <option value="fees">Fees &amp; comparison</option>
          <option value="coa">COA / trust</option>
          <option value="security">Security stack (full)</option>
          <option value="import">eBay import</option>
          <option value="founders">FOUNDERS10</option>
        </select>
      </label>
      <label>
        Link in post
        <select v-model="ctaPath" class="select">
          <option value="/sell">/sell</option>
          <option value="/learn/tools/fee-calculator">Fee calculator</option>
          <option value="/go/postcard">/go/postcard (tracked)</option>
          <option value="/join/founders10">FOUNDERS10</option>
          <option value="/learn/import-ebay-to-franks-standard">Import guide</option>
          <option value="/protection">Protection overview</option>
          <option value="/marketplace-policy">Marketplace policies</option>
          <option value="/social/community">Reddit &amp; blogs hub</option>
        </select>
      </label>
    </div>
    <p v-if="formatSpec" class="format-spec text-muted">{{ formatSpec.tip }} · {{ formatSpec.ratio }}</p>
    <pre class="caption-out">{{ caption }}</pre>
    <button type="button" class="btn btn-primary btn-sm" @click="copyCaption">{{ copied ? 'Copied' : 'Copy caption' }}</button>
  </div>
</template>

<script setup>
import { buildSocialCaption, FORMAT_SPECS } from '~/utils/socialPromotion.js'

const platform = ref('instagram')
const format = ref('reel')
const topic = ref('fees')
const ctaPath = ref('/sell')
const copied = ref(false)

const formatOptions = computed(() => {
  if (platform.value === 'instagram') {
    return [
      { id: 'reel', label: 'Reel' },
      { id: 'story', label: 'Story' },
      { id: 'carousel', label: 'Carousel' },
    ]
  }
  if (platform.value === 'tiktok') return [{ id: 'short', label: 'Short' }]
  if (platform.value === 'reddit') {
    return [
      { id: 'education', label: 'Educational post' },
      { id: 'founder', label: 'Founder story' },
      { id: 'ama', label: 'AMA' },
    ]
  }
  return [{ id: 'post', label: 'Text post' }]
})

watch(platform, () => {
  format.value = formatOptions.value[0]?.id || 'reel'
})

const formatSpec = computed(() => {
  const key = platform.value === 'tiktok' ? 'tiktok' : platform.value === 'linkedin' ? 'linkedin_post' : `instagram_${format.value}`
  return FORMAT_SPECS[key] || FORMAT_SPECS.instagram_reel
})

const caption = computed(() =>
  buildSocialCaption({
    platform: platform.value,
    format: format.value,
    topic: topic.value,
    ctaPath: ctaPath.value,
  }),
)

async function copyCaption () {
  try {
    await navigator.clipboard.writeText(caption.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {}
}
</script>

<style scoped>
.caption-builder { padding: 1.25rem; }
.builder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.builder-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
}
.format-spec { font-size: 0.85rem; margin-bottom: 12px; }
.caption-out {
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  white-space: pre-wrap;
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0 0 12px;
  color: #111827;
}
</style>
