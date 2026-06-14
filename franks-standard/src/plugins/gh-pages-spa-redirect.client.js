/** Restore deep link when GitHub Pages served 404.html for a client route. */
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

function bcPrimaryAllowsPath (path) {
  if (!path || path === '/' || path === '/index.html') return true
  return path.startsWith('/bc-audio')
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  const bcPrimary = isBcPowerAudioPrimarySite(config.public.siteUrl)

  const saved = sessionStorage.getItem('ghSpaRedirect')
  if (!saved) return

  sessionStorage.removeItem('ghSpaRedirect')

  const target = saved.startsWith('/') ? saved : `/${saved}`
  const pathOnly = target.split(/[?#]/)[0] || '/'

  if (bcPrimary && !bcPrimaryAllowsPath(pathOnly)) {
    if (window.location.pathname !== '/') {
      navigateTo('/', { replace: true })
    }
    return
  }

  if (window.location.pathname + window.location.search + window.location.hash === target) return
  navigateTo(target, { replace: true })
})
