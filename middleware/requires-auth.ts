export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }
  const { isAuthed: opsAuthed } = useOpsSession()
  if (opsAuthed.value) {
    return
  }
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
})