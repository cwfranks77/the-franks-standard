import { createRequire } from 'node:module'
import { requireOwnerAuth } from '../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'

const require = createRequire(import.meta.url)
const { sendNotification } = require('../../../backend/notifications/send_notification.js')
const { sendEmail } = require('../../../backend/email/send_email.js')

/**
 * POST /api/owner/broadcast — owner-only platform-wide broadcast.
 * Body: { message, subject?, channel: 'notification'|'email'|'both', audience?: 'all_users' }
 */
export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)

  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'POST required' })
  }

  const sb = getServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })
  }

  const body = await readBody(event)
  const message = String(body?.message ?? '').trim()
  const subject = String(body?.subject ?? 'Message from The Franks Standard').trim()
  const channel = String(body?.channel ?? 'notification')
  const audience = String(body?.audience ?? 'all_users')

  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'message required' })
  }

  if (!['notification', 'email', 'both'].includes(channel)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid channel' })
  }

  const { data: recipients } = await sb
    .from('profiles')
    .select('id')
    .is('platform_banned_at', null)
    .limit(5000)

  const list = recipients ?? []
  let notified = 0
  let emailed = 0

  for (const row of list) {
    if (channel === 'notification' || channel === 'both') {
      await sendNotification(sb, {
        userId: row.id,
        type: 'broadcast',
        message,
        metadata: { subject, audience },
      })
      notified += 1
    }

    if (channel === 'email' || channel === 'both') {
      const { data: authUser } = await sb.auth.admin.getUserById(row.id)
      const email = authUser?.user?.email
      if (email) {
        await sendEmail(sb, {
          toEmail: email,
          userId: row.id,
          templateKey: 'marketing_manual',
          templateData: { subject, body: message, message },
          ownerTriggered: true,
        })
        emailed += 1
      }
    }
  }

  const { data: log } = await sb.from('broadcast_logs').insert({
    owner_id: 'ops',
    channel,
    subject,
    message,
    audience,
    recipient_count: channel === 'email' ? emailed : notified,
    metadata: { notified, emailed, total_profiles: list.length },
  }).select('id').single()

  return {
    ok: true,
    broadcast_id: log?.id,
    channel,
    notified,
    emailed,
    note: channel.includes('email')
      ? 'Owner email blast dispatched and logged per recipient.'
      : 'In-platform notifications sent.',
  }
})
