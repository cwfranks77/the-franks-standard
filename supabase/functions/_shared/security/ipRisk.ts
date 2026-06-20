import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const RISK_THRESHOLD = 70

const DATACENTER_PREFIXES = ['23.', '34.', '35.', '104.', '107.', '108.']
const KNOWN_FRAUD_RANGES = ['185.220.', '45.146.']

export async function scoreIp (
  admin: SupabaseClient,
  ipAddress: string,
  userId?: string | null,
) {
  const ip = String(ipAddress || '').trim()
  if (!ip) return { score: 0, factors: [], requires_phone_verification: false }

  const factors: { factor: string; weight: number; count?: number }[] = []
  let score = 0

  if (DATACENTER_PREFIXES.some((p) => ip.startsWith(p))) {
    score += 25
    factors.push({ factor: 'datacenter_or_cloud_ip', weight: 25 })
  }
  if (KNOWN_FRAUD_RANGES.some((p) => ip.startsWith(p))) {
    score += 40
    factors.push({ factor: 'known_fraud_range', weight: 40 })
  }

  const { count: accountCount } = await admin
    .from('user_registration_fingerprints')
    .select('user_id', { count: 'exact', head: true })
    .eq('ip_address', ip)

  if ((accountCount ?? 0) > 3) {
    score += 30
    factors.push({ factor: 'multiple_accounts_same_ip', weight: 30, count: accountCount ?? 0 })
  }

  const { data: banRow } = await admin.from('banned_ips').select('ip_address').eq('ip_address', ip).maybeSingle()
  if (banRow) {
    score += 50
    factors.push({ factor: 'prior_ip_ban', weight: 50 })
  }

  score = Math.min(100, score)
  const requiresPhoneVerification = score >= RISK_THRESHOLD

  await admin.from('ip_risk_cache').upsert({
    ip_address: ip,
    risk_score: score,
    factors,
    evaluated_at: new Date().toISOString(),
  })

  if (requiresPhoneVerification) {
    await admin.from('security_events').insert({
      user_id: userId ?? null,
      event_type: 'ip_risk_threshold_exceeded',
      severity: 'warning',
      ip_address: ip,
      details: { score, threshold: RISK_THRESHOLD },
    })
    if (userId) {
      await admin.from('profiles').update({ requires_phone_verification: true }).eq('id', userId)
    }
  }

  return { score, factors, requires_phone_verification: requiresPhoneVerification }
}
