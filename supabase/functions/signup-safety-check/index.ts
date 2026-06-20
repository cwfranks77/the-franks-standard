import { createClient } from 'npm:@supabase/supabase-js@2'
import { checkRegistrationAllowed, recordRegistrationFingerprints } from '../_shared/antiRejoin.ts'
import { isBanned } from '../_shared/accountSafety.ts'
import { applyVpnPolicy } from '../_shared/vpnDetection.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'
import { assertLaunchNotLocked } from '../_shared/launchLock.ts'

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

  const ip = clientIpFromRequest(req)
  const deviceFp = String(body.device_fingerprint ?? '').trim() || null
  const browserFp = String(body.browser_fingerprint ?? '').trim() || null
  const userId = body.user_id ? String(body.user_id) : null

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const launchGate = await assertLaunchNotLocked(admin, 'registrations')
  if (!launchGate.ok) {
    return json({ allowed: false, blocked: true, reason: launchGate.error, message: launchGate.message }, 503)
  }

  const ban = await isBanned(admin, { userId, deviceFingerprint: deviceFp, browserFingerprint: browserFp, ipAddress: ip })
  if (ban.banned) {
    return json({ allowed: false, blocked: true, reason: ban.reason, source: ban.source }, 403)
  }

  const reg = await checkRegistrationAllowed(admin, {
    deviceFingerprint: deviceFp,
    browserFingerprint: browserFp,
    ipAddress: ip,
  })

  if (!reg.allowed) {
    return json({ allowed: false, blocked: true, reason: reg.reason }, 403)
  }

  const vpn = await applyVpnPolicy(admin, { userId, ipAddress: ip, req })

  if (userId && deviceFp) {
    await recordRegistrationFingerprints(admin, {
      userId,
      deviceFingerprint: deviceFp,
      browserFingerprint: browserFp,
      ipAddress: ip,
    })
  }

  return json({
    ok: true,
    allowed: true,
    requires_phone_verification: vpn.requiresPhoneVerification,
    vpn_suspicious: vpn.suspicious,
    vpn_reasons: vpn.reasons,
  })
})
