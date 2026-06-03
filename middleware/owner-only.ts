export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }
  const { isAuthed } = useOpsSession()
  if (isAuthed.value) {
    return
  }
  return navigateTo('/ops')
})
