import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

const TWILIO_SID = () => Deno.env.get('TWILIO_ACCOUNT_SID') ?? ''
const TWILIO_TOKEN = () => Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
const TWILIO_FROM = () => Deno.env.get('TWILIO_PHONE_NUMBER') ?? ''

async function hashCode (code: string): Promise<string> {
  const data = new TextEncoder().encode(code)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateCode (): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function requiresSmsVerification (
  admin: SupabaseClient,
  params: { userId: string; ipAddress?: string | null; deviceFingerprint?: string | null },
): Promise<{ required: boolean; reason?: string }> {
  const { data: profile } = await admin
    .from('profiles')
    .select('requires_phone_verification, phone_verified_at, safety_frozen_at, platform_banned_at')
    .eq('id', params.userId)
    .maybeSingle()

  if (profile?.requires_phone_verification && !profile.phone_verified_at) {
    return { required: true, reason: 'high_risk_ip_or_flagged' }
  }
  if (profile?.safety_frozen_at || profile?.platform_banned_at) {
    return { required: true, reason: 'flagged_account' }
  }

  const { data: regFp } = await admin
    .from('user_registration_fingerprints')
    .select('device_fingerprint')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (params.deviceFingerprint && regFp?.device_fingerprint && regFp.device_fingerprint !== params.deviceFingerprint) {
    return { required: true, reason: 'new_device_fingerprint' }
  }

  if (params.ipAddress) {
    const { data: risk } = await admin
      .from('ip_risk_cache')
      .select('risk_score')
      .eq('ip_address', params.ipAddress)
      .maybeSingle()
    if ((risk?.risk_score ?? 0) >= 70) return { required: true, reason: 'high_risk_ip' }
  }

  return { required: false }
}

async function sendSms (toPhone: string, body: string): Promise<{ sent?: boolean; skipped?: boolean }> {
  const sid = TWILIO_SID()
  const token = TWILIO_TOKEN()
  const from = TWILIO_FROM()
  if (!sid || !token || !from) return { skipped: true }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const params = new URLSearchParams({ To: toPhone, From: from, Body: body })
  const auth = btoa(`${sid}:${token}`)
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  return { sent: res.ok }
}

export async function issueVerificationCode (
  admin: SupabaseClient,
  params: {
    userId: string
    phoneNumber: string
    reason?: string
    ipAddress?: string | null
    deviceFingerprint?: string | null
  },
) {
  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()
  const codeHash = await hashCode(code)

  const { data, error } = await admin.from('sms_verification').insert({
    user_id: params.userId,
    phone_number: params.phoneNumber,
    code_hash: codeHash,
    reason: params.reason ?? 'verification',
    ip_address: params.ipAddress,
    device_fingerprint: params.deviceFingerprint,
    expires_at: expiresAt,
  }).select('id').single()

  if (error || !data?.id) return { ok: false as const, error: error?.message ?? 'insert_failed' }

  const sms = await sendSms(params.phoneNumber, `Your Franks Standard verification code is ${code}. Expires in 10 minutes.`)
  return { ok: true as const, verification_id: data.id, expires_at: expiresAt, sms_sent: !!sms.sent }
}

export async function verifySmsCode (
  admin: SupabaseClient,
  params: { userId: string; phoneNumber: string; code: string },
) {
  const { data: row } = await admin
    .from('sms_verification')
    .select('*')
    .eq('user_id', params.userId)
    .eq('phone_number', params.phoneNumber)
    .is('verified_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!row) return { ok: false as const, error: 'no_active_code' }
  if (new Date(row.expires_at) < new Date()) return { ok: false as const, error: 'code_expired' }
  if ((row.attempts || 0) >= MAX_ATTEMPTS) return { ok: false as const, error: 'too_many_attempts' }

  const match = (await hashCode(params.code)) === row.code_hash
  await admin.from('sms_verification').update({ attempts: (row.attempts || 0) + 1 }).eq('id', row.id)
  if (!match) return { ok: false as const, error: 'invalid_code' }

  await admin.from('sms_verification').update({ verified_at: new Date().toISOString() }).eq('id', row.id)
  await admin.from('profiles').update({
    phone_verified_at: new Date().toISOString(),
    requires_phone_verification: false,
    contact_phone: params.phoneNumber,
    phone_number: params.phoneNumber,
  }).eq('id', params.userId)

  return { ok: true as const, verified: true }
}
