import { BC_POWER_AUDIO_HOSTS, isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/**
 * Franks marketplace build served on bcpoweraudio.com hostnames: send / to the B&C storefront.
 * B&C-primary builds already redirect via middleware + index.html script.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  if (isBcPowerAudioPrimarySite(config.public.siteUrl)) return

  const host = window.location.hostname.toLowerCase()
  if (!BC_POWER_AUDIO_HOSTS.has(host)) return

  const path = window.location.pathname
  if (path === '/' || path === '') {
    const target = `/bc-audio${window.location.search}${window.location.hash}`
    window.location.replace(target)
  }
})
