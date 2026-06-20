/**
 * SMS verification — 6-digit codes, 10-minute expiry, hashed storage.
 */

const { createHash, randomInt } = require('node:crypto')
const { sendSms } = require('./send_sms.js')

const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function hashCode (code) {
  return createHash('sha256').update(String(code)).digest('hex')
}

function generateCode () {
  return String(randomInt(100000, 999999))
}

async function requiresSmsVerification (admin, { userId, ipAddress, deviceFingerprint }) {
  if (!admin || !userId) return { required: false }

  const { data: profile } = await admin
    .from('profiles')
    .select('requires_phone_verification, phone_verified_at, safety_frozen_at, platform_banned_at')
    .eq('id', userId)
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (deviceFingerprint && regFp?.device_fingerprint && regFp.device_fingerprint !== deviceFingerprint) {
    return { required: true, reason: 'new_device_fingerprint' }
  }

  if (ipAddress) {
    const { data: risk } = await admin
      .from('ip_risk_cache')
      .select('risk_score')
      .eq('ip_address', ipAddress)
      .maybeSingle()
    if ((risk?.risk_score ?? 0) >= 70) {
      return { required: true, reason: 'high_risk_ip' }
    }
  }

  return { required: false }
}

async function issueVerificationCode (admin, {
  userId,
  phoneNumber,
  reason = 'verification',
  ipAddress = null,
  deviceFingerprint = null,
}) {
  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

  const { data, error } = await admin.from('sms_verification').insert({
    user_id: userId,
    phone_number: phoneNumber,
    code_hash: hashCode(code),
    reason,
    ip_address: ipAddress,
    device_fingerprint: deviceFingerprint,
    expires_at: expiresAt,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  const sms = await sendSms(admin, {
    toPhone: phoneNumber,
    body: `Your Franks Standard verification code is ${code}. Expires in 10 minutes.`,
    userId,
    metadata: { verification_id: data.id },
  })

  return {
    ok: true,
    verification_id: data.id,
    expires_at: expiresAt,
    sms_sent: !!sms.sent,
    sms_skipped: !!sms.skipped,
  }
}

async function verifyCode (admin, { userId, phoneNumber, code }) {
  const { data: row } = await admin
    .from('sms_verification')
    .select('*')
    .eq('user_id', userId)
    .eq('phone_number', phoneNumber)
    .is('verified_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!row) return { ok: false, error: 'no_active_code' }

  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'code_expired' }
  }

  if ((row.attempts || 0) >= MAX_ATTEMPTS) {
    return { ok: false, error: 'too_many_attempts' }
  }

  const match = hashCode(code) === row.code_hash

  await admin.from('sms_verification').update({
    attempts: (row.attempts || 0) + 1,
  }).eq('id', row.id)

  if (!match) return { ok: false, error: 'invalid_code' }

  await admin.from('sms_verification').update({
    verified_at: new Date().toISOString(),
  }).eq('id', row.id)

  await admin.from('profiles').update({
    phone_verified_at: new Date().toISOString(),
    requires_phone_verification: false,
    contact_phone: phoneNumber,
    phone_number: phoneNumber,
  }).eq('id', userId)

  return { ok: true, verified: true }
}

module.exports = {
  issueVerificationCode,
  verifyCode,
  requiresSmsVerification,
  generateCode,
  CODE_TTL_MS,
}
