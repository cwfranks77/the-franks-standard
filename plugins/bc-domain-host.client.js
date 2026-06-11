import { BC_POWER_AUDIO_HOSTS, isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/**
 * Franks marketplace build served on bcpoweraudio.com hostnames: keep root URL (no /bc-audio suffix).
 * B&C-primary builds serve the revised storefront at /.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  if (isBcPowerAudioPrimarySite(config.public.siteUrl)) return

  const host = window.location.hostname.toLowerCase()
  if (!BC_POWER_AUDIO_HOSTS.has(host)) return

  const path = window.location.pathname
  if (path === '/bc-audio' || path === '/bc-audio/') {
    window.location.replace(`/${window.location.search}${window.location.hash}`)
  }
})
