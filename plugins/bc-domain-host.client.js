/**
 * When the static site is served on www.bcpoweraudio.com (same GitHub Pages deploy
 * as thefranksstandard.com), send visitors to the B&C storefront.
 */
const BC_HOSTS = new Set(['bcpoweraudio.com', 'www.bcpoweraudio.com'])

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const host = window.location.hostname.toLowerCase()
  if (!BC_HOSTS.has(host)) return

  const router = useRouter()
  const path = router.currentRoute.value.path
  if (path === '/' || path === '') {
    router.replace('/bc-audio')
  }
})
