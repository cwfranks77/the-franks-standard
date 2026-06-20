/**
 * Support ticket system — backend only.
 */

const { queueEmail } = require('../email/email_queue.js')
const { sendNotification } = require('../notifications/send_notification.js')

async function openTicket (admin, { userId, subject, description }) {
  const { data, error } = await admin.from('support_tickets').insert({
    user_id: userId,
    subject: String(subject).slice(0, 500),
    description: String(description).slice(0, 8000),
    status: 'open',
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  await admin.from('support_messages').insert({
    ticket_id: data.id,
    sender_id: userId,
    message: String(description).slice(0, 8000),
  })

  await sendNotification(admin, {
    userId,
    type: 'support_ticket',
    message: `Support ticket opened: ${subject}`,
    metadata: { ticket_id: data.id },
  })

  return { ok: true, ticket_id: data.id }
}

async function replyToTicket (admin, { ticketId, senderId, message, staffReply = false }) {
  const { data: ticket } = await admin
    .from('support_tickets')
    .select('id, user_id, status')
    .eq('id', ticketId)
    .maybeSingle()

  if (!ticket) return { ok: false, error: 'ticket_not_found' }
  if (!staffReply && ticket.user_id !== senderId) {
    return { ok: false, error: 'forbidden' }
  }

  const { data: msg, error } = await admin.from('support_messages').insert({
    ticket_id: ticketId,
    sender_id: senderId,
    message: String(message).slice(0, 8000),
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  await admin.from('support_tickets').update({
    status: staffReply ? 'awaiting_user' : 'awaiting_staff',
    updated_at: new Date().toISOString(),
  }).eq('id', ticketId)

  const notifyUserId = staffReply ? ticket.user_id : ticket.user_id
  await sendNotification(admin, {
    userId: notifyUserId,
    type: 'support_ticket',
    message: staffReply ? 'Support replied to your ticket.' : 'New message on your support ticket.',
    metadata: { ticket_id: ticketId, message_id: msg.id },
  })

  return { ok: true, message_id: msg.id }
}

async function closeTicket (admin, { ticketId, closedBy }) {
  const { data: ticket, error } = await admin
    .from('support_tickets')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .select('id, user_id')
    .single()

  if (error || !ticket) return { ok: false, error: error?.message || 'ticket_not_found' }

  await sendNotification(admin, {
    userId: ticket.user_id,
    type: 'support_ticket',
    message: 'Your support ticket has been closed.',
    metadata: { ticket_id: ticketId, closed_by: closedBy },
  })

  const followup = await autoFollowupEmail(admin, { userId: ticket.user_id, ticketId: ticket.id })
  return { ok: true, ticket_id: ticket.id, followup }
}

async function autoFollowupEmail (admin, { userId, ticketId }) {
  const { data: followup } = await admin
    .from('support_followup_emails')
    .insert({ user_id: userId, source_type: 'ticket', source_id: ticketId })
    .select('id, token')
    .single()

  const { data: authUser } = await admin.auth.admin.getUserById(userId)
  const toEmail = authUser?.user?.email
  if (!toEmail || !followup?.token) return { ok: true, skipped: true }

  const site = (process.env.SITE_URL || 'https://thefranksstandard.com').replace(/\/+$/, '')
  const surveyUrl = `${site}/support-rating?token=${encodeURIComponent(followup.token)}`

  await queueEmail(admin, {
    userId,
    toEmail,
    templateKey: 'support_followup',
    templateData: { survey_url: surveyUrl },
  })

  return { ok: true, followup_id: followup.id }
}

module.exports = {
  openTicket,
  replyToTicket,
  closeTicket,
  autoFollowupEmail,
  open_ticket: openTicket,
  reply_to_ticket: replyToTicket,
  close_ticket: closeTicket,
  auto_followup_email: autoFollowupEmail,
}
