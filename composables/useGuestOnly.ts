/** Redirect signed-in users away from login/register. */
export async function useGuestOnly () {
  if (!import.meta.client) return
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await navigateTo('/dashboard')
  }
}