<template>
  <div v-if="!isStandalone" class="install-banner">
    <div class="install-inner">
      <div class="install-copy">
        <p class="install-title">Get the app</p>
        <p class="install-sub">Install The Franks Standard on your phone — works like a native app, no app store needed.</p>
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
          v-else
          type="button"
          class="btn btn-outline btn-sm install-btn"
          @click="showGenericHelp = !showGenericHelp"
        >
          How to install
        </button>
      </div>
    </div>
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
        <li>Open this site in <strong>Chrome</strong> or <strong>Edge</strong></li>
        <li>Tap the <strong>menu</strong> (three dots) in your browser</li>
        <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
      </ol>
    </div>
  </div>
</template>

<script setup>
const { canInstall, isIos, isStandalone, promptInstall } = useAppInstall()
const showIosHelp = ref(false)
const showGenericHelp = ref(false)

async function doInstall () {
  await promptInstall()
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
</style>
