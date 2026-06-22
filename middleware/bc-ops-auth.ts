import { getBcStorefrontPath } from '~/utils/bcSupport.js'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server || import.meta.prerender) return
  const { isAuthed } = useOpsSession()
  if (isAuthed.value) return
  return navigateTo(getBcStorefrontPath(), { replace: true })
})
