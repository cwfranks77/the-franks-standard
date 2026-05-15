/**
 * PWA install via @vite-pwa/nuxt ($pwa.install).
 */
export function useAppInstall () {
  const nuxtApp = useNuxtApp()

  const isIos = ref(false)
  if (import.meta.client) {
    const ua = navigator.userAgent || ''
    isIos.value = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }

  const canInstall = computed(() => !!nuxtApp.$pwa?.showInstallPrompt)
  const isStandalone = computed(() => !!nuxtApp.$pwa?.isPWAInstalled)
  const swReady = computed(() => !!nuxtApp.$pwa?.swActivated)

  async function promptInstall () {
    const pwa = nuxtApp.$pwa
    if (!pwa?.showInstallPrompt) return false
    try {
      await pwa.install()
      return true
    } catch {
      return false
    }
  }

  return { canInstall, isIos, isStandalone, swReady, promptInstall }
}