import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

/** Operator feed: activity, transactions, messages — phrase-gated, service role. */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const phrase = String(body.phrase ?? '')
  if (!(await verifyOpsKey(phrase))) {
    return json({ error: 'invalid_phrase' }, 403)
  }

  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!url || !key) return json({ error: 'server_misconfigured' }, 500)

  const sb = createClient(url, key)
  const limit = Math.min(200, Math.max(10, Number(body.limit) || 100))

  const [activityRes, ordersRes, messagesRes, contactRes] = await Promise.all([
    sb.from('platform_activity_events')
      .select('id,user_id,user_display_name,ip_address,user_agent,action,action_category,metadata,created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    sb.from('orders')
      .select('id,listing_id,buyer_id,seller_id,amount,status,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    sb.from('platform_messages')
      .select('id,conversation_id,sender_id,sender_display_name,body,status,blocked_pii,pii_violations,created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    sb.from('contact_messages')
      .select('id,name,email,subject,message,created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return json({
    ok: true,
    activity: activityRes.data ?? [],
    transactions: (ordersRes.data ?? []).map((o) => ({
      ...o,
      buyer_email: undefined,
      shipping_name: undefined,
    })),
    messages: messagesRes.data ?? [],
    contactInbox: contactRes.data ?? [],
    errors: {
      activity: activityRes.error?.message ?? null,
      transactions: ordersRes.error?.message ?? null,
      messages: messagesRes.error?.message ?? null,
      contact: contactRes.error?.message ?? null,
    },
  })
})
