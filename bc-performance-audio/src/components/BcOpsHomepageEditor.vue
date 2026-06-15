<script setup>
import { BC_HOMEPAGE_DEFAULTS } from '~/utils/bcRetailPricing.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const emit = defineEmits(['saved', 'error'])

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const loadError = ref('')

const homepage = ref({ ...BC_HOMEPAGE_DEFAULTS })

async function load () {
  loading.value = true
  loadError.value = ''
  message.value = ''
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: 'bcHomepage' } })
    homepage.value = { ...BC_HOMEPAGE_DEFAULTS, ...(data?.bcHomepage || {}) }
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Could not load homepage text.'
    emit('error', loadError.value)
  } finally {
    loading.value = false
  }
}

async function save () {
  saving.value = true
  message.value = ''
  loadError.value = ''
  if (!getStoredOpsPhrase()) {
    loadError.value = 'Owner password needed — tap the B&C logo 5×, unlock, then save again.'
    saving.value = false
    return
  }
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: 'bcHomepage', payload: homepage.value },
    })
    message.value = 'Homepage text saved — refresh bcpoweraudio.com to see it (clear cache if needed).'
    emit('saved')
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Save failed'
    emit('error', loadError.value)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="bc-home-editor">
    <p v-if="loadError" class="bc-alert bc-alert--err">{{ loadError }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>
    <p class="bc-home-editor__note">
      Changes the ribbon, headline, and intro paragraph on your B&amp;C homepage. Colors are under the <strong>Colors &amp; theme</strong> tab.
    </p>
    <div v-if="loading" class="bc-muted">Loading…</div>
    <template v-else>
      <div class="bc-form-stack">
        <label>Top ribbon — left line<input v-model="homepage.ribbonLeft" class="input" type="text"></label>
        <label>Top ribbon — right line<input v-model="homepage.ribbonRight" class="input" type="text"></label>
        <label>Main headline<input v-model="homepage.heroTitle" class="input" type="text"></label>
        <label>Intro paragraph<textarea v-model="homepage.heroLede" class="input bc-textarea" rows="3" /></label>
      </div>
      <div class="bc-home-editor__actions">
        <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save homepage text' }}
        </button>
        <NuxtLink to="/bc-audio" class="btn btn-outline btn-sm" target="_blank">Preview homepage ↗</NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bc-home-editor__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 12px; line-height: 1.5; }
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-textarea { min-height: 80px; resize: vertical; }
.bc-home-editor__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
</style>
