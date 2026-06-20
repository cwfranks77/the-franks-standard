/**
 * IP risk scoring — datacenter/VPN, fraud patterns, multi-account, prior bans.
 */

const RISK_THRESHOLD = 70

const DATACENTER_PREFIXES = [
  '23.', '34.', '35.', '104.', '107.', '108.', '139.', '157.', '162.', '172.',
]

const KNOWN_FRAUD_RANGES = [
  '185.220.', '45.146.', '91.219.',
]

async function scoreIp (admin, ipAddress, { userId = null } = {}) {
  if (!ipAddress) {
    return { score: 0, factors: [], requires_phone_verification: false }
  }

  const ip = String(ipAddress).trim()
  const factors = []
  let score = 0

  if (DATACENTER_PREFIXES.some((p) => ip.startsWith(p))) {
    score += 25
    factors.push({ factor: 'datacenter_or_cloud_ip', weight: 25 })
  }

  if (KNOWN_FRAUD_RANGES.some((p) => ip.startsWith(p))) {
    score += 40
    factors.push({ factor: 'known_fraud_range', weight: 40 })
  }

  if (admin) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: reqCount } = await admin
      .from('rate_limit_events')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', since)

    if ((reqCount ?? 0) > 50) {
      score += 20
      factors.push({ factor: 'high_volume_requests', weight: 20, count: reqCount })
    }

    const { count: accountCount } = await admin
      .from('user_registration_fingerprints')
      .select('user_id', { count: 'exact', head: true })
      .eq('ip_address', ip)

    if ((accountCount ?? 0) > 3) {
      score += 30
      factors.push({ factor: 'multiple_accounts_same_ip', weight: 30, count: accountCount })
    }

    const { data: banRow } = await admin
      .from('banned_ips')
      .select('ip_address, reason')
      .eq('ip_address', ip)
      .maybeSingle()

    if (banRow) {
      score += 50
      factors.push({ factor: 'prior_ip_ban', weight: 50, reason: banRow.reason })
    }
  }

  score = Math.min(100, score)
  const requiresPhoneVerification = score >= RISK_THRESHOLD

  if (admin) {
    await admin.from('ip_risk_cache').upsert({
      ip_address: ip,
      risk_score: score,
      factors,
      evaluated_at: new Date().toISOString(),
    })

    if (requiresPhoneVerification) {
      await admin.from('security_events').insert({
        user_id: userId,
        event_type: 'ip_risk_threshold_exceeded',
        severity: 'warning',
        ip_address: ip,
        details: { score, factors, threshold: RISK_THRESHOLD },
      })

      if (userId) {
        await admin.from('profiles').update({ requires_phone_verification: true }).eq('id', userId)
      }
    }
  }

  return { score, factors, requires_phone_verification: requiresPhoneVerification, threshold: RISK_THRESHOLD }
}

function getIpRiskStatus () {
  return { enabled: true, threshold: RISK_THRESHOLD }
}

module.exports = { scoreIp, getIpRiskStatus, RISK_THRESHOLD }
