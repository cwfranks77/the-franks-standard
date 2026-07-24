import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

/**
 * Optional guard for owner routes.
 * /owner keeps its own unlock form — do not bounce that page away.
 * Other gated routes send locked visitors to /ops to enter the phrase.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || import.meta.prerender) return

  const path = to.path.replace(/\/$/, '') || '/'
  if (path === '/owner') return

  const { unlocked } = useOwnerAccess()
  if (unlocked.value) return

  if (import.meta.client && getStoredOpsPhrase()) {
    useOwnerAccess().unlocked.value = true
    return
  }

  return navigateTo('/ops', { replace: true })
})
