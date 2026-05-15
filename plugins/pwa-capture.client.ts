/** Always capture beforeinstallprompt (vite-pwa may skip if user dismissed earlier). */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const canInstall = useState('tfs-pwa-can-install', () => false)
  let deferred = null

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
    const pwa = nuxtApp.$pwa
    if (pwa?.showInstallPrompt) {
      try {
        await pwa.install()
        return true
      } catch { /* fall through */ }
    }
    if (!deferred) return false
    try {
      await deferred.prompt()
      await deferred.userChoice
      deferred = null
      canInstall.value = false
      return true
    } catch {
      return false
    }
  })
})