import { getBcServiceSupabase, supabaseUnavailable } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

/** List auctions for the owner console. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const sb = getBcServiceSupabase()
  if (!sb) return supabaseUnavailable()

  const { data, error } = await sb
    .from('bc_auctions')
    .select('*')
    .order('end_time', { ascending: true })
    .limit(50)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { rows: data || [], source: 'supabase' }
})
