<script setup>
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const props = defineProps({
  /** compact = nav row; banner = floating strip; panel = account page block */
  variant: { type: String, default: 'banner' },
})

const config = useRuntimeConfig()
const isBcSite = computed(() => isBcPowerAudioPrimarySite(config.public.siteUrl))

const pwa = usePWA()
const showIosHelp = ref(false)
const isIos = ref(false)
const isStandalone = ref(false)

onMounted(() => {
  if (!import.meta.client) return
  const ua = navigator.userAgent || ''
  isIos.value = /iphone|ipad|ipod/i.test(ua)
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
})

const installed = computed(() => Boolean(pwa?.isPWAInstalled?.value || isStandalone.value))

const canPromptInstall = computed(() => Boolean(pwa?.showInstallPrompt?.value))

const visible = computed(() => {
  if (!isBcSite.value || installed.value) return false
  if (props.variant === 'panel') return true
  return canPromptInstall.value || isIos.value
})

async function installApp () {
  if (canPromptInstall.value && pwa?.install) {
    await pwa.install()
    return
  }
  if (isIos.value) {
    showIosHelp.value = true
  }
}

function dismiss () {
  pwa?.cancelInstall?.()
}
</script>

<template>
  <div v-if="visible" class="bc-install" :class="`bc-install--${variant}`">
    <template v-if="variant === 'panel'">
      <div class="bc-install__panel-head">
        <div class="bc-install__icon" aria-hidden="true">📲</div>
        <div>
          <h2>Download the B&amp;C app</h2>
          <p>Install on your phone or computer for one-tap access to the catalog, cart, and account.</p>
        </div>
      </div>
      <div class="bc-install__actions">
        <button type="button" class="btn btn-primary" @click="installApp">
          {{ canPromptInstall ? 'Install app' : (isIos ? 'How to install on iPhone' : 'Install from browser') }}
        </button>
        <button v-if="canPromptInstall" type="button" class="btn btn-outline btn-sm" @click="dismiss">Not now</button>
      </div>
      <p v-if="!canPromptInstall && !isIos" class="bc-install__hint">
        In Chrome or Edge: open the browser menu (⋮) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
      </p>
    </template>

    <template v-else-if="variant === 'banner'">
      <p class="bc-install__banner-text">
        <strong>Get the B&amp;C app</strong> — shop from your home screen.
      </p>
      <div class="bc-install__actions">
        <button type="button" class="bc-install__btn" @click="installApp">Install</button>
        <button type="button" class="bc-install__dismiss" aria-label="Dismiss" @click="dismiss">×</button>
      </div>
    </template>

    <button v-else type="button" class="bc-install__link" @click="installApp">
      Download app
    </button>

    <div v-if="showIosHelp" class="bc-install__ios" role="dialog" aria-labelledby="bc-ios-install-title">
      <div class="bc-install__ios-card">
        <h3 id="bc-ios-install-title">Install on iPhone or iPad</h3>
        <ol>
          <li>Open this site in <strong>Safari</strong>.</li>
          <li>Tap the <strong>Share</strong> button (square with arrow).</li>
          <li>Tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>.</li>
        </ol>
        <button type="button" class="btn btn-primary btn-sm" @click="showIosHelp = false">Got it</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc-install--banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #16161c 0%, #1a1012 100%);
  border-top: 1px solid rgba(211, 47, 47, 0.45);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.45);
}
.bc-install__banner-text {
  margin: 0;
  color: #e5e7eb;
  font-size: 0.9rem;
  line-height: 1.35;
}
.bc-install__banner-text strong { color: #ff5252; }
.bc-install__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.bc-install__btn {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  background: #d32f2f;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.bc-install__dismiss {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.bc-install--panel {
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: linear-gradient(145deg, #16161c, #120a0c);
  margin-top: 1.5rem;
}
.bc-install__panel-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.bc-install__panel-head h2 {
  margin: 0 0 6px;
  color: #ff5252;
  font-size: 1.1rem;
}
.bc-install__panel-head p {
  margin: 0;
  color: #9ca3af;
  line-height: 1.5;
  font-size: 0.92rem;
}
.bc-install__icon { font-size: 1.75rem; line-height: 1; }
.bc-install__hint {
  margin: 0.75rem 0 0;
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.45;
}
.bc-install__link {
  border: none;
  background: transparent;
  color: #ff8a80;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}
.bc-install__ios {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.bc-install__ios-card {
  max-width: 360px;
  width: 100%;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  color: #e5e7eb;
}
.bc-install__ios-card h3 { margin: 0 0 10px; color: #ff5252; }
.bc-install__ios-card ol { margin: 0 0 1rem 1.1rem; padding: 0; line-height: 1.55; }
</style>
