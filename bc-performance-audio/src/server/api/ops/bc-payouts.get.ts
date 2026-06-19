import { getBcServiceSupabase, supabaseUnavailable } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const sb = getBcServiceSupabase()
  if (!sb) return supabaseUnavailable()

  const { data, error } = await sb
    .from('bc_payouts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { rows: data || [], source: 'supabase' }
})
