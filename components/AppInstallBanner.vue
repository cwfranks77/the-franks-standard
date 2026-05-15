<template>
  <div v-if="!isStandalone" class="install-banner">
    <div class="install-inner">
      <div class="install-copy">
        <p class="install-title">Get the app</p>
        <p class="install-sub">
          <template v-if="canInstall">Tap Install — Chrome is ready to add this site to your home screen.</template>
          <template v-else-if="isIos">Use Safari Share → Add to Home Screen (iOS has no in-page install button).</template>
          <template v-else>Chrome/Edge: menu (⋮) → Install app, or the install icon in the address bar.</template>
        </p>
      </div>
      <div class="install-buttons">
        <button
          v-if="canInstall"
          type="button"
          class="btn btn-primary btn-sm install-btn"
          @click="doInstall"
        >
          Install App
        </button>
        <button
          v-else-if="isIos"
          type="button"
          class="btn btn-primary btn-sm install-btn"
          @click="showIosHelp = !showIosHelp"
        >
          Install on iPhone
        </button>
        <button
          v-else-if="isChromium"
          type="button"
          class="btn btn-primary btn-sm install-btn"
          @click="doInstall"
        >
          Install App
        </button>
        <button
          v-else
          type="button"
          class="btn btn-outline btn-sm install-btn"
          @click="showGenericHelp = !showGenericHelp"
        >
          {{ showGenericHelp ? 'Hide steps' : 'How to install' }}
        </button>
      </div>
    </div>
    <p v-if="installMsg" class="install-note" role="alert">{{ installMsg }}</p>
    <div v-if="showIosHelp" class="install-help">
      <p><strong>Install on iPhone / iPad:</strong></p>
      <ol>
        <li>Tap the <strong>Share</strong> button (square with arrow) in Safari</li>
        <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
        <li>Tap <strong>"Add"</strong> — the app icon appears on your home screen</li>
      </ol>
    </div>
    <div v-if="showGenericHelp" class="install-help">
      <p><strong>Install on Android / Desktop:</strong></p>
      <ol>
        <li>Use <strong>Chrome</strong> or <strong>Edge</strong> on <strong>thefranksstandard.com</strong></li>
        <li>Look for <strong>Install</strong> in the address bar, or</li>
        <li>Menu <strong>⋮</strong> → <strong>Install app</strong> / <strong>Install The Franks Standard</strong></li>
      </ol>
      <p v-if="!canInstall && swReady" class="install-note">App shell is ready — refresh once if Install is not in the menu yet.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  openHelp: { type: Boolean, default: false },
})

const { canInstall, isIos, isChromium, isStandalone, swReady, promptInstall } = useAppInstall()
const showIosHelp = ref(false)
const showGenericHelp = ref(props.openHelp)

onMounted(() => {
  if (props.openHelp && !isIos.value) showGenericHelp.value = true
})

const installMsg = ref('')

async function doInstall () {
  installMsg.value = ''
  const ok = await promptInstall()
  if (!ok) {
    installMsg.value = 'If nothing opened, use Chrome menu (three dots) then Install app.'
  }
}
</script>

<style scoped>
.install-banner {
  padding: 20px;
  border: 1px solid rgba(0, 224, 255, 0.25);
  border-radius: var(--radius-lg, 12px);
  background: linear-gradient(135deg, rgba(0, 224, 255, 0.06), rgba(139, 92, 255, 0.06));
}
.install-inner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.install-title {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.1rem;
  color: var(--stone-100); margin: 0 0 4px;
}
.install-sub {
  font-size: 0.85rem; color: var(--stone-400); margin: 0; line-height: 1.4;
}
.install-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.install-btn { white-space: nowrap; }
.install-help {
  margin-top: 14px; padding: 14px;
  background: rgba(0, 0, 0, 0.2); border-radius: var(--radius, 8px);
  font-size: 0.88rem; color: var(--stone-200); line-height: 1.6;
}
.install-help ol { margin: 8px 0 0; padding-left: 1.2rem; }
.install-help li { margin-bottom: 6px; }
.install-note { margin: 10px 0 0; font-size: 0.82rem; color: var(--stone-400); }
</style>
