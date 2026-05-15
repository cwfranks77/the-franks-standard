/** PWA install — vite-pwa $pwa plus backup capture in plugins/pwa-capture.client.ts */
export function useAppInstall () {
  const nuxtApp = useNuxtApp()
  const tfsCanInstall = useState('tfs-pwa-can-install', () => false)

  const isIos = ref(false)
  const isChromium = ref(false)
  if (import.meta.client) {
    const ua = navigator.userAgent || ''
    isIos.value = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    isChromium.value = /Chrome|Edg|Brave|OPR|SamsungBrowser/i.test(ua) && !/Firefox/i.test(ua)
  }

  const canInstall = computed(() => {
    if (tfsCanInstall.value) return true
    const pwa = nuxtApp.$pwa
    return !!(pwa && unref(pwa.showInstallPrompt))
  })

  const isStandalone = computed(() => {
    if (!import.meta.client) return false
    const pwa = nuxtApp.$pwa
    if (pwa && unref(pwa.isPWAInstalled)) return true
    return window.matchMedia('(display-mode: standalone)').matches
  })

  const swReady = computed(() => {
    const pwa = nuxtApp.$pwa
    return !!(pwa && unref(pwa.swActivated))
  })

  async function promptInstall () {
    if (!import.meta.client) return false
    const run = nuxtApp.$tfsPwaInstall
    if (typeof run === 'function') return run()
    return false
  }

  return { canInstall, isIos, isChromium, isStandalone, swReady, promptInstall }
}