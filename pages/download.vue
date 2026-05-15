<template>
  <div class="dl-page">
    <div class="container narrow">
      <div class="dl-hero text-center">
        <h1>Install The Franks Standard</h1>
        <p class="text-muted lead">Add the app to your home screen or desktop - full screen, fast, no app store.</p>

        <div v-if="!isStandalone" class="dl-install-hero">
          <button
            v-if="!isIos"
            type="button"
            class="btn btn-primary btn-lg dl-install-main"
            @click="onInstallClick"
          >
            {{ canInstall ? 'Install App' : 'Show Install Steps' }}
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary btn-lg dl-install-main"
            @click="iosHelpOpen = true"
          >
            Install on iPhone (Safari)
          </button>
          <p v-if="installMsg" class="dl-install-msg" role="alert">{{ installMsg }}</p>
          <p v-else-if="!canInstall && !isIos && isChromium" class="dl-install-hint text-muted">
            If the dialog does not open, use <strong>Chrome menu (three dots) -> Install app</strong> or the install icon in the address bar below.
          </p>
        </div>
        <p v-else class="text-muted">You are already using the installed app.</p>
      </div>

      <AppInstallBanner />

      <div id="browser-install" class="dl-grid">
        <div class="dl-card">
          <h2>Android</h2>
          <p class="text-muted">Chrome or Edge.</p>
          <ol class="dl-steps">
            <li>Open <strong>thefranksstandard.com</strong> in Chrome</li>
            <li>Tap <strong>three-dot menu</strong> -> <strong>Install app</strong></li>
            <li>Confirm <strong>Install</strong></li>
          </ol>
          <button v-if="!isIos && !isStandalone" type="button" class="btn btn-primary dl-btn" @click="onInstallClick">Install App</button>
        </div>

        <div class="dl-card">
          <h2>iPhone &amp; iPad</h2>
          <p class="text-muted">Safari only.</p>
          <ol class="dl-steps">
            <li>Open in <strong>Safari</strong></li>
            <li><strong>Share</strong> -> <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong></li>
          </ol>
        </div>

        <div class="dl-card">
          <h2>Desktop</h2>
          <p class="text-muted">Chrome, Edge, or Brave.</p>
          <ol class="dl-steps">
            <li>Install icon in the address bar, or</li>
            <li><strong>three-dot menu</strong> -> <strong>Install The Franks Standard</strong></li>
          </ol>
          <button v-if="!isIos && !isStandalone" type="button" class="btn btn-primary dl-btn" @click="onInstallClick">Install App</button>
        </div>
      </div>

      <div v-if="iosHelpOpen" class="dl-ios-help">
        <p><strong>Safari:</strong> Share -> Add to Home Screen -> Add</p>
        <button type="button" class="btn btn-outline btn-sm" @click="iosHelpOpen = false">Close</button>
      </div>

      <div class="dl-cta text-center">
        <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create your free account</NuxtLink>
        <p class="text-muted dl-help">
          Install giving you trouble? Email
          <a href="mailto:info@thefranksstandard.com?subject=Install%20help">info@thefranksstandard.com</a>
          or call <a href="tel:+18778370527">(877) 837-0527</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Install app - The Franks Standard',
  description: 'Install The Franks Standard on Android, iPhone, iPad, or desktop.',
})

const { canInstall, isIos, isChromium, isStandalone, promptInstall } = useAppInstall()
const installMsg = ref('')
const iosHelpOpen = ref(false)

async function onInstallClick () {
  installMsg.value = ''
  if (!canInstall.value && isChromium.value) {
    installMsg.value = 'Use Chrome menu (three dots) -> Install app, or use the install icon in the address bar.'
    document.getElementById('browser-install')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  const ok = await promptInstall()
  if (!ok) {
    installMsg.value = 'Use Chrome menu (three dots) -> Install app, or use the install icon in the address bar.'
    document.getElementById('browser-install')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.dl-page { padding: 48px 0 80px; }
.narrow { max-width: 900px; margin: 0 auto; }
.dl-hero { margin-bottom: 28px; }
h1 { font-size: 2rem; margin-bottom: 10px; }
.lead { font-size: 1.05rem; max-width: 600px; margin: 0 auto 20px; }
.dl-install-hero { margin-top: 8px; }
.dl-install-main { min-width: 220px; padding: 14px 28px; font-size: 1.05rem; }
.dl-install-msg, .dl-install-hint { margin-top: 12px; font-size: 0.9rem; max-width: 420px; margin-left: auto; margin-right: auto; }
.dl-install-msg { color: var(--gold, #ffd84d); }
.dl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 28px; }
@media (max-width: 768px) { .dl-grid { grid-template-columns: 1fr; } }
.dl-card {
  padding: 28px 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); display: flex; flex-direction: column;
}
.dl-card h2 { font-size: 1.25rem; margin-bottom: 6px; }
.dl-steps { margin: 16px 0; padding-left: 1.3rem; color: var(--stone-200); font-size: 0.9rem; line-height: 1.6; flex: 1; }
.dl-steps li { margin-bottom: 8px; }
.dl-btn { width: 100%; margin-top: 12px; }
.dl-ios-help {
  margin-top: 20px; padding: 16px; border-radius: var(--radius-lg);
  background: var(--stone-900); border: 1px solid var(--stone-800); text-align: center;
}
.dl-cta { margin-top: 40px; }
.dl-help {
  margin-top: 12px;
  font-size: 0.88rem;
}
.dl-help a { color: var(--gold); font-weight: 600; }
</style>
