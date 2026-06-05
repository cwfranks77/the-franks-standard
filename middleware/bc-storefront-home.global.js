import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/** B&C GitHub Pages build: home URL opens the megastore, not the Franks marketplace shell. */
export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  if (!isBcPowerAudioPrimarySite(config.public.siteUrl)) return
  if (to.path !== '/' && to.path !== '') return
  return navigateTo('/bc-audio', { replace: true })
})
