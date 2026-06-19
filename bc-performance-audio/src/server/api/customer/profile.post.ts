import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'

/** Create or refresh customer profile after Supabase auth signup (service role). */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = String(body?.userId || '').trim()
  const email = String(body?.email || '').trim()
  const fullName = String(body?.fullName || '').trim()
  const phone = String(body?.phone || '').trim() || null

  if (!userId || !email) {
    throw createError({ statusCode: 400, statusMessage: 'userId and email required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data, error } = await sb.from('bc_customer_profiles').upsert({
    user_id: userId,
    email,
    full_name: fullName || null,
    phone,
    status: 'pending',
  }, { onConflict: 'user_id' }).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, profile: data }
})
