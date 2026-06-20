const { statusEnvelope } = require('./_shared.js')
const { loadPlatformConfig } = require('./load_config.js')

async function getSecurityStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const config = loadPlatformConfig()

  const opsHash = process.env.OPS_ACCESS_KEY_HASH || process.env.NUXT_OPS_ACCESS_KEY_HASH || ''
  if (!opsHash) errors.push('ops_key_hash_not_configured')

  const [
    { count: securityEvents },
    { count: criticalEvents },
    { count: bannedDevices },
    { count: bannedIps },
    { count: frozenAccounts },
    { count: bruteForceFrozen },
    { count: unreadSecurityAlerts },
  ] = await Promise.all([
    admin.from('security_events').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
    admin.from('security_events').select('id', { count: 'exact', head: true }).eq('severity', 'critical').gte('created_at', since24h),
    admin.from('banned_devices').select('device_fingerprint', { count: 'exact', head: true }),
    admin.from('banned_ips').select('ip_address', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).not('safety_frozen_at', 'is', null),
    admin.from('login_attempt_state').select('id', { count: 'exact', head: true }).not('login_frozen_until', 'is', null),
    admin.from('owner_alerts').select('id', { count: 'exact', head: true }).eq('read', false).in('type', ['security_threat', 'banned_device_attempt']),
  ])

  if ((criticalEvents ?? 0) > 0) alerts.push(`critical_security_events_24h:${criticalEvents}`)
  if ((bruteForceFrozen ?? 0) > 5) warnings.push(`login_frozen_accounts:${bruteForceFrozen}`)

  let rateLimitOk = true
  try {
    require('../security/rate_limit.js')
  } catch {
    rateLimitOk = false
    errors.push('rate_limit_module_missing')
  }

  return statusEnvelope({
    counts: {
      security_events_24h: securityEvents ?? 0,
      critical_events_24h: criticalEvents ?? 0,
      banned_devices: bannedDevices ?? 0,
      banned_ips: bannedIps ?? 0,
      frozen_accounts: frozenAccounts ?? 0,
      login_frozen: bruteForceFrozen ?? 0,
      unread_security_alerts: unreadSecurityAlerts ?? 0,
    },
    summaries: {
      rate_limit_active: rateLimitOk,
      ops_auth_configured: !!opsHash,
      fraud_thresholds: config.fraud_thresholds,
      monitoring_intervals: config.monitoring_intervals,
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getSecurityStatus }
