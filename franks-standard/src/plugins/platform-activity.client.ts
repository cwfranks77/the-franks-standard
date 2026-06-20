import { logPlatformActivity } from '~/utils/platformActivityRemote'
import { appendLocalActivity } from '~/utils/platformActivity'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const supabase = useSupabaseClient()
  const router = useRouter()

  router.afterEach((to) => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null
      const displayName = String(session?.user?.user_metadata?.full_name || '').trim() || 'Account holder'

      if (to.path.startsWith('/listing/') && to.params.id) {
        await logPlatformActivity(supabase, {
          action: `Viewed listing ${to.params.id}`,
          action_category: 'listing',
          event_type: 'listing_view',
          user_display_name: displayName,
          metadata: { listing_id: to.params.id, path: to.fullPath },
        })
        return
      }

      if (!userId) return

      await logPlatformActivity(supabase, {
        action: `Viewed ${to.path}`,
        action_category: 'browse',
        event_type: 'page_view',
        user_display_name: displayName,
        metadata: { path: to.fullPath },
      })
    })().catch(() => {
      appendLocalActivity({
        user_id: null,
        user_display_name: null,
        ip_address: 'browser-session',
        user_agent: navigator.userAgent,
        action: `Viewed ${to.path}`,
        action_category: 'browse',
        metadata: { path: to.fullPath },
      })
    })
  })
})
