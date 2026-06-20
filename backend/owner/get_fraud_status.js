const { statusEnvelope } = require('./_shared.js')
const { loadPlatformConfig } = require('./load_config.js')

async function getFraudStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since10m = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const config = loadPlatformConfig()
  const thresholds = config.fraud_thresholds ?? {}

  const [
    { count: openCases },
    { count: new24h },
    { count: new10m },
    { count: lePrepared },
    { count: industryPrepared },
    { count: highSeverity },
  ] = await Promise.all([
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).gte('created_at', since10m),
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).eq('law_enforcement_prepared', true),
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).eq('industry_alert_prepared', true),
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).eq('severity', 'high').eq('status', 'open'),
  ])

  const warnSpike = thresholds.new_cases_per_10min_warning ?? 3
  const critSpike = thresholds.new_cases_per_10min_critical ?? 10
  const openWarn = thresholds.open_cases_warning ?? 25

  if ((new10m ?? 0) >= critSpike) alerts.push(`fraud_spike_critical:${new10m}`)
  else if ((new10m ?? 0) >= warnSpike) warnings.push(`fraud_spike_warning:${new10m}`)
  if ((openCases ?? 0) >= openWarn) warnings.push(`open_fraud_cases:${openCases}`)

  const { data: recent } = await admin
    .from('fraud_cases')
    .select('id, user_id, severity, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return statusEnvelope({
    counts: {
      open_cases: openCases ?? 0,
      new_cases_24h: new24h ?? 0,
      new_cases_10m: new10m ?? 0,
      high_severity_open: highSeverity ?? 0,
      law_enforcement_prepared: lePrepared ?? 0,
      industry_alert_prepared: industryPrepared ?? 0,
    },
    summaries: {
      recent_cases: recent ?? [],
      thresholds,
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getFraudStatus }
