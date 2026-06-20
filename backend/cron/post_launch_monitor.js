/**
 * Post-launch monitoring — runs every 10 minutes via cron-post-launch-monitor.
 */

async function logEvent (admin, checkType, status, message, metrics = {}) {
  await admin.from('post_launch_events').insert({
    check_type: checkType,
    status,
    message,
    metrics,
  })
}

async function runPostLaunchMonitor (admin) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const since10m = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const results = []

  const checks = []

  const { count: failedJobs } = await admin
    .from('background_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', since10m)
  checks.push({
    type: 'job_queue_failures',
    status: (failedJobs ?? 0) > 5 ? 'critical' : (failedJobs ?? 0) > 0 ? 'warning' : 'ok',
    message: `${failedJobs ?? 0} failed jobs in last 10 minutes`,
    metrics: { failed_jobs: failedJobs ?? 0 },
  })

  const { count: emailFailed } = await admin
    .from('email_logs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', since10m)
  checks.push({
    type: 'email_failures',
    status: (emailFailed ?? 0) > 10 ? 'critical' : (emailFailed ?? 0) > 2 ? 'warning' : 'ok',
    message: `${emailFailed ?? 0} email failures in last 10 minutes`,
    metrics: { email_failures: emailFailed ?? 0 },
  })

  const { count: smsFailed } = await admin
    .from('sms_verification')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', since10m)
  checks.push({
    type: 'sms_failures',
    status: (smsFailed ?? 0) > 5 ? 'critical' : (smsFailed ?? 0) > 0 ? 'warning' : 'ok',
    message: `${smsFailed ?? 0} SMS failures in last 10 minutes`,
    metrics: { sms_failures: smsFailed ?? 0 },
  })

  const { count: payoutFailed } = await admin
    .from('payouts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', since10m)
  checks.push({
    type: 'payout_failures',
    status: (payoutFailed ?? 0) > 3 ? 'critical' : (payoutFailed ?? 0) > 0 ? 'warning' : 'ok',
    message: `${payoutFailed ?? 0} payout failures in last 10 minutes`,
    metrics: { payout_failures: payoutFailed ?? 0 },
  })

  const { count: fraudNew } = await admin
    .from('fraud_cases')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since10m)
  checks.push({
    type: 'fraud_spikes',
    status: (fraudNew ?? 0) > 10 ? 'critical' : (fraudNew ?? 0) > 3 ? 'warning' : 'ok',
    message: `${fraudNew ?? 0} new fraud cases in last 10 minutes`,
    metrics: { fraud_cases_new: fraudNew ?? 0 },
  })

  const { count: disputesNew } = await admin
    .from('dispute_cases')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since10m)
  checks.push({
    type: 'dispute_spikes',
    status: (disputesNew ?? 0) > 15 ? 'critical' : (disputesNew ?? 0) > 5 ? 'warning' : 'ok',
    message: `${disputesNew ?? 0} new disputes in last 10 minutes`,
    metrics: { disputes_new: disputesNew ?? 0 },
  })

  try {
    const { cacheGet, cacheSet } = require('../cache/cache.js')
    await cacheSet('post_launch:cache_probe', { t: Date.now() }, 60)
    const probe = await cacheGet('post_launch:cache_probe')
    checks.push({
      type: 'cache_failures',
      status: probe ? 'ok' : 'warning',
      message: probe ? 'Cache probe OK' : 'Cache probe miss',
      metrics: { cache_ok: !!probe },
    })
  } catch (e) {
    checks.push({
      type: 'cache_failures',
      status: 'critical',
      message: `Cache error: ${e.message}`,
      metrics: {},
    })
  }

  const { count: securityEvents } = await admin
    .from('security_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since1h)
  const { count: activityEvents } = await admin
    .from('platform_activity_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since1h)

  const errorRate = activityEvents
    ? Math.round(((securityEvents ?? 0) / activityEvents) * 10000) / 100
    : 0
  checks.push({
    type: 'error_rate',
    status: errorRate > 5 ? 'critical' : errorRate > 2 ? 'warning' : 'ok',
    message: `Error rate ${errorRate}% (1h window)`,
    metrics: { error_rate: errorRate, security_events: securityEvents ?? 0, activity_events: activityEvents ?? 0 },
  })

  for (const c of checks) {
    await logEvent(admin, c.type, c.status, c.message, c.metrics)
    results.push(c)
  }

  const critical = results.filter((r) => r.status === 'critical').length
  const warnings = results.filter((r) => r.status === 'warning').length

  try {
    const { triggerAlertsFromMonitor } = require('../owner/alerts.js')
    await triggerAlertsFromMonitor(admin, results)
  } catch {
    // owner_alerts table may not exist until migration 056
  }

  const { data: banAttempts } = await admin
    .from('security_events')
    .select('id, event_type, device_fingerprint, ip_address, user_id')
    .gte('created_at', since10m)
    .in('event_type', ['banned_device_blocked', 'banned_ip_blocked', 'device_ban_attempt'])
    .limit(20)

  if ((banAttempts ?? []).length > 0) {
    try {
      const { alertBannedDeviceAttempt } = require('../owner/alerts.js')
      for (const evt of banAttempts) {
        await alertBannedDeviceAttempt(admin, {
          deviceFingerprint: evt.device_fingerprint,
          ipAddress: evt.ip_address,
          userId: evt.user_id,
        })
      }
    } catch {
      // non-fatal
    }
  }

  return {
    ok: critical === 0,
    checks: results,
    critical_count: critical,
    warning_count: warnings,
    ran_at: new Date().toISOString(),
  }
}

module.exports = { runPostLaunchMonitor, logEvent }
