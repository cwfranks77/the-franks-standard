const { statusEnvelope } = require('./_shared.js')
const { loadPlatformConfig } = require('./load_config.js')

async function getDisputeStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since10m = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const config = loadPlatformConfig()

  const [
    { count: openDisputes },
    { count: tfsReview },
    { count: awaiting },
    { count: new24h },
    { count: new10m },
    { count: resolved30d },
  ] = await Promise.all([
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).eq('status', 'tfs_review'),
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).eq('status', 'awaiting_response'),
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).gte('created_at', since10m),
    admin.from('dispute_cases').select('id', { count: 'exact', head: true }).eq('status', 'resolved').gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  if ((new10m ?? 0) > 15) alerts.push(`dispute_spike:${new10m}`)
  else if ((new10m ?? 0) > 5) warnings.push(`dispute_elevated:${new10m}`)
  if ((tfsReview ?? 0) > 10) warnings.push(`tfs_review_backlog:${tfsReview}`)

  const { data: recent } = await admin
    .from('dispute_cases')
    .select('id, buyer_id, seller_id, order_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return statusEnvelope({
    counts: {
      open_disputes: openDisputes ?? 0,
      tfs_review: tfsReview ?? 0,
      awaiting_response: awaiting ?? 0,
      new_24h: new24h ?? 0,
      new_10m: new10m ?? 0,
      resolved_30d: resolved30d ?? 0,
    },
    summaries: {
      recent_disputes: recent ?? [],
      time_limits: config.dispute_time_limits,
      refund_time_limits: config.refund_time_limits,
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getDisputeStatus }
