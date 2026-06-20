/**
 * Launch lock — singleton row controls marketplace freeze.
 */

const LOCK_ROW_ID = '00000000-0000-0000-0000-000000000001'

async function getLockRow (admin) {
  const { data, error } = await admin
    .from('launch_lock')
    .select('*')
    .eq('id', LOCK_ROW_ID)
    .maybeSingle()
  if (error) return { ok: false, error: error.message }
  return { ok: true, row: data }
}

async function isLocked (admin) {
  const { ok, row, error } = await getLockRow(admin)
  if (!ok) return { locked: false, error }
  return {
    locked: !!row?.locked,
    emergency_shutdown: !!row?.emergency_shutdown,
    locked_at: row?.locked_at ?? null,
    locked_by: row?.locked_by ?? null,
  }
}

async function lockLaunch (admin, { lockedBy = null, reason = 'pre_launch' } = {}) {
  const now = new Date().toISOString()
  const { error } = await admin.from('launch_lock').upsert({
    id: LOCK_ROW_ID,
    locked: true,
    locked_at: now,
    locked_by: lockedBy,
    updated_at: now,
    metadata: { reason, locked_at: now },
  }, { onConflict: 'id' })

  if (error) return { ok: false, error: error.message }
  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: lockedBy || 'ops',
    action: 'launch_locked',
    target_type: 'launch_lock',
    target_id: LOCK_ROW_ID,
    details: { reason },
  })
  return { ok: true, locked: true, locked_at: now }
}

async function unlockLaunch (admin, { unlockedBy = null } = {}) {
  const now = new Date().toISOString()
  const { error } = await admin.from('launch_lock').upsert({
    id: LOCK_ROW_ID,
    locked: false,
    emergency_shutdown: false,
    locked_at: null,
    locked_by: null,
    updated_at: now,
    metadata: { unlocked_at: now },
  }, { onConflict: 'id' })

  if (error) return { ok: false, error: error.message }
  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: unlockedBy || 'ops',
    action: 'launch_unlocked',
    target_type: 'launch_lock',
    target_id: LOCK_ROW_ID,
    details: {},
  })
  return { ok: true, locked: false }
}

async function assertNotLocked (admin, { action = 'action' } = {}) {
  const state = await isLocked(admin)
  if (state.locked) {
    return { ok: false, error: 'launch_locked', message: `Platform is locked — ${action} is disabled.` }
  }
  return { ok: true }
}

module.exports = {
  LOCK_ROW_ID,
  isLocked,
  lockLaunch,
  unlockLaunch,
  assertNotLocked,
  getLockRow,
}
