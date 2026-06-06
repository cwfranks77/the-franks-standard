<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'

definePageMeta({
  layout: 'bc-audio',
  middleware: ['bc-ops-host', 'bc-ops-auth'],
})

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))
const { revoke } = useOpsSession()
const { theme, applyPreset, patch, resetTheme, presets } = useBcTheme()

const dropshipOk = ref(null)
const dropshipLoading = ref(false)

async function checkDropship () {
  dropshipLoading.value = true
  dropshipOk.value = null
  try {
    const data = await $fetch('/api/public/dropship-catalog', { query: { storeId: 'bc-performance-audio' } })
    dropshipOk.value = !data?.offline && data?.store?.is_live !== false
  } catch {
    dropshipOk.value = false
  } finally {
    dropshipLoading.value = false
  }
}

function signOut () {
  revoke()
  navigateTo('/bc-audio')
}

function clearSiteCache () {
  if (!import.meta.client) return
  try {
    localStorage.removeItem('bc-audio-theme-v1')
    sessionStorage.clear()
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()))
    }
    window.location.reload()
  } catch {
    window.location.reload()
  }
}

onMounted(checkDropship)

useSeoMeta({
  title: `B&C Owner Toolkit — ${BC_BRAND.full}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="bc-panel">
    <header class="bc-panel__head">
      <div>
        <p class="bc-panel__eyebrow">B&amp;C only · Owner toolkit</p>
        <h1>{{ BC_BRAND.full }} console</h1>
        <p class="bc-panel__sub">Maintain the storefront, theme, and troubleshooting — scoped to this website only.</p>
        <span class="bc-panel__badge">Owner mode active</span>
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
    </header>

    <section class="bc-panel__section">
      <h2>Storefront</h2>
      <div class="bc-panel__actions">
        <NuxtLink to="/bc-audio" class="btn btn-primary btn-sm">View live megastore</NuxtLink>
        <NuxtLink to="/bc-audio/open-door" class="btn btn-outline btn-sm">Open Door page</NuxtLink>
        <a :href="`tel:${support.phoneTel}`" class="btn btn-outline btn-sm">Test support line</a>
      </div>
      <p class="bc-panel__note">Support line shown to customers: <strong>{{ support.phoneDisplay }}</strong></p>
    </section>

    <section class="bc-panel__section">
      <h2>Health check</h2>
      <p class="bc-panel__note">
        Dropship catalog API:
        <strong v-if="dropshipLoading">Checking…</strong>
        <strong v-else-if="dropshipOk === true" class="ok">Online</strong>
        <strong v-else-if="dropshipOk === false" class="bad">Offline or error</strong>
        <span v-else>—</span>
      </p>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-outline btn-sm" :disabled="dropshipLoading" @click="checkDropship">
          Re-check catalog
        </button>
        <button type="button" class="btn btn-outline btn-sm" @click="clearSiteCache">Clear cache &amp; hard reload</button>
      </div>
      <p class="bc-panel__hint">Catalog products live in <code>content/products.json</code>. Checkout runs on The Franks Standard payment stack.</p>
    </section>

    <section class="bc-panel__section bc-panel__theme">
      <h2>Theme &amp; appearance</h2>
      <p class="bc-panel__note">Changes save in this browser and apply for all visitors on this device. Use presets or custom colors.</p>

      <div class="bc-panel__presets">
        <button
          v-for="p in presets"
          :key="p.id"
          type="button"
          class="bc-preset"
          :class="{ active: theme.presetId === p.id }"
          :style="{ '--swatch': p.accent }"
          @click="applyPreset(p.id)"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="bc-panel__colors">
        <label>Accent <input type="color" :value="theme.accent" @input="patch({ accent: $event.target.value })"></label>
        <label>Bright accent <input type="color" :value="theme.accentBright" @input="patch({ accentBright: $event.target.value })"></label>
        <label>Background <input type="color" :value="theme.bg" @input="patch({ bg: $event.target.value })"></label>
        <label>Card background <input type="color" :value="theme.bgCard" @input="patch({ bgCard: $event.target.value })"></label>
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="resetTheme">Reset to classic B&amp;C red</button>
    </section>

    <section class="bc-panel__section">
      <h2>Deploy &amp; parent ops</h2>
      <p class="bc-panel__note">Site deploys from GitHub Actions → <code>cwfranks77/bcpoweraudio</code> when you push B&amp;C-related files.</p>
      <div class="bc-panel__actions">
        <a
          href="https://github.com/cwfranks77/the-franks-standard/actions/workflows/deploy-bcpoweraudio-site.yml"
          class="btn btn-outline btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >B&amp;C deploy status ↗</a>
        <a
          href="https://github.com/cwfranks77/bcpoweraudio/settings/pages"
          class="btn btn-outline btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >HTTPS / domain settings ↗</a>
      </div>
    </section>

    <p class="bc-panel__footer">Unlock again anytime: tap the B&amp;C logo 5× on the storefront.</p>
  </div>
</template>

<style scoped>
.bc-panel { max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.bc-panel__head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 2rem; }
.bc-panel__eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.14em; color: #ff5252; margin: 0 0 6px; }
.bc-panel__head h1 { font-size: 1.75rem; margin: 0 0 8px; }
.bc-panel__sub { color: #9ca3af; font-size: 0.95rem; margin: 0 0 10px; }
.bc-panel__badge {
  display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700;
  background: rgba(211, 47, 47, 0.2); color: #ff5252; border: 1px solid rgba(211, 47, 47, 0.4);
}
.bc-panel__section {
  margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; background: var(--bc-bg-card, #16161c);
}
.bc-panel__section h2 { font-size: 1.05rem; color: #ff5252; margin: 0 0 12px; }
.bc-panel__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.bc-panel__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 8px; }
.bc-panel__hint { font-size: 0.8rem; color: #7a8190; margin: 8px 0 0; }
.bc-panel__note .ok { color: #4ade80; }
.bc-panel__note .bad { color: #ff5252; }
.bc-panel__presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.bc-preset {
  padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
  background: #0a0a0c; color: #f5f5f7; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
}
.bc-preset::before {
  content: ''; width: 12px; height: 12px; border-radius: 50%; background: var(--swatch);
}
.bc-preset.active { border-color: #ff5252; box-shadow: 0 0 0 1px rgba(255,82,82,0.4); }
.bc-panel__colors { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 12px; }
.bc-panel__colors label { font-size: 0.8rem; color: #9ca3af; display: flex; flex-direction: column; gap: 6px; }
.bc-panel__colors input[type="color"] { width: 100%; height: 36px; border: none; border-radius: 8px; cursor: pointer; }
.bc-panel__footer { font-size: 0.82rem; color: #7a8190; text-align: center; margin-top: 2rem; }
</style>
