/**
 * Failover & error recovery — retries with graceful fallbacks.
 */

const MAX_DB_RETRIES = 3
const MAX_API_RETRIES = 2
const BASE_DELAY_MS = 250

function sleep (ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function logReliability (admin, row) {
  if (!admin) return
  try {
    await admin.from('reliability_events').insert({
      event_type: row.eventType || 'retry',
      operation: row.operation,
      attempts: row.attempts,
      succeeded: row.succeeded,
      error_message: row.errorMessage ? String(row.errorMessage).slice(0, 2000) : null,
      metadata: row.metadata || {},
    })
  } catch {
    // best effort
  }
}

async function withDbRetry (admin, operation, fn, fallback = null) {
  let lastError = null
  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt++) {
    try {
      const result = await fn()
      await logReliability(admin, {
        eventType: 'db_retry',
        operation,
        attempts: attempt,
        succeeded: true,
      })
      return { ok: true, data: result, attempts: attempt }
    } catch (e) {
      lastError = e
      await logReliability(admin, {
        eventType: 'db_retry',
        operation,
        attempts: attempt,
        succeeded: false,
        errorMessage: e?.message,
      })
      if (attempt < MAX_DB_RETRIES) await sleep(BASE_DELAY_MS * attempt)
    }
  }

  if (fallback !== null) {
    return { ok: false, fallback, error: lastError?.message, degraded: true }
  }

  throw lastError
}

async function withApiRetry (admin, operation, fn, fallback = null) {
  let lastError = null
  for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
    try {
      const result = await fn()
      await logReliability(admin, {
        eventType: 'api_retry',
        operation,
        attempts: attempt,
        succeeded: true,
      })
      return { ok: true, data: result, attempts: attempt }
    } catch (e) {
      lastError = e
      await logReliability(admin, {
        eventType: 'api_retry',
        operation,
        attempts: attempt,
        succeeded: false,
        errorMessage: e?.message,
      })
      if (attempt < MAX_API_RETRIES) await sleep(BASE_DELAY_MS * attempt * 2)
    }
  }

  if (fallback !== null) {
    return { ok: false, fallback, error: lastError?.message, degraded: true }
  }

  throw lastError
}

function gracefulFallback (message, partial = {}) {
  return {
    ok: false,
    degraded: true,
    message: message || 'Service temporarily unavailable',
    ...partial,
  }
}

async function getReliabilityStatus (admin) {
  if (!admin) return { error_rate: null }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: total } = await admin
    .from('reliability_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)

  const { count: failed } = await admin
    .from('reliability_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('succeeded', false)

  const t = total ?? 0
  const f = failed ?? 0
  return {
    events_24h: t,
    failures_24h: f,
    error_rate: t > 0 ? Number((f / t).toFixed(4)) : 0,
  }
}

module.exports = {
  withDbRetry,
  withApiRetry,
  gracefulFallback,
  getReliabilityStatus,
  MAX_DB_RETRIES,
  MAX_API_RETRIES,
}
