/**
 * Session security — 15 min rotation, IP binding, fingerprint binding, 24h inactivity logout.
 */

const ROTATE_MS = 15 * 60 * 1000
const INACTIVITY_MS = 24 * 60 * 60 * 1000

function ipSubnet (ip) {
  if (!ip) return null
  const parts = String(ip).split('.')
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}`
  return String(ip).slice(0, 20)
}

function ipChangedDrastically (stored, current) {
  if (!stored || !current) return false
  if (stored === current) return false
  const a = ipSubnet(stored)
  const b = ipSubnet(current)
  return a !== b
}

async function validateSession (admin, {
  sessionTokenHash,
  userId,
  ipAddress,
  deviceFingerprint,
}) {
  if (!admin || !sessionTokenHash) {
    return { ok: false, error: 'session_invalid', revoked: true }
  }

  const { data: session } = await admin
    .from('user_sessions')
    .select('*')
    .eq('session_token_hash', sessionTokenHash)
    .is('revoked_at', null)
    .maybeSingle()

  if (!session) {
    return { ok: false, error: 'session_not_found', revoked: true }
  }

  const now = Date.now()
  const lastActive = new Date(session.last_active_at).getTime()
  const expiresAt = new Date(session.expires_at).getTime()

  if (expiresAt < now || now - lastActive > INACTIVITY_MS) {
    await admin.from('user_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', session.id)
    return { ok: false, error: 'session_expired_inactivity', revoked: true }
  }

  if (session.user_id !== userId) {
    return { ok: false, error: 'session_user_mismatch', revoked: true }
  }

  if (session.device_fingerprint && deviceFingerprint && session.device_fingerprint !== deviceFingerprint) {
    await admin.from('user_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', session.id)
    await admin.from('security_events').insert({
      user_id: userId,
      event_type: 'session_device_mismatch',
      severity: 'critical',
      ip_address: ipAddress,
      device_fingerprint: deviceFingerprint,
      details: { expected: session.device_fingerprint },
    })
    return { ok: false, error: 'session_device_mismatch', revoked: true }
  }

  if (ipChangedDrastically(session.ip_address, ipAddress)) {
    await admin.from('user_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', session.id)
    await admin.from('security_events').insert({
      user_id: userId,
      event_type: 'session_ip_mismatch',
      severity: 'warning',
      ip_address: ipAddress,
      device_fingerprint: deviceFingerprint,
      details: { previous_ip: session.ip_address },
    })
    return { ok: false, error: 'session_ip_mismatch', revoked: true }
  }

  const lastRotated = new Date(session.last_rotated_at).getTime()
  const needsRotation = now - lastRotated > ROTATE_MS

  await admin.from('user_sessions').update({
    last_active_at: new Date().toISOString(),
    ip_address: ipAddress ?? session.ip_address,
    ...(needsRotation ? { last_rotated_at: new Date().toISOString() } : {}),
  }).eq('id', session.id)

  return {
    ok: true,
    rotated: needsRotation,
    session_id: session.id,
  }
}

async function bindSession (admin, {
  userId,
  sessionTokenHash,
  ipAddress,
  deviceFingerprint,
}) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + INACTIVITY_MS)

  await admin.from('user_sessions')
    .update({ revoked_at: now.toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null)

  const { data, error } = await admin.from('user_sessions').insert({
    user_id: userId,
    session_token_hash: sessionTokenHash,
    device_fingerprint: deviceFingerprint ?? null,
    ip_address: ipAddress ?? null,
    ip_subnet: ipSubnet(ipAddress),
    last_active_at: now.toISOString(),
    last_rotated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  }).select('id').single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, session_id: data?.id }
}

function getSessionSecurityStatus () {
  return {
    enabled: true,
    rotate_interval_minutes: ROTATE_MS / 60000,
    inactivity_logout_hours: INACTIVITY_MS / 3600000,
    ip_binding: true,
    device_fingerprint_binding: true,
  }
}

module.exports = { validateSession, bindSession, getSessionSecurityStatus, ROTATE_MS, INACTIVITY_MS }
