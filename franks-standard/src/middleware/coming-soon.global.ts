import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/** When coming soon is on, only the storefront home pages are reachable. */
export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  if (!config.public.comingSoon) return

  const bcPrimary = isBcPowerAudioPrimarySite(config.public.siteUrl)
  const path = to.path.replace(/\/+$/, '') || '/'

  if (bcPrimary) {
    if (path === '/') return
    return navigateTo('/', { replace: true })
  }

  const tfsHome = '/'
  const bcHome = '/bc-audio'

  if (path === tfsHome) return
  if (path === bcHome) return

  if (path.startsWith('/bc-audio')) {
    return navigateTo(bcHome, { replace: true })
  }

  return navigateTo(tfsHome, { replace: true })
})
