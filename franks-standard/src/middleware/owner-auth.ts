import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

/** Block /owner console until operator phrase verified (unlock form stays on /ops). */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server || import.meta.prerender) return

  const { unlocked } = useOwnerAccess()
  if (unlocked.value) return

  if (import.meta.client && getStoredOpsPhrase()) {
    useOwnerAccess().unlocked.value = true
    return
  }

  return navigateTo('/ops', { replace: true })
})
