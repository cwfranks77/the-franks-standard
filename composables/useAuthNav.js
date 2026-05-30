/** Header auth state: signed-in user + sign out. */
export function useAuthNav () {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const router = useRouter()

  const isSignedIn = computed(() => !!user.value?.id)
  const displayEmail = computed(() => {
    const e = user.value?.email
    if (!e) return 'Account'
    return e.length > 28 ? `${e.slice(0, 25)}…` : e
  })

  async function signOut () {
    await supabase.auth.signOut()
    await router.push('/')
  }

  return { user, isSignedIn, displayEmail, signOut }
}
