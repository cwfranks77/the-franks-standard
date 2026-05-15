/**
 * PWA install — shared state; beforeinstallprompt is captured in plugins/pwa-install.client.ts.
 */
export function useAppInstall () {
  const canInstall = useState('pwa-can-install', () => false)
  const isIos = useState('pwa-is-ios', () => false)
  const isStandalone = useState('pwa-is-standalone', () => false)
  const isAndroid = useState('pwa-is-android', () => false)
  const swReady = useState('pwa-sw-ready', () => false)

  async function promptInstall () {
    if (!import.meta.client) return false
    const nuxtApp = useNuxtApp()
    const run = nuxtApp.$pwaPromptInstall
    if (typeof run === 'function') return run()
    return false
  }

  return { canInstall, isIos, isAndroid, isStandalone, swReady, promptInstall }
}