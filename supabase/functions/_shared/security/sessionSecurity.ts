import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const ROTATE_MS = 15 * 60 * 1000
const INACTIVITY_MS = 24 * 60 * 60 * 1000

function ipSubnet (ip: string | null | undefined) {
  if (!ip) return null
  const parts = String(ip).split('.')
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}`
  return String(ip).slice(0, 20)
}

export async function bindSession (
  admin: SupabaseClient,
  params: {
    userId: string
    sessionTokenHash: string
    ipAddress?: string | null
    deviceFingerprint?: string | null
  },
) {
  const now = new Date()
  await admin.from('user_sessions')
    .update({ revoked_at: now.toISOString() })
    .eq('user_id', params.userId)
    .is('revoked_at', null)

  const { data, error } = await admin.from('user_sessions').insert({
    user_id: params.userId,
    session_token_hash: params.sessionTokenHash,
    device_fingerprint: params.deviceFingerprint ?? null,
    ip_address: params.ipAddress ?? null,
    ip_subnet: ipSubnet(params.ipAddress),
    last_active_at: now.toISOString(),
    last_rotated_at: now.toISOString(),
    expires_at: new Date(now.getTime() + INACTIVITY_MS).toISOString(),
  }).select('id').single()

  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, session_id: data?.id }
}

export { ROTATE_MS, INACTIVITY_MS }
