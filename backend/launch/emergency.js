/**
 * Emergency shutdown and restart — owner-only platform freeze.
 */

const { LOCK_ROW_ID } = require('./lock.js')

const EMERGENCY_REASON = 'emergency_shutdown'

async function emergencyShutdown (admin, { triggeredBy = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const now = new Date().toISOString()

  await admin.from('launch_lock').upsert({
    id: LOCK_ROW_ID,
    locked: true,
    emergency_shutdown: true,
    locked_at: now,
    locked_by: null,
    updated_at: now,
    metadata: { emergency_shutdown_at: now, triggered_by: triggeredBy },
  }, { onConflict: 'id' })

  const { data: profiles } = await admin
    .from('profiles')
    .select('id')
    .is('safety_frozen_at', null)
    .limit(5000)

  const ids = (profiles ?? []).map((p) => p.id)
  if (ids.length) {
    await admin.from('profiles').update({
      safety_frozen_at: now,
      safety_freeze_reason: EMERGENCY_REASON,
      frozen: true,
    }).in('id', ids)
  }

  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: triggeredBy,
    action: 'emergency_shutdown',
    target_type: 'platform',
    target_id: LOCK_ROW_ID,
    details: { accounts_frozen: ids.length, at: now },
  })

  return {
    ok: true,
    emergency_shutdown: true,
    accounts_frozen: ids.length,
    at: now,
  }
}

async function emergencyRestart (admin, { triggeredBy = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const now = new Date().toISOString()

  await admin.from('launch_lock').upsert({
    id: LOCK_ROW_ID,
    locked: false,
    emergency_shutdown: false,
    locked_at: null,
    locked_by: null,
    updated_at: now,
    metadata: { emergency_restarted_at: now, triggered_by: triggeredBy },
  }, { onConflict: 'id' })

  const { data: frozen } = await admin
    .from('profiles')
    .select('id')
    .eq('safety_freeze_reason', EMERGENCY_REASON)
    .limit(5000)

  const ids = (frozen ?? []).map((p) => p.id)
  if (ids.length) {
    await admin.from('profiles').update({
      safety_frozen_at: null,
      safety_freeze_reason: null,
      frozen: false,
    }).in('id', ids)
  }

  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: triggeredBy,
    action: 'emergency_restart',
    target_type: 'platform',
    target_id: LOCK_ROW_ID,
    details: { accounts_unfrozen: ids.length, at: now },
  })

  return {
    ok: true,
    emergency_shutdown: false,
    accounts_unfrozen: ids.length,
    at: now,
  }
}

module.exports = { emergencyShutdown, emergencyRestart, EMERGENCY_REASON }
