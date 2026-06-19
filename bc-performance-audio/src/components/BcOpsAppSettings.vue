<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const config = useRuntimeConfig()
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const error = ref('')

const app = ref({
  androidApkUrl: String(config.public.androidApkUrl || ''),
  windowsInstallerUrl: String(config.public.windowsInstallerUrl || ''),
  appTitle: 'B&C Performance Audio',
  appBlurb: 'Install the B&C app for quick catalog access and order tracking.',
})

async function load () {
  loading.value = true
  error.value = ''
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: 'bcAppSettings' } })
    if (data?.bcAppSettings) app.value = { ...app.value, ...data.bcAppSettings }
  } catch {
    // defaults ok
  } finally {
    loading.value = false
  }
}

async function save () {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: 'bcAppSettings', payload: app.value },
    })
    message.value = 'App settings saved. Also set NUXT_PUBLIC_ANDROID_APK_URL in deploy secrets for live download buttons.'
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.message || 'Save failed.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <p class="bc-muted">Set download links for the B&amp;C Performance Audio, LLC mobile and desktop app.</p>
    <p v-if="error" class="bc-alert bc-alert--err">{{ error }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>
    <div v-if="loading" class="bc-muted">Loading…</div>
    <template v-else>
      <div class="bc-form-stack">
        <label>App title<input v-model="app.appTitle" class="input" type="text"></label>
        <label>Short description<textarea v-model="app.appBlurb" class="input bc-textarea" rows="2" /></label>
        <label>Android APK URL<input v-model="app.androidApkUrl" class="input" type="url" placeholder="https://…"></label>
        <label>Windows installer URL<input v-model="app.windowsInstallerUrl" class="input" type="url" placeholder="https://…"></label>
      </div>
      <p class="bc-muted small">Customers see these on <NuxtLink to="/bc-audio/account">/bc-audio/account</NuxtLink>. PWA install also works from the browser menu on phones.</p>
      <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save app settings' }}</button>
    </template>
  </div>
</template>

<style scoped>
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; max-width: 480px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-textarea { min-height: 60px; resize: vertical; }
.bc-muted { color: #7a8190; font-size: 0.88rem; margin-bottom: 10px; }
.bc-muted.small { font-size: 0.78rem; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
</style>
