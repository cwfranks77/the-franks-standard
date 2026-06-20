import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'
import { checkRateLimit } from '../_shared/security/rateLimit.ts'
import { assertLoginAllowed, recordLoginAttempt } from '../_shared/security/bruteForce.ts'
import { bindSession } from '../_shared/security/sessionSecurity.ts'
import { scoreIp } from '../_shared/security/ipRisk.ts'
import { assertDeviceFingerprint } from '../_shared/security/deviceFingerprint.ts'
import { logAudit } from '../_shared/auditLog.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

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
  const ip = clientIpFromRequest(req)
  const identifier = String(body.identifier ?? body.email ?? '').trim().toLowerCase()
  const success = Boolean(body.success)
  const userId = body.user_id ? String(body.user_id) : null
  const deviceFp = String(body.device_fingerprint ?? '').trim() || null
  const accessToken = String(body.access_token ?? '').trim()

  if (!identifier && !userId) return json({ error: 'identifier_required' }, 400)

  const loginLimit = await checkRateLimit(admin, 'login', identifier || userId || ip, { ipAddress: ip, userId })
  if (!loginLimit.allowed) return json({ error: 'rate_limit_exceeded' }, 429)

  const allowed = await assertLoginAllowed(admin, identifier || userId || ip)
  if (!allowed.ok) {
    return json({
      error: allowed.error,
      captcha_required: allowed.captcha_required,
      frozen_until: allowed.frozen_until,
    }, 403)
  }

  if (userId && deviceFp) {
    const fp = await assertDeviceFingerprint(admin, userId, deviceFp, ip)
    if (!fp.ok) return json({ error: fp.error }, 403)
  }

  await scoreIp(admin, ip, userId)

  const result = await recordLoginAttempt(admin, {
    identifier: identifier || userId || ip,
    userId,
    success,
    ipAddress: ip,
    deviceFingerprint: deviceFp,
  })

  if (!result.ok) {
    return json({
      error: result.error,
      captcha_required: result.captcha_required,
      frozen_until: result.frozen_until,
    }, 403)
  }

  if (success && userId && accessToken) {
    const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accessToken))
      .then((buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''))
    await bindSession(admin, {
      userId,
      sessionTokenHash: tokenHash,
      ipAddress: ip,
      deviceFingerprint: deviceFp,
    })
    await logAudit(admin, {
      actorType: 'system',
      actorId: userId,
      action: 'session_bound',
      targetType: 'user_session',
      targetId: userId,
      details: { ip, device_fingerprint: deviceFp },
    })
  }

  return json({
    ok: true,
    captcha_required: result.captcha_required ?? false,
    failed_count: result.failed_count ?? 0,
  })
})
