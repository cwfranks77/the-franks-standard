import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function assertDeviceFingerprint (
  admin: SupabaseClient,
  userId: string,
  deviceFingerprint: string | null | undefined,
  ipAddress?: string | null,
) {
  if (!deviceFingerprint || String(deviceFingerprint).trim().length < 8) {
    return { ok: false as const, error: 'device_fingerprint_required' }
  }

  const fp = String(deviceFingerprint).trim()
  const { data: banned } = await admin
    .from('banned_devices')
    .select('device_fingerprint, reason')
    .eq('device_fingerprint', fp)
    .maybeSingle()

  if (banned) {
    await admin.from('security_events').insert({
      user_id: userId,
      event_type: 'banned_device_blocked',
      severity: 'critical',
      ip_address: ipAddress ?? null,
      device_fingerprint: fp,
      details: { reason: banned.reason },
    })
    return { ok: false as const, error: 'device_banned' }
  }

  return { ok: true as const, device_fingerprint: fp }
}
