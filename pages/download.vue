<template>
  <div class="dl-page">
    <div class="container narrow">
      <div class="dl-hero text-center">
        <h1>Install The Franks Standard</h1>
        <p class="text-muted lead">One install spot. Tap the button below.</p>

        <div v-if="!isStandalone" class="dl-install-hero">
          <button
            type="button"
            class="btn btn-primary btn-lg dl-install-main"
            @click="onInstallClick"
          >
            Install App
          </button>
          <p v-if="installMsg" class="dl-install-msg" role="alert">{{ installMsg }}</p>
          <p v-else-if="!canInstall && !isIos && isChromium" class="dl-install-hint text-muted">
            If the popup does not appear, open browser menu (three dots) and tap <strong>Install app</strong>.
          </p>
        </div>
        <p v-else class="text-muted">You are already using the installed app.</p>
      </div>

      <div v-if="installHelpOpen && !isStandalone" class="dl-install-alert" role="status">
        <h3>Quick fallback steps</h3>
        <p v-if="isIos">
          iPhone/iPad: open in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
        </p>
        <p v-else-if="isChromium">
          Chrome/Edge: open the <strong>three-dot menu</strong>, then tap <strong>Install app</strong>.
        </p>
        <p v-else>
          Use Chrome, Edge, or Safari and install from the browser menu.
        </p>
        <button type="button" class="btn btn-outline btn-sm" @click="installHelpOpen = false">Hide</button>
      </div>

      <AppInstallBanner />

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
const installHelpOpen = ref(false)

onMounted(async () => {
  if (!import.meta.client) {
    return
  }
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
    }
  } catch {
    // Ignore cache reset errors; install flow should still work.
  }
})

async function onInstallClick () {
  installMsg.value = ''
  installHelpOpen.value = false

  if (isIos.value) {
    iosHelpOpen.value = true
    installHelpOpen.value = true
    installMsg.value = 'iPhone/iPad cannot auto-download from a button. Use Safari -> Share -> Add to Home Screen.'
    return
  }

  // Always attempt native prompt first. Some environments can still open
  // install UI even when canInstall isn't currently true.
  const ok = await promptInstall()
  if (ok) {
    installMsg.value = 'Install prompt opened. Approve it to install the app.'
    return
  }

  if (isChromium.value) {
    installMsg.value = 'No native prompt was available. Use Chrome/Edge menu (three dots) -> Install app, or the install icon in the address bar.'
  } else {
    installMsg.value = 'Native install prompt not available in this browser. Follow the platform steps below.'
  }
  installHelpOpen.value = true
}
</script>

<style scoped>
.dl-page { padding: 48px 0 80px; color: #111827; }
.dl-page .text-muted { color: #1f2937 !important; font-weight: 700; }
.narrow { max-width: 900px; margin: 0 auto; }
.dl-hero { margin-bottom: 28px; }
h1 { font-size: 2rem; margin-bottom: 10px; color: #111827; }
.lead { font-size: 1.05rem; max-width: 600px; margin: 0 auto 20px; }
.dl-install-hero { margin-top: 8px; }
.dl-install-main { min-width: 220px; padding: 14px 28px; font-size: 1.05rem; }
.dl-install-msg, .dl-install-hint { margin-top: 12px; font-size: 0.9rem; max-width: 420px; margin-left: auto; margin-right: auto; }
.dl-install-msg { color: #1f2937; font-weight: 700; }
.dl-install-alert {
  margin: 14px auto 0;
  max-width: 640px;
  text-align: left;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.35);
}
.dl-install-alert h3 { margin: 0 0 8px; color: var(--gold); font-size: 1rem; }
.dl-install-alert p { margin: 0; color: #1f2937; font-size: 0.9rem; line-height: 1.5; }
.dl-install-alert-actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
.dl-cta { margin-top: 40px; }
.dl-help {
  margin-top: 12px;
  font-size: 0.88rem;
}
.dl-help a { color: var(--gold); font-weight: 600; }
</style>
