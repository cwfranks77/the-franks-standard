/**
 * Platform readiness report for owner launch gate.
 */

const { validatePlatform } = require('./validate_platform.js')
const { isLocked } = require('./lock.js')

async function probeCache () {
  try {
    const { cacheGet, cacheSet } = require('../cache/cache.js')
    const key = `launch:readiness:${Date.now()}`
    await cacheSet(key, { ok: true }, 30)
    const v = await cacheGet(key)
    return { ok: !!v, backend: 'memory_or_redis' }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function getReadinessReport (admin) {
  const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const validation = await validatePlatform(admin)
  const lockState = await isLocked(admin)
  const cacheProbe = await probeCache()

  const [
    { count: pendingJobs },
    { count: failedJobs },
    { count: emailFailed },
    { count: smsFailed },
    { count: payoutFailed },
    { count: fraudOpen },
    { count: disputesOpen },
    { count: searchRows },
    { count: securityErrors },
    { count: activityTotal },
  ] = await Promise.all([
    admin.from('background_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('background_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h),
    admin.from('email_logs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h),
    admin.from('sms_verification').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h),
    admin.from('payouts').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h),
    admin.from('fraud_cases').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
    admin.from('search_index_listings').select('listing_id', { count: 'exact', head: true }),
    admin.from('security_events').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
    admin.from('platform_activity_events').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
  ])

  const errorRate = activityTotal
    ? Math.round(((securityErrors ?? 0) / activityTotal) * 10000) / 100
    : 0

  const database_status = validation.status === 'ok' ? 'healthy' : 'degraded'
  const cache_status = cacheProbe.ok ? 'healthy' : 'degraded'
  const job_queue_status = (failedJobs ?? 0) > 10 ? 'degraded' : 'healthy'
  const email_status = (emailFailed ?? 0) > 5 ? 'degraded' : 'healthy'
  const sms_status = (smsFailed ?? 0) > 5 ? 'degraded' : 'healthy'
  const payout_status = (payoutFailed ?? 0) > 3 ? 'degraded' : 'healthy'
  const fraud_system_status = fraudOpen === null ? 'unknown' : 'healthy'
  const dispute_system_status = disputesOpen === null ? 'unknown' : 'healthy'
  const search_index_status = (searchRows ?? 0) > 0 ? 'indexed' : 'empty'

  const blockers = [...validation.errors]
  if (lockState.locked && !lockState.emergency_shutdown) blockers.push('platform_locked')
  if (lockState.emergency_shutdown) blockers.push('emergency_shutdown_active')

  const launch_ready = blockers.length === 0
    && database_status === 'healthy'
    && cache_status === 'healthy'
    && job_queue_status === 'healthy'
    && email_status === 'healthy'
    && sms_status === 'healthy'
    && payout_status === 'healthy'
    && search_index_status !== 'empty'

  return {
    database_status,
    cache_status,
    job_queue_status,
    email_status,
    sms_status,
    payout_status,
    fraud_system_status,
    dispute_system_status,
    search_index_status,
    uptime_seconds: Math.round(process.uptime()),
    error_rate: errorRate,
    launch_ready,
    validation,
    lock: lockState,
    metrics: {
      pending_jobs: pendingJobs ?? 0,
      failed_jobs_24h: failedJobs ?? 0,
      email_failures_24h: emailFailed ?? 0,
      sms_failures_24h: smsFailed ?? 0,
      payout_failures_24h: payoutFailed ?? 0,
      open_fraud_cases: fraudOpen ?? 0,
      open_disputes: disputesOpen ?? 0,
      search_index_rows: searchRows ?? 0,
      security_events_24h: securityErrors ?? 0,
      activity_events_24h: activityTotal ?? 0,
      checked_since_1h: since1h,
    },
    checked_at: new Date().toISOString(),
  }
}

module.exports = { getReadinessReport, probeCache }
