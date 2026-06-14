import { BC_POWER_AUDIO_HOSTS, isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/** B&C owner toolkit routes only work on the dedicated B&C website — not on thefranksstandard.com. */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server || import.meta.prerender) return

  const config = useRuntimeConfig()
  const host = window.location.hostname.toLowerCase()
  const onBcSite = BC_POWER_AUDIO_HOSTS.has(host) || isBcPowerAudioPrimarySite(config.public.siteUrl)

  if (!onBcSite) {
    return navigateTo('/bc-audio')
  }
})
