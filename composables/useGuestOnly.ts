/** Redirect signed-in users away from login/register — unless they need another account. */
export async function useGuestOnly () {
  if (!import.meta.client) return
  const route = useRoute()
  const supabase = useSupabaseClient()

  if (route.query.switch === '1') {
    await supabase.auth.signOut()
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  // Keep login page when coming from sell/checkout so user can switch accounts.
  if (typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')) {
    return
  }

  await navigateTo('/dashboard')
}