export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server || import.meta.prerender) return
  const { isAuthed } = useOpsSession()
  if (isAuthed.value) return
  return navigateTo('/bc-audio/ops')
})
