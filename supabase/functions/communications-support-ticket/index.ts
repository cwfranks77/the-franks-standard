import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { sendNotification } from '../_shared/notifications.ts'
import { sendFollowupEmail } from '../_shared/supportFollowup.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const OPS_KEY = Deno.env.get('OPS_ACCESS_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? '')

  if (action === 'open_ticket') {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'unauthorized' }, 401)

    const subject = String(body.subject ?? '').trim()
    const description = String(body.description ?? '').trim()
    if (!subject || !description) return json({ error: 'missing_fields' }, 400)

    const { data: ticket, error } = await admin.from('support_tickets').insert({
      user_id: user.id,
      subject: subject.slice(0, 500),
      description: description.slice(0, 8000),
      status: 'open',
    }).select('id').single()

    if (error || !ticket?.id) return json({ error: error?.message ?? 'insert_failed' }, 500)

    await admin.from('support_messages').insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message: description.slice(0, 8000),
    })

    await sendNotification(admin, {
      userId: user.id,
      type: 'support_ticket',
      message: `Support ticket opened: ${subject}`,
      metadata: { ticket_id: ticket.id },
    })

    return json({ ok: true, ticket_id: ticket.id })
  }

  if (action === 'reply_to_ticket') {
    const opsKey = String(body.ops_key ?? '')
    const staffReply = opsKey && OPS_KEY && opsKey === OPS_KEY
    let senderId = ''

    if (staffReply) {
      senderId = String(body.sender_id ?? 'ops')
    } else {
      const authHeader = req.headers.get('Authorization') ?? ''
      if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)
      const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      })
      const { data: { user } } = await userClient.auth.getUser()
      if (!user) return json({ error: 'unauthorized' }, 401)
      senderId = user.id
    }

    const ticketId = String(body.ticket_id ?? '')
    const message = String(body.message ?? '').trim()
    if (!ticketId || !message) return json({ error: 'missing_fields' }, 400)

    const { data: ticket } = await admin.from('support_tickets').select('id, user_id').eq('id', ticketId).maybeSingle()
    if (!ticket) return json({ error: 'ticket_not_found' }, 404)
    if (!staffReply && ticket.user_id !== senderId) return json({ error: 'forbidden' }, 403)

    const staffSenderId = staffReply ? String(body.staff_user_id ?? ticket.user_id) : senderId
    const { data: msg, error } = await admin.from('support_messages').insert({
      ticket_id: ticketId,
      sender_id: staffSenderId,
      message: message.slice(0, 8000),
    }).select('id').single()

    if (error || !msg?.id) return json({ error: error?.message ?? 'insert_failed' }, 500)

    await admin.from('support_tickets').update({
      status: staffReply ? 'awaiting_user' : 'awaiting_staff',
      updated_at: new Date().toISOString(),
    }).eq('id', ticketId)

    await sendNotification(admin, {
      userId: ticket.user_id,
      type: 'support_ticket',
      message: staffReply ? 'Support replied to your ticket.' : 'New message on your support ticket.',
      metadata: { ticket_id: ticketId, message_id: msg.id },
    })

    return json({ ok: true, message_id: msg.id })
  }

  if (action === 'close_ticket') {
    const opsKey = String(body.ops_key ?? '')
    if (!opsKey || !OPS_KEY || opsKey !== OPS_KEY) return json({ error: 'unauthorized' }, 401)

    const ticketId = String(body.ticket_id ?? '')
    if (!ticketId) return json({ error: 'ticket_id_required' }, 400)

    const { data: ticket, error } = await admin
      .from('support_tickets')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select('id, user_id')
      .single()

    if (error || !ticket) return json({ error: error?.message ?? 'ticket_not_found' }, 500)

    await sendNotification(admin, {
      userId: ticket.user_id,
      type: 'support_ticket',
      message: 'Your support ticket has been closed.',
      metadata: { ticket_id: ticketId },
    })

    const followup = await sendFollowupEmail(admin, ticket.user_id, 'ticket', ticket.id)
    return json({ ok: true, ticket_id: ticket.id, followup })
  }

  return json({ error: 'unknown_action' }, 400)
})
