import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'
import { sendBcOwnerEmail } from '#bc-server-utils/emailSender'

/** Approve, block, or reset a customer account. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const profileId = String(body?.profileId || '').trim()
  const status = String(body?.status || 'approved').trim() as 'approved' | 'blocked' | 'pending'

  if (!profileId) {
    throw createError({ statusCode: 400, statusMessage: 'profileId is required' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })

  const { data, error } = await sb.from('bc_customer_profiles').update({
    status,
    approved_at: status === 'approved' ? new Date().toISOString() : null,
  }).eq('id', profileId).select().single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logBcAudit('admin', null, 'customer_account_updated', 'profile', profileId, { status })

  if (status === 'approved' && data?.email) {
    await sendBcOwnerEmail(
      data.email,
      'Your B&C Performance Audio account is approved',
      'You can now sign in and complete purchases at bcpoweraudio.com/bc-audio/account',
    )
  }

  return { success: true, profile: data }
})
