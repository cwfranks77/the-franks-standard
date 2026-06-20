import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertMarketplaceCompliance } from '../_shared/marketplaceCompliance.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return json({ error: 'unauthorized' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const patch: Record<string, unknown> = {}

  if (body.contact_phone != null) {
    patch.contact_phone = String(body.contact_phone).trim().slice(0, 40)
  }
  if (body.contact_email != null) {
    patch.contact_email = String(body.contact_email).trim().slice(0, 200)
  }
  if (body.terms_accepted === true) {
    patch.terms_accepted = true
    patch.terms_accepted_at = new Date().toISOString()
  }
  if (body.monitoring_consent === true) {
    patch.monitoring_consent = true
    patch.monitoring_consent_at = new Date().toISOString()
  }

  if (Object.keys(patch).length < 1) {
    return json({ error: 'no_updates' }, 400)
  }

  const { error } = await admin.from('profiles').update(patch).eq('id', user.id)
  if (error) return json({ error: error.message }, 500)

  const compliance = await assertMarketplaceCompliance(admin, user.id)
  return json({
    ok: true,
    marketplace_ready: compliance.ok,
    missing: compliance.ok ? null : compliance.message,
  })
})
