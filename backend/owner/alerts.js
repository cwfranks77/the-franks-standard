/**
 * Owner system alerts — create, list, mark read.
 */

async function createOwnerAlert (admin, { type, message, metadata = {} }) {
  const { data, error } = await admin.from('owner_alerts').insert({
    type,
    message: String(message).slice(0, 4000),
    metadata,
  }).select('*').single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, alert: data }
}

async function listOwnerAlerts (admin, { unreadOnly = false, limit = 50 } = {}) {
  let q = admin.from('owner_alerts').select('*').order('created_at', { ascending: false }).limit(Math.min(200, limit))
  if (unreadOnly) q = q.eq('read', false)
  const { data, error } = await q
  if (error) return { ok: false, error: error.message }
  return { ok: true, alerts: data ?? [] }
}

async function markAlertRead (admin, alertId) {
  const { error } = await admin.from('owner_alerts').update({ read: true }).eq('id', alertId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

async function triggerAlertsFromMonitor (admin, checks = []) {
  const created = []
  for (const c of checks) {
    if (c.status === 'ok') continue
    const typeMap = {
      fraud_spikes: 'fraud_spike',
      dispute_spikes: 'dispute_spike',
      payout_failures: 'payout_failure',
      email_failures: 'email_failure',
      sms_failures: 'sms_failure',
      job_queue_failures: 'job_queue_failure',
      cache_failures: 'cache_failure',
      error_rate: 'security_threat',
    }
    const alertType = typeMap[c.type] || c.type
    const res = await createOwnerAlert(admin, {
      type: alertType,
      message: c.message,
      metadata: { status: c.status, ...c.metrics },
    })
    if (res.ok) created.push(res.alert)
  }
  return { created: created.length, alerts: created }
}

async function alertBannedDeviceAttempt (admin, { deviceFingerprint, ipAddress, userId = null }) {
  return createOwnerAlert(admin, {
    type: 'banned_device_attempt',
    message: `Banned device or IP attempted access: ${deviceFingerprint || ipAddress || 'unknown'}`,
    metadata: { device_fingerprint: deviceFingerprint, ip_address: ipAddress, user_id: userId },
  })
}

module.exports = {
  createOwnerAlert,
  listOwnerAlerts,
  markAlertRead,
  triggerAlertsFromMonitor,
  alertBannedDeviceAttempt,
}
