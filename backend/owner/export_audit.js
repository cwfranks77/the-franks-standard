/**
 * Audit trail export — JSON bundle for owner review.
 */

const { parseDateRange, applyDateFilters } = require('./_shared.js')

async function exportAuditTrail (admin, query = {}) {
  const dates = parseDateRange(query)
  const limit = Math.min(5000, Math.max(100, Number(query.limit) || 1000))

  const tables = [
    { key: 'audit_logs', table: 'audit_logs', select: '*' },
    { key: 'security_events', table: 'security_events', select: '*' },
    { key: 'violation_events', table: 'violation_events', select: '*' },
    { key: 'fraud_cases', table: 'fraud_cases', select: '*' },
    { key: 'dispute_cases', table: 'dispute_cases', select: '*' },
  ]

  const exportData = {}
  const counts = {}

  for (const { key, table, select } of tables) {
    let q = admin.from(table).select(select)
    q = applyDateFilters(q, dates)
    const { data, error, count } = await q.order('created_at', { ascending: false }).limit(limit)
    if (error) {
      exportData[key] = { error: error.message }
      counts[key] = 0
    } else {
      exportData[key] = data ?? []
      counts[key] = count ?? (data ?? []).length
    }
  }

  return {
    ok: true,
    exported_at: new Date().toISOString(),
    filters: dates,
    limit_per_table: limit,
    counts,
    data: exportData,
  }
}

module.exports = { exportAuditTrail }
