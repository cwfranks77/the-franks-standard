import { logPlatformActivity } from '~/utils/platformActivityRemote'

/** Log sign-in and sign-out to platform_activity_events. */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const supabase = useSupabaseClient()
  let lastUserId: string | null = null

  supabase.auth.getSession().then(({ data }) => {
    lastUserId = data.session?.user?.id ?? null
  })

  supabase.auth.onAuthStateChange((event, session) => {
    const userId = session?.user?.id ?? null
    const displayName = String(session?.user?.user_metadata?.full_name || '').trim() || 'Account holder'

    if (event === 'SIGNED_IN' && userId && userId !== lastUserId) {
      logPlatformActivity(supabase, {
        action: 'Signed in',
        action_category: 'auth',
        event_type: 'login',
        user_display_name: displayName,
        metadata: { provider: session?.user?.app_metadata?.provider || 'email' },
      })
    }

    if (event === 'SIGNED_OUT' && lastUserId) {
      logPlatformActivity(supabase, {
        action: 'Signed out',
        action_category: 'auth',
        event_type: 'logout',
        metadata: { previous_user_id: lastUserId },
      })
    }

    lastUserId = userId
  })
})
