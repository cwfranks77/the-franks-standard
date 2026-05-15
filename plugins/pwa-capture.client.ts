/** Always capture beforeinstallprompt (vite-pwa may skip if user dismissed earlier). */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const canInstall = useState('tfs-pwa-can-install', () => false)
  let deferred: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    deferred = null
    canInstall.value = false
  })

  nuxtApp.provide('tfsPwaInstall', async () => {
    // Prefer the captured browser event because it gives deterministic
    // control over prompt() and userChoice outcome.
    if (deferred) {
      try {
        await deferred.prompt()
        const choice = await deferred.userChoice
        deferred = null
        canInstall.value = false
        return String(choice?.outcome || '') === 'accepted'
      } catch {
        return false
      }
    }

    // Fallback for environments where the event wasn't captured but
    // vite-pwa still exposes an install API.
    const pwa = nuxtApp.$pwa
    if (pwa?.showInstallPrompt) {
      try {
        const result = await pwa.install()
        const outcome = String((result as any)?.outcome || '')
        if (outcome) return outcome === 'accepted'
        // If no explicit outcome is returned, report success only when
        // install is now considered active.
        return Boolean((pwa as any)?.isPWAInstalled)
      } catch {
        return false
      }
    }

    return false
  })
})