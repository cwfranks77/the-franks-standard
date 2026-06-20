/**
 * Pre-launch platform validation engine.
 */

const { isLocked } = require('./lock.js')

const REQUIRED_TABLES = [
  'profiles', 'listings', 'orders', 'payouts', 'payment_events', 'ledger_entries',
  'email_logs', 'sms_verification', 'notifications', 'fraud_cases', 'dispute_cases',
  'search_index_listings', 'search_events', 'background_jobs', 'launch_lock', 'backups',
  'post_launch_events', 'audit_logs', 'webhook_events', 'refund_requests',
  'owner_alerts', 'owner_api_keys',
]

const MIGRATION_MARKERS = [
  { table: 'owner_alerts', label: '056_section15_owner_controls' },
  { table: 'launch_lock', label: '055_section14_launch' },
  { table: 'search_index_listings', label: '054_section13_search' },
  { table: 'ledger_entries', label: '053_section12_payments_accounting' },
  { table: 'notifications', label: '052_section11_communications' },
  { table: 'background_jobs', label: '051_section10_performance' },
]

const OWNER_SECURED_PREFIXES = [
  '/api/owner',
  '/api/reports',
]

const REGISTERED_JOBS = [
  'send_email', 'process_coa', 'generate_reports', 'cleanup_logs',
  'index_listings', 'index_stores',
]

async function tableExists (admin, table) {
  const { error } = await admin.from(table).select('*').limit(1)
  if (error && /does not exist|schema cache/i.test(error.message)) return false
  return !error || !/does not exist/i.test(error.message)
}

async function validatePlatform (admin) {
  const errors = []
  const warnings = []

  if (!admin) {
    return { status: 'error', errors: ['supabase_admin_required'], warnings: [] }
  }

  for (const table of REQUIRED_TABLES) {
    const exists = await tableExists(admin, table)
    if (!exists) errors.push(`missing_table:${table}`)
  }

  for (const m of MIGRATION_MARKERS) {
    const exists = await tableExists(admin, m.table)
    if (!exists) errors.push(`migration_not_applied:${m.label}`)
  }

  const opsHash = process.env.OPS_ACCESS_KEY_HASH || process.env.NUXT_OPS_ACCESS_KEY_HASH || ''
  if (!opsHash) errors.push('owner_ops_key_hash_not_configured')

  try {
    const rateLimitModule = require('../security/rate_limit.js')
    if (!rateLimitModule.checkRateLimit) warnings.push('rate_limit_module_inactive')
  } catch {
    errors.push('rate_limit_module_missing')
  }

  const { data: fraudCases } = await admin.from('fraud_cases').select('id').limit(1)
  if (fraudCases === null) errors.push('fraud_system_unreachable')

  const { data: payouts } = await admin.from('payouts').select('id').limit(1)
  if (payouts === null) errors.push('payout_system_unreachable')

  const { data: emailLogs } = await admin.from('email_logs').select('id').limit(1)
  if (emailLogs === null) errors.push('email_system_unreachable')

  const { data: sms } = await admin.from('sms_verification').select('id').limit(1)
  if (sms === null) errors.push('sms_system_unreachable')

  try {
    const { cacheGet, cacheSet } = require('../cache/cache.js')
    await cacheSet('launch:validate_probe', { t: Date.now() }, 30)
    const probe = await cacheGet('launch:validate_probe')
    if (!probe) warnings.push('cache_probe_miss_memory_only')
  } catch (e) {
    errors.push(`cache_failure:${e.message}`)
  }

  try {
    require('../jobs/register.js')
    require('../jobs/queue.js')
  } catch {
    errors.push('job_queue_registry_missing')
  }

  const ownerGuard = require('../security/owner_only.js')
  if (!ownerGuard.isOwnerRoute('/api/owner/launch/readiness')) {
    warnings.push('owner_route_guard_check')
  }

  const { data: pendingJobs } = await admin
    .from('background_jobs')
    .select('id')
    .eq('status', 'pending')
    .limit(1)
  if (pendingJobs === null) warnings.push('job_queue_table_unreachable')

  const lockState = await isLocked(admin)
  if (lockState.locked) warnings.push('platform_currently_locked')

  return {
    status: errors.length ? 'error' : 'ok',
    errors,
    warnings,
    checked_at: new Date().toISOString(),
    tables_checked: REQUIRED_TABLES.length,
    jobs_expected: REGISTERED_JOBS,
  }
}

module.exports = { validatePlatform, REQUIRED_TABLES, REGISTERED_JOBS }
