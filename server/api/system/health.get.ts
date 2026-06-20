import { createRequire } from 'node:module'
import { requireOwnerAuth } from '../../utils/ownerAuth'
import { getServiceSupabase } from '../../utils/serviceSupabase'

const require = createRequire(import.meta.url)
require('../../backend/jobs/register.js')

const { getCacheStatus } = require('../../../backend/cache/cache.js')
const { getRateLimitStatus } = require('../../../backend/security/rate_limit.js')
const { getQueueStatus } = require('../../../backend/jobs/queue.js')
const { getReliabilityStatus } = require('../../../backend/reliability/failover.js')
const { API_VERSION } = require('../../../backend/performance/response_optimizer.js')

const STARTED_AT = Date.now()

/**
 * GET /api/system/health — owner-only system health dashboard (backend only).
 */
export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)

  const sb = getServiceSupabase()
  let databaseStatus = 'unconfigured'
  let lastCleanup = null
  let pendingJobs = 0

  if (sb) {
    try {
      const { error } = await sb.from('system_health_meta').select('key').limit(1)
      databaseStatus = error ? 'error' : 'ok'

      const { data: meta } = await sb
        .from('system_health_meta')
        .select('value')
        .eq('key', 'last_cleanup_run')
        .maybeSingle()
      lastCleanup = meta?.value ?? null

      const { count } = await sb
        .from('background_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      pendingJobs = count ?? 0
    } catch {
      databaseStatus = 'error'
    }
  }

  const reliability = sb ? await getReliabilityStatus(sb) : { error_rate: null }

  return {
    ok: true,
    checked_at: new Date().toISOString(),
    database_status: databaseStatus,
    cache_status: getCacheStatus(),
    job_queue_status: { ...getQueueStatus(), pending_jobs: pendingJobs },
    rate_limit_status: getRateLimitStatus(),
    uptime_seconds: Math.floor((Date.now() - STARTED_AT) / 1000),
    error_rate: reliability.error_rate,
    reliability_24h: reliability,
    last_cleanup_run: lastCleanup,
    api_version: API_VERSION,
  }
})
