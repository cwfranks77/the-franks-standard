import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'
import {
  issueVerificationCode,
  requiresSmsVerification,
  verifySmsCode,
} from '../_shared/smsVerification.ts'

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
  const ip = clientIpFromRequest(req)
  const deviceFp = String(body.device_fingerprint ?? '').trim() || null
  const action = String(body.action ?? 'issue')

  if (action === 'check_required') {
    const check = await requiresSmsVerification(admin, { userId: user.id, ipAddress: ip, deviceFingerprint: deviceFp })
    return json({ ok: true, ...check })
  }

  if (action === 'issue') {
    const phone = String(body.phone_number ?? '').trim()
    if (!phone) return json({ error: 'phone_number_required' }, 400)
    const result = await issueVerificationCode(admin, {
      userId: user.id,
      phoneNumber: phone,
      reason: String(body.reason ?? 'verification'),
      ipAddress: ip,
      deviceFingerprint: deviceFp,
    })
    return result.ok ? json(result) : json({ error: result.error }, 400)
  }

  if (action === 'verify') {
    const phone = String(body.phone_number ?? '').trim()
    const code = String(body.code ?? '').trim()
    if (!phone || !code) return json({ error: 'phone_and_code_required' }, 400)
    const result = await verifySmsCode(admin, { userId: user.id, phoneNumber: phone, code })
    return result.ok ? json(result) : json({ error: result.error }, 400)
  }

  return json({ error: 'unknown_action' }, 400)
})
