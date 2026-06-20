/**
 * Shared owner backend utilities.
 */

const { createHash } = require('crypto')

function hashKey (plain) {
  return createHash('sha256').update(String(plain)).digest('hex')
}

function parsePagination (query = {}) {
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 50))
  const page = Math.max(1, Number(query.page) || 1)
  const offset = (page - 1) * limit
  return { limit, page, offset }
}

function parseDateRange (query = {}) {
  const since = query.since ? new Date(String(query.since)).toISOString() : null
  const until = query.until ? new Date(String(query.until)).toISOString() : null
  return { since, until }
}

function applyDateFilters (q, { since, until }, column = 'created_at') {
  if (since) q = q.gte(column, since)
  if (until) q = q.lte(column, until)
  return q
}

async function logOwnerAction (admin, { action, targetType, targetId, details = {}, actorId = 'ops' }) {
  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId ? String(targetId) : null,
    details,
  })
}

function statusEnvelope ({ counts = {}, summaries = {}, alerts = [], warnings = [], errors = [] }) {
  return {
    ok: errors.length === 0,
    counts,
    summaries,
    alerts,
    warnings,
    errors,
    checked_at: new Date().toISOString(),
  }
}

module.exports = {
  hashKey,
  parsePagination,
  parseDateRange,
  applyDateFilters,
  logOwnerAction,
  statusEnvelope,
}
