/**
 * Device fingerprint enforcement for authenticated requests.
 */

async function assertDeviceFingerprint (admin, {
  userId,
  deviceFingerprint,
  ipAddress = null,
}) {
  if (!deviceFingerprint || String(deviceFingerprint).trim().length < 8) {
    return { ok: false, error: 'device_fingerprint_required', status: 403 }
  }

  const fp = String(deviceFingerprint).trim()

  if (admin) {
    const { data: banned } = await admin
      .from('banned_devices')
      .select('device_fingerprint, reason')
      .eq('device_fingerprint', fp)
      .maybeSingle()

    if (banned) {
      await admin.from('security_events').insert({
        user_id: userId ?? null,
        event_type: 'banned_device_blocked',
        severity: 'critical',
        ip_address: ipAddress,
        device_fingerprint: fp,
        details: { reason: banned.reason },
      })
      return { ok: false, error: 'device_banned', status: 403 }
    }
  }

  return { ok: true, device_fingerprint: fp }
}

function getFingerprintEnforcementStatus () {
  return { enabled: true, required_on_authenticated_requests: true }
}

module.exports = { assertDeviceFingerprint, getFingerprintEnforcementStatus }
