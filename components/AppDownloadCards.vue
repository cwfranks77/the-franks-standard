<template>
  <div class="app-dl-cards">
    <a :href="androidApkUrl" class="app-dl-card" download rel="noopener">
      <span class="app-dl-icon" aria-hidden="true">Android</span>
      <span class="app-dl-title">Android app</span>
      <span class="app-dl-desc">Download the APK and open it on your phone to install.</span>
      <span class="btn btn-primary app-dl-btn">Download for Android</span>
    </a>
    <a :href="windowsInstallerUrl" class="app-dl-card" download rel="noopener">
      <span class="app-dl-icon" aria-hidden="true">Windows</span>
      <span class="app-dl-title">Windows app</span>
      <span class="app-dl-desc">Download the installer and run it on Windows 10 or 11.</span>
      <span class="btn btn-primary app-dl-btn">Download for Windows</span>
    </a>
  </div>
  <p class="app-dl-note text-muted">
    These are real apps, not a browser add-to-home-screen shortcut. After install, sign in with the same account you use on the site.
  </p>
</template>

<script setup>
const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl || 'https://thefranksstandard.com').replace(/\/$/, '')
const androidApkUrl = (config.public.androidApkUrl || '').trim() || `${siteUrl}/downloads/TheFranksStandard-android.apk`
const windowsInstallerUrl = (config.public.windowsInstallerUrl || '').trim() || `${siteUrl}/downloads/TheFranksStandard-windows-setup.exe`
</script>

<style scoped>
.app-dl-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 8px;
}
.app-dl-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--stone-800);
  background: var(--stone-900);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.app-dl-card:hover {
  border-color: rgba(201, 168, 76, 0.45);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.app-dl-icon { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); }
.app-dl-title { font-size: 1.1rem; font-weight: 700; color: var(--stone-50); }
.app-dl-desc { font-size: 0.88rem; color: var(--stone-400); line-height: 1.45; flex: 1; }
.app-dl-btn { margin-top: 8px; width: 100%; text-align: center; pointer-events: none; }
.app-dl-note { margin-top: 14px; font-size: 0.85rem; line-height: 1.5; max-width: 640px; }
</style>