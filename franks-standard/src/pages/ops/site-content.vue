<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Ops — Site content & ads', robots: 'noindex, nofollow' })

const tab = ref('homepage')
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const error = ref('')

const homepage = ref({})
const ads = ref({ platforms: [] })

async function load () {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch('/api/ops/site-content')
    homepage.value = { ...(data.homepage || {}) }
    ads.value = {
      platforms: Array.isArray(data.ads?.platforms) ? data.ads.platforms.map((p) => ({ ...p })) : [],
    }
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.message || 'Could not load site content'
  } finally {
    loading.value = false
  }
}

function addAd () {
  ads.value.platforms.push({
    id: `ad-${Date.now()}`,
    platform: 'New platform',
    format: '',
    text: '',
    image: '',
    tip: '',
  })
}

function removeAd (index) {
  ads.value.platforms.splice(index, 1)
}

function addTrustBlock () {
  if (!Array.isArray(homepage.value.trustBlocks)) homepage.value.trustBlocks = []
  homepage.value.trustBlocks.push({ title: '', desc: '' })
}

async function saveHomepage () {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    await $fetch('/api/ops/site-content', { method: 'PUT', body: { contentKey: 'homepage', payload: homepage.value } })
    message.value = 'Homepage copy saved.'
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

async function saveAds () {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    await $fetch('/api/ops/site-content', { method: 'PUT', body: { contentKey: 'ads', payload: ads.value } })
    message.value = 'Ad copy saved. Ops ads page and exports use this content.'
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="ops-cms">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Site content &amp; marketing ads</h1>
      <p class="text-muted lead">
        Edit live homepage copy and ad platform text. Persisted in Supabase when migration
        <code>037_owner_cms.sql</code> is applied.
      </p>

      <div class="tabs">
        <button type="button" class="tab" :class="{ active: tab === 'homepage' }" @click="tab = 'homepage'">Homepage</button>
        <button type="button" class="tab" :class="{ active: tab === 'ads' }" @click="tab = 'ads'">Ads &amp; social copy</button>
      </div>

      <p v-if="error" class="alert alert-err" role="alert">{{ error }}</p>
      <p v-if="message" class="alert alert-ok" role="status">{{ message }}</p>
      <div v-if="loading" class="text-muted">Loading…</div>

      <section v-else-if="tab === 'homepage'" class="card panel">
        <h2>Homepage hero &amp; trust band</h2>
        <div class="form-grid">
          <label class="span-2">Ribbon<input v-model="homepage.heroRibbon" class="input" type="text"></label>
          <label>Title line 1<input v-model="homepage.heroTitleLine1" class="input" type="text"></label>
          <label>Title line 2 (accent)<input v-model="homepage.heroTitleLine2" class="input" type="text"></label>
          <label class="span-2">Title sub<input v-model="homepage.heroTitleSub" class="input" type="text"></label>
          <label class="span-2">Hero lede<textarea v-model="homepage.heroLede" class="input area" rows="4" /></label>
          <label class="span-2">Facilitator one-liner<input v-model="homepage.facilitatorOneLiner" class="input" type="text"></label>
          <label>Featured store title<input v-model="homepage.featuredStoreTitle" class="input" type="text"></label>
          <label class="span-2">Featured store description<textarea v-model="homepage.featuredStoreDesc" class="input area" rows="2" /></label>
        </div>

        <h3 class="subhead">Trust blocks</h3>
        <div v-for="(block, i) in homepage.trustBlocks || []" :key="i" class="trust-row">
          <input v-model="block.title" class="input" type="text" placeholder="Title">
          <input v-model="block.desc" class="input" type="text" placeholder="Description">
        </div>
        <button type="button" class="btn btn-outline btn-sm mt-1" @click="addTrustBlock">+ Trust block</button>

        <div class="save-row">
          <button type="button" class="btn btn-primary" :disabled="saving" @click="saveHomepage">{{ saving ? 'Saving…' : 'Save homepage' }}</button>
          <NuxtLink to="/" class="btn btn-outline" target="_blank">Preview home ↗</NuxtLink>
        </div>
      </section>

      <section v-else class="card panel">
        <div class="panel-head">
          <h2>Ad platforms ({{ ads.platforms.length }})</h2>
          <button type="button" class="btn btn-outline btn-sm" @click="addAd">+ Add platform</button>
        </div>
        <p class="text-muted small">Used on <NuxtLink to="/ops/ads">/ops/ads</NuxtLink> and export scripts.</p>

        <div v-for="(ad, index) in ads.platforms" :key="ad.id || index" class="ad-card">
          <div class="panel-head">
            <strong>{{ ad.platform || 'Platform' }}</strong>
            <button type="button" class="btn btn-outline btn-sm" @click="removeAd(index)">Remove</button>
          </div>
          <div class="form-grid">
            <label>Platform name<input v-model="ad.platform" class="input" type="text"></label>
            <label>Format<input v-model="ad.format" class="input" type="text"></label>
            <label class="span-2">Ad copy<textarea v-model="ad.text" class="input area" rows="5" /></label>
            <label>Image path<input v-model="ad.image" class="input" type="text"></label>
            <label>Tip<input v-model="ad.tip" class="input" type="text"></label>
          </div>
        </div>

        <div class="save-row">
          <button type="button" class="btn btn-primary" :disabled="saving" @click="saveAds">{{ saving ? 'Saving…' : 'Save ads' }}</button>
          <NuxtLink to="/ops/ads" class="btn btn-outline">Open ads desk</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ops-cms { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.lead { max-width: 760px; margin-bottom: 16px; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tab { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border); background: #fff; font-weight: 700; cursor: pointer; }
.tab.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.card.panel { padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-faint); }
.span-2 { grid-column: 1 / -1; }
.input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
.area { min-height: 72px; resize: vertical; }
.subhead { margin: 18px 0 10px; font-size: 0.95rem; }
.trust-row { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-bottom: 8px; }
.ad-card { border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 12px; background: var(--surface-sunken); }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.save-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.alert { padding: 12px 14px; border-radius: 8px; margin-bottom: 12px; }
.alert-err { background: #fff1f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert-ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.mt-1 { margin-top: 10px; }
@media (max-width: 720px) { .form-grid, .trust-row { grid-template-columns: 1fr; } }
</style>
