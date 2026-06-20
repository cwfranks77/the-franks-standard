const { statusEnvelope } = require('./_shared.js')
const { loadPlatformConfig } = require('./load_config.js')
const { isLocked } = require('../launch/lock.js')
const { validatePlatform } = require('../launch/validate_platform.js')
const { getCacheStatus } = require('../cache/cache.js')

async function getPlatformStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const config = loadPlatformConfig()

  const validation = await validatePlatform(admin)
  if (validation.status !== 'ok') errors.push(...validation.errors)
  warnings.push(...(validation.warnings ?? []))

  const lock = await isLocked(admin)
  if (lock.locked) warnings.push('platform_locked')
  if (lock.emergency_shutdown) alerts.push('emergency_shutdown_active')

  const [
    { count: listings },
    { count: published },
    { count: orders },
    { count: pendingJobs },
    { count: unreadAlerts },
  ] = await Promise.all([
    admin.from('listings').select('id', { count: 'exact', head: true }),
    admin.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('orders').select('id', { count: 'exact', head: true }),
    admin.from('background_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('owner_alerts').select('id', { count: 'exact', head: true }).eq('read', false),
  ])

  if ((pendingJobs ?? 0) > 50) alerts.push(`job_queue_backlog:${pendingJobs}`)

  return statusEnvelope({
    counts: {
      listings: listings ?? 0,
      published_listings: published ?? 0,
      orders: orders ?? 0,
      pending_jobs: pendingJobs ?? 0,
      unread_owner_alerts: unreadAlerts ?? 0,
    },
    summaries: {
      launch_lock: lock,
      cache: getCacheStatus(),
      validation_status: validation.status,
      spotlight_enabled: config.spotlight_enabled,
      featured_store_id: config.featured_store_id,
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getPlatformStatus }
