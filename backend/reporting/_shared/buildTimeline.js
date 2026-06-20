/**
 * Merge violation events, activity logs, and disputes into a chronological timeline.
 */
function buildTimeline (items) {
  return items
    .filter((row) => row && row.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

function timelineFromSources ({
  violations = [],
  activityLogs = [],
  disputes = [],
  fraudCase = null,
}) {
  const rows = []

  if (fraudCase?.created_at) {
    rows.push({
      at: fraudCase.created_at,
      type: 'fraud_case_opened',
      severity: fraudCase.severity,
      detail: 'Fraud case opened',
    })
  }

  for (const v of violations) {
    rows.push({
      at: v.created_at,
      type: 'violation',
      severity: v.severity,
      violation_type: v.violation_type,
      action_taken: v.action_taken,
      source_type: v.source_type,
    })
  }

  for (const a of activityLogs) {
    rows.push({
      at: a.created_at,
      type: 'activity',
      action_category: a.action_category,
      event_type: a.event_type,
      action: a.action,
      metadata: a.metadata,
    })
  }

  for (const d of disputes) {
    rows.push({
      at: d.created_at,
      type: 'dispute_opened',
      dispute_id: d.id,
      status: d.status,
      order_id: d.order_id,
    })
    if (d.updated_at && d.updated_at !== d.created_at) {
      rows.push({
        at: d.updated_at,
        type: 'dispute_updated',
        dispute_id: d.id,
        status: d.status,
        ruling: d.ruling,
      })
    }
  }

  return buildTimeline(rows)
}

module.exports = { buildTimeline, timelineFromSources }
