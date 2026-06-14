import {
  LIST_ITEM_COA_PATH,
  LIST_ITEM_START_PATH,
} from '~/utils/listItemRoutes.js'

/** Public chooser + COA step; sell form still gates publish in-page. */
const PUBLIC_SELL_PATHS = new Set([LIST_ITEM_START_PATH, LIST_ITEM_COA_PATH])

export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.replace(/\/$/, '') || '/'
  if (PUBLIC_SELL_PATHS.has(path)) return

  if (import.meta.server) return

  const { isAuthed: opsAuthed } = useOpsSession()
  if (opsAuthed.value) return

  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
