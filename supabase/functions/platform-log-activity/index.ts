import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, json } from '../_shared/stripe.ts'

function clientIp (req: Request): string {
  return (
    req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  )
}

/** Log signed-in user activity with server-captured IP. */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return json({ error: 'auth_required' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!url || !anon || !service) return json({ error: 'server_misconfigured' }, 500)

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData?.user?.id) return json({ error: 'invalid_session' }, 401)

  const userId = userData.user.id
  const displayName =
    String(body.user_display_name || userData.user.user_metadata?.full_name || '').trim()
    || 'Account holder'

  const sb = createClient(url, service)
  const { error } = await sb.from('platform_activity_events').insert({
    user_id: userId,
    user_display_name: displayName,
    ip_address: clientIp(req),
    user_agent: req.headers.get('user-agent') || '',
    action: String(body.action || 'action'),
    action_category: String(body.action_category || 'general'),
    metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
  })

  if (error) return json({ error: error.message }, 500)
  return json({ ok: true })
})
