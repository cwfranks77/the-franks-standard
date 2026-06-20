import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozenForActivity, isMessagingFrozen, loadSafetyProfile } from '../_shared/accountSafety.ts'
import { scanAndEnforceViolation } from '../_shared/violationEnforcement.ts'
import { logServerActivity } from '../_shared/platformActivityLog.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const conversationId = String(body.conversation_id ?? '').trim()
  const messageBody = String(body.body ?? '').trim().slice(0, 4000)
  if (!conversationId || messageBody.length < 1) {
    return json({ error: 'missing_fields' }, 400)
  }

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const ip = clientIpFromRequest(req)
  const deviceFp = String(body.device_fingerprint ?? '').trim() || null

  const activity = await assertAccountNotFrozenForActivity(admin, user.id)
  if (!activity.ok) return json({ error: activity.error, message: activity.message }, 403)

  const profile = await loadSafetyProfile(admin, user.id)
  if (isMessagingFrozen(profile)) {
    return json({ error: 'messaging_frozen', message: 'Messaging is temporarily frozen on this account.' }, 403)
  }

  const { data: conv } = await admin
    .from('platform_conversations')
    .select('id, buyer_id, seller_id')
    .eq('id', conversationId)
    .maybeSingle()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return json({ error: 'forbidden' }, 403)
  }

  const scan = await scanAndEnforceViolation({
    admin,
    userId: user.id,
    sourceType: 'message',
    sourceId: conversationId,
    content: messageBody,
    ipAddress: ip,
    deviceFingerprint: deviceFp,
    metadata: { conversation_id: conversationId },
  })

  if (scan.violated) {
    return json({
      error: 'message_blocked',
      message: 'This message violates marketplace policies.',
      violation_event_id: scan.violationEventId,
    }, 403)
  }

  const displayName = String(user.user_metadata?.full_name || 'Account holder')
  const { data: msg, error: msgErr } = await admin.from('platform_messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_display_name: displayName,
    body: messageBody,
    status: 'sent',
    blocked_pii: false,
    pii_violations: [],
  }).select('id, created_at').single()

  if (msgErr) return json({ error: msgErr.message }, 500)

  await logServerActivity(admin, {
    userId: user.id,
    eventType: 'message_sent',
    actionCategory: 'message',
    action: 'Message sent',
    metadata: { conversation_id: conversationId, message_id: msg?.id },
    ipAddress: ip,
    deviceFingerprint: deviceFp,
    userDisplayName: displayName,
  })

  return json({ ok: true, message_id: msg?.id, created_at: msg?.created_at })
})
