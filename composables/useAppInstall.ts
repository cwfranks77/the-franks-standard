/**
 * PWA install prompt for Android / desktop Chrome, plus iOS detection.
 * Captures the beforeinstallprompt event and exposes a trigger.
 */
export function useAppInstall () {
  const canInstall = ref(false)
  const isIos = ref(false)
  const isStandalone = ref(false)
  let deferredPrompt: any = null

  if (import.meta.client) {
    const ua = navigator.userAgent || ''
    isIos.value = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      canInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      canInstall.value = false
      deferredPrompt = null
    })
  }

  async function promptInstall () {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
    return result.outcome === 'accepted'
  }

  return { canInstall, isIos, isStandalone, promptInstall }
}
