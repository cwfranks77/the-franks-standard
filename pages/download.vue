<template>
  <div class="dl-page">
    <div class="container narrow">
      <div class="dl-hero text-center">
        <p class="dl-emoji">📱</p>
        <h1>Download The Franks Standard</h1>
        <p class="text-muted lead">Install the app on your phone or tablet. Works like a native app — full screen and fast. No app store needed.</p>
      </div>

      <AppInstallBanner />

      <div class="dl-grid">
        <div class="dl-card">
          <div class="dl-card-icon">🤖</div>
          <h2>Android</h2>
          <p class="text-muted">Chrome or Edge on any Android phone or tablet.</p>
          <ol class="dl-steps">
            <li>Open <strong>thefranksstandard.com</strong> in Chrome</li>
            <li>Tap the <strong>menu</strong> (⋮ three dots) at the top right</li>
            <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
            <li>Tap <strong>"Install"</strong> in the popup</li>
          </ol>
          <button
            v-if="canInstall"
            type="button"
            class="btn btn-primary btn-lg dl-btn"
            @click="promptInstall"
          >Install now</button>
          <p v-else class="dl-note text-muted">Open this page on your Android phone to see the install button.</p>
        </div>

        <div class="dl-card">
          <div class="dl-card-icon">🍎</div>
          <h2>iPhone &amp; iPad</h2>
          <p class="text-muted">Safari on any iPhone or iPad.</p>
          <ol class="dl-steps">
            <li>Open <strong>thefranksstandard.com</strong> in <strong>Safari</strong> (not Chrome)</li>
            <li>Tap the <strong>Share</strong> button <span class="share-icon">⬆</span> at the bottom</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top right</li>
          </ol>
          <p class="dl-note text-muted">iOS requires Safari for installing web apps. Chrome on iPhone cannot install apps.</p>
        </div>

        <div class="dl-card">
          <div class="dl-card-icon">💻</div>
          <h2>Desktop</h2>
          <p class="text-muted">Chrome, Edge, or Brave on Windows, Mac, or Linux.</p>
          <ol class="dl-steps">
            <li>Open <strong>thefranksstandard.com</strong> in Chrome or Edge</li>
            <li>Click the <strong>install icon</strong> in the address bar (or menu → "Install app")</li>
            <li>Click <strong>"Install"</strong></li>
          </ol>
          <button
            v-if="canInstall"
            type="button"
            class="btn btn-primary btn-lg dl-btn"
            @click="promptInstall"
          >Install now</button>
        </div>
      </div>

      <div class="dl-faq">
        <h2 class="text-center">Frequently asked</h2>
        <details class="faq-item">
          <summary>Is this a real app?</summary>
          <p>Yes. It is a Progressive Web App (PWA). It installs to your home screen and runs full-screen in Chrome or Safari — like a native app without the app store.</p>
        </details>
        <details class="faq-item">
          <summary>Why not the App Store or Google Play?</summary>
          <p>PWAs install instantly with no download wait, no app store approval delays, and no storage bloat. You always get the latest version automatically. We may add native apps later — see our <NuxtLink to="/roadmap">Roadmap</NuxtLink>.</p>
        </details>
        <details class="faq-item">
          <summary>Will I get notifications?</summary>
          <p>Push notifications are on our roadmap. Currently, you can check your dashboard and listings anytime by opening the app.</p>
        </details>
        <details class="faq-item">
          <summary>Can I uninstall it?</summary>
          <p>Yes, same as any app. On Android: long-press the icon → Uninstall. On iPhone: long-press → Remove App. On desktop: right-click → Uninstall.</p>
        </details>
      </div>

      <div class="dl-cta text-center">
        <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create your free account</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Download — The Franks Standard',
  description: 'Install The Franks Standard app on Android, iPhone, iPad, or desktop. No app store needed.',
})

const { canInstall, promptInstall } = useAppInstall()
</script>

<style scoped>
.dl-page { padding: 48px 0 80px; }
.narrow { max-width: 900px; margin: 0 auto; }
.dl-hero { margin-bottom: 36px; }
.dl-emoji { font-size: 3.5rem; margin-bottom: 8px; }
h1 { font-size: 2rem; margin-bottom: 10px; }
.lead { font-size: 1.05rem; max-width: 600px; margin: 0 auto; }
.dl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 768px) { .dl-grid { grid-template-columns: 1fr; } }
.dl-card {
  padding: 28px 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); display: flex; flex-direction: column;
}
.dl-card-icon { font-size: 2.5rem; margin-bottom: 12px; }
.dl-card h2 { font-size: 1.25rem; margin-bottom: 6px; }
.dl-steps {
  margin: 16px 0; padding-left: 1.3rem; color: var(--stone-200);
  font-size: 0.9rem; line-height: 1.6; flex: 1;
}
.dl-steps li { margin-bottom: 8px; }
.dl-btn { width: 100%; margin-top: 12px; }
.dl-note { font-size: 0.82rem; margin-top: 12px; line-height: 1.4; }
.share-icon { display: inline-block; font-size: 1rem; vertical-align: middle; }
.dl-faq { max-width: 640px; margin: 48px auto 0; }
.dl-faq h2 { font-size: 1.3rem; margin-bottom: 20px; color: var(--gold); }
.faq-item {
  margin-bottom: 8px; padding: 14px 16px; border: 1px solid var(--stone-800);
  border-radius: var(--radius); background: var(--stone-900);
}
.faq-item summary { cursor: pointer; font-weight: 600; color: var(--stone-100); font-size: 0.92rem; }
.faq-item p { margin-top: 10px; font-size: 0.88rem; color: var(--stone-300); line-height: 1.6; }
.dl-cta { margin-top: 40px; }
</style>
