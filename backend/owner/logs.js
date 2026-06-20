/**
 * Owner log viewer — paginated log queries with filters.
 */

const { parsePagination, parseDateRange, applyDateFilters } = require('./_shared.js')

const LOG_SOURCES = {
  activity: {
    table: 'platform_activity_events',
    userColumn: 'user_id',
    eventColumn: 'event_type',
    select: 'id, user_id, event_type, action_category, action, metadata, created_at',
  },
  security: {
    table: 'security_events',
    userColumn: 'user_id',
    eventColumn: 'event_type',
    select: 'id, user_id, event_type, severity, ip_address, device_fingerprint, details, created_at',
  },
  violations: {
    table: 'violation_events',
    userColumn: 'user_id',
    eventColumn: 'violation_type',
    select: 'id, user_id, violation_type, severity, evidence, created_at',
  },
  fraud: {
    table: 'fraud_cases',
    userColumn: 'user_id',
    eventColumn: 'status',
    select: 'id, user_id, severity, status, evidence, law_enforcement_prepared, industry_alert_prepared, created_at, updated_at',
  },
  disputes: {
    table: 'dispute_cases',
    userColumn: 'buyer_id',
    eventColumn: 'status',
    select: 'id, buyer_id, seller_id, order_id, status, description, ruling, created_at, updated_at',
    altUserColumns: ['seller_id'],
  },
  payouts: {
    table: 'payouts',
    userColumn: 'seller_id',
    eventColumn: 'status',
    select: 'id, seller_id, amount, currency, status, reference, created_at, processed_at',
  },
  emails: {
    table: 'email_logs',
    userColumn: 'user_id',
    eventColumn: 'template_key',
    select: 'id, user_id, to_email, template_key, status, metadata, created_at',
  },
  sms: {
    table: 'sms_verification',
    userColumn: 'user_id',
    eventColumn: 'status',
    select: 'id, user_id, phone_number, status, created_at',
  },
  jobs: {
    table: 'background_jobs',
    userColumn: null,
    eventColumn: 'job_type',
    select: 'id, job_type, status, payload, error_message, created_at, completed_at',
  },
}

async function queryOwnerLogs (admin, logType, query = {}) {
  const source = LOG_SOURCES[logType]
  if (!source) return { ok: false, error: 'invalid_log_type' }

  const { limit, page, offset } = parsePagination(query)
  const dates = parseDateRange(query)
  const userId = query.user_id ? String(query.user_id) : null
  const eventType = query.event_type ? String(query.event_type) : null

  let q = admin.from(source.table).select(source.select, { count: 'exact' })
  q = applyDateFilters(q, dates)

  if (userId && source.userColumn) {
    if (source.altUserColumns) {
      const parts = [ `${source.userColumn}.eq.${userId}` ]
      for (const col of source.altUserColumns) parts.push(`${col}.eq.${userId}`)
      q = q.or(parts.join(','))
    } else {
      q = q.eq(source.userColumn, userId)
    }
  }

  if (eventType && source.eventColumn) {
    q = q.eq(source.eventColumn, eventType)
  }

  const { data, error, count } = await q
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return { ok: false, error: error.message }

  return {
    ok: true,
    log_type: logType,
    page,
    limit,
    total: count ?? 0,
    rows: data ?? [],
    filters: { ...dates, user_id: userId, event_type: eventType },
  }
}

module.exports = { queryOwnerLogs, LOG_SOURCES }
