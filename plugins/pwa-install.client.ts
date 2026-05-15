export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const canInstall = useState('pwa-can-install', () => false)
  const isIos = useState('pwa-is-ios', () => false)
  const isAndroid = useState('pwa-is-android', () => false)
  const isStandalone = useState('pwa-is-standalone', () => false)
  const swReady = useState('pwa-sw-ready', () => false)

  const ua = navigator.userAgent || ''
  isIos.value = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  isAndroid.value = /Android/i.test(ua)
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator).standalone === true

  let deferredPrompt = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    canInstall.value = false
  })

  nuxtApp.provide('pwaPromptInstall', async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
    return outcome === 'accepted'
  })

  const registerSw = () => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        swReady.value = true
        return reg
      })
      .catch(() => {})
  }

  if (document.readyState === 'complete') registerSw()
  else window.addEventListener('load', registerSw, { once: true })
})