/** Gate /ops/* routes (except /ops unlock landing) behind operator session. */
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || import.meta.prerender) return

  const path = to.path.replace(/\/$/, '') || '/'
  if (path === '/ops') return

  const { isAuthed } = useOpsSession()
  if (isAuthed.value) return

  if (import.meta.client && getStoredOpsPhrase()) {
    useOpsSession().grant()
    return
  }

  return navigateTo('/ops', { replace: true })
})
