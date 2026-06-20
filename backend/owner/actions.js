/**
 * Owner action commands — freeze, ban, cache, backup, reindex.
 */

const { logOwnerAction } = require('./_shared.js')

function requireUserId (body) {
  const userId = String(body.user_id ?? body.userId ?? '').trim()
  if (!userId) return { ok: false, error: 'user_id_required' }
  return { ok: true, userId }
}

async function freezeUser (admin, body) {
  const v = requireUserId(body)
  if (!v.ok) return v
  const reason = String(body.reason ?? 'owner_freeze').slice(0, 2000)
  const now = new Date().toISOString()
  const { error } = await admin.from('profiles').update({
    safety_frozen_at: now,
    safety_freeze_reason: reason,
    frozen: true,
  }).eq('id', v.userId)
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_freeze_user', targetType: 'profile', targetId: v.userId, details: { reason } })
  return { ok: true, user_id: v.userId, frozen_at: now }
}

async function unfreezeUser (admin, body) {
  const v = requireUserId(body)
  if (!v.ok) return v
  const { error } = await admin.from('profiles').update({
    safety_frozen_at: null,
    safety_freeze_reason: null,
    frozen: false,
  }).eq('id', v.userId)
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_unfreeze_user', targetType: 'profile', targetId: v.userId })
  return { ok: true, user_id: v.userId }
}

async function banUser (admin, body) {
  const v = requireUserId(body)
  if (!v.ok) return v
  const reason = String(body.reason ?? 'owner_ban').slice(0, 2000)
  const now = new Date().toISOString()
  const { error } = await admin.from('profiles').update({
    platform_banned_at: now,
    safety_freeze_reason: reason,
    frozen: true,
  }).eq('id', v.userId)
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_ban_user', targetType: 'profile', targetId: v.userId, details: { reason } })
  return { ok: true, user_id: v.userId, banned_at: now }
}

async function unbanUser (admin, body) {
  const v = requireUserId(body)
  if (!v.ok) return v
  const { error } = await admin.from('profiles').update({
    platform_banned_at: null,
    seller_banned_at: null,
    safety_frozen_at: null,
    safety_freeze_reason: null,
    frozen: false,
  }).eq('id', v.userId)
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_unban_user', targetType: 'profile', targetId: v.userId })
  return { ok: true, user_id: v.userId }
}

async function banDevice (admin, body) {
  const fp = String(body.device_fingerprint ?? body.deviceFingerprint ?? '').trim()
  if (!fp) return { ok: false, error: 'device_fingerprint_required' }
  const reason = String(body.reason ?? 'owner_ban').slice(0, 2000)
  const userId = body.user_id ? String(body.user_id) : null
  const { error } = await admin.from('banned_devices').upsert({
    device_fingerprint: fp,
    user_id: userId,
    reason,
    banned_at: new Date().toISOString(),
    banned_by: 'ops',
  })
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_ban_device', targetType: 'device', targetId: fp, details: { user_id: userId, reason } })
  return { ok: true, device_fingerprint: fp }
}

async function banIp (admin, body) {
  const ip = String(body.ip_address ?? body.ip ?? '').trim()
  if (!ip) return { ok: false, error: 'ip_address_required' }
  const reason = String(body.reason ?? 'owner_ban').slice(0, 2000)
  const userId = body.user_id ? String(body.user_id) : null
  const { error } = await admin.from('banned_ips').upsert({
    ip_address: ip,
    user_id: userId,
    reason,
    fraud_flag: body.fraud_flag === true,
    banned_at: new Date().toISOString(),
    banned_by: 'ops',
  })
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_ban_ip', targetType: 'ip', targetId: ip, details: { user_id: userId, reason } })
  return { ok: true, ip_address: ip }
}

async function resetPassword (admin, body) {
  const v = requireUserId(body)
  if (!v.ok) return v
  const password = String(body.password ?? '').trim()
  if (password.length < 8) return { ok: false, error: 'password_min_8_chars' }
  const { error } = await admin.auth.admin.updateUserById(v.userId, { password })
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_reset_password', targetType: 'profile', targetId: v.userId })
  return { ok: true, user_id: v.userId }
}

async function forceLogout (admin, body) {
  const v = requireUserId(body)
  if (!v.ok) return v
  const { error } = await admin.auth.admin.signOut(v.userId, 'global')
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_force_logout', targetType: 'profile', targetId: v.userId })
  return { ok: true, user_id: v.userId }
}

async function clearCache (admin, body) {
  const { cacheDel, getCacheStatus } = require('../cache/cache.js')
  const pattern = String(body.pattern ?? '').trim()
  await cacheDel(pattern || '')
  await logOwnerAction(admin, { action: 'owner_clear_cache', targetType: 'cache', details: { pattern: pattern || 'all' } })
  return { ok: true, cleared_pattern: pattern || 'all', status: getCacheStatus() }
}

async function reindexSearch (admin) {
  const indexListingsJob = require('../jobs/index_listings_job.js')
  const indexStoresJob = require('../jobs/index_stores_job.js')
  const listings = await indexListingsJob(admin)
  const stores = await indexStoresJob(admin)
  await logOwnerAction(admin, { action: 'owner_reindex_search', targetType: 'search_index', details: { listings, stores } })
  return { ok: true, listings, stores }
}

async function runBackup (admin, body) {
  const { createBackup } = require('../backups/create_backup.js')
  const result = await createBackup(admin, { label: String(body.label ?? 'owner_triggered'), createdBy: 'ops' })
  await logOwnerAction(admin, { action: 'owner_run_backup', targetType: 'backup', targetId: result.backup?.id, details: result })
  return result
}

async function restoreBackupAction (admin, body) {
  const backupId = String(body.backup_id ?? '').trim()
  if (!backupId) return { ok: false, error: 'backup_id_required' }
  const { restoreBackup } = require('../backups/restore_backup.js')
  const result = await restoreBackup(admin, backupId, { restoredBy: 'ops', dryRun: body.dry_run === true })
  await logOwnerAction(admin, { action: 'owner_restore_backup', targetType: 'backup', targetId: backupId, details: result })
  return result
}

module.exports = {
  freezeUser,
  unfreezeUser,
  banUser,
  unbanUser,
  banDevice,
  banIp,
  resetPassword,
  forceLogout,
  clearCache,
  reindexSearch,
  runBackup,
  restoreBackupAction,
}
