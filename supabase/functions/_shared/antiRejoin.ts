import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { isBanned } from './accountSafety.ts'

export async function recordRegistrationFingerprints (
  admin: SupabaseClient,
  params: {
    userId: string
    deviceFingerprint?: string | null
    browserFingerprint?: string | null
    ipAddress?: string | null
  },
): Promise<void> {
  await admin.from('user_registration_fingerprints').insert({
    user_id: params.userId,
    device_fingerprint: params.deviceFingerprint || null,
    browser_fingerprint: params.browserFingerprint || null,
    ip_address: params.ipAddress || null,
  })

  const patch: Record<string, string> = {}
  if (params.ipAddress) patch.last_known_ip = params.ipAddress
  if (params.deviceFingerprint) patch.last_device_fingerprint = params.deviceFingerprint
  if (params.browserFingerprint) patch.last_browser_fingerprint = params.browserFingerprint
  if (Object.keys(patch).length) {
    await admin.from('profiles').update(patch).eq('id', params.userId)
  }
}

/** Block registration when fingerprints match a banned user or flagged IP. */
export async function checkRegistrationAllowed (
  admin: SupabaseClient,
  input: {
    deviceFingerprint?: string | null
    browserFingerprint?: string | null
    ipAddress?: string | null
  },
): Promise<{ allowed: boolean; reason?: string }> {
  const ban = await isBanned(admin, input)
  if (ban.banned) {
    return { allowed: false, reason: ban.reason || 'banned_fingerprint' }
  }

  const ip = String(input.ipAddress || '').trim()
  if (ip && ip !== 'unknown') {
    const { data: flaggedIp } = await admin
      .from('banned_ips')
      .select('ip_address')
      .eq('ip_address', ip)
      .eq('fraud_flag', true)
      .maybeSingle()
    if (flaggedIp) return { allowed: false, reason: 'ip_fraud_flagged' }
  }

  const checks: Array<{ column: string; value: string | undefined | null }> = [
    { column: 'device_fingerprint', value: input.deviceFingerprint },
    { column: 'browser_fingerprint', value: input.browserFingerprint },
    { column: 'ip_address', value: input.ipAddress },
  ]

  for (const { column, value } of checks) {
    const v = String(value || '').trim()
    if (!v) continue

    const { data: prior } = await admin
      .from('user_registration_fingerprints')
      .select(`user_id, profiles!inner(platform_banned_at, seller_banned_at)`)
      .eq(column, v)
      .limit(5)

    for (const row of prior || []) {
      const p = (row as { profiles?: { platform_banned_at?: string; seller_banned_at?: string } }).profiles
      if (p?.platform_banned_at || p?.seller_banned_at) {
        return { allowed: false, reason: 'banned_user_fingerprint_match' }
      }
    }

    const { data: bannedUserIds } = await admin
      .from('user_registration_fingerprints')
      .select('user_id')
      .eq(column, v)

    for (const row of bannedUserIds || []) {
      const uid = (row as { user_id: string }).user_id
      const banCheck = await isBanned(admin, { userId: uid })
      if (banCheck.banned) return { allowed: false, reason: 'banned_user_fingerprint_match' }
    }
  }

  return { allowed: true }
}
