/**
 * Restore backup metadata — marks backup restored and logs audit entry.
 * Full database restore requires manual pg_restore from exported manifest.
 */

const fs = require('fs')
const path = require('path')

const SNAPSHOT_DIR = path.join(__dirname, 'snapshots')

async function restoreBackup (admin, backupId, { restoredBy = 'ops', dryRun = false } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }
  if (!backupId) return { ok: false, error: 'backup_id_required' }

  const { data: backup, error } = await admin
    .from('backups')
    .select('*')
    .eq('id', backupId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!backup) return { ok: false, error: 'backup_not_found' }

  let manifest = backup.manifest
  if (!manifest && backup.storage_path) {
    const filename = path.basename(String(backup.storage_path))
    const localPath = path.join(SNAPSHOT_DIR, filename)
    if (fs.existsSync(localPath)) {
      manifest = JSON.parse(fs.readFileSync(localPath, 'utf8'))
    }
  }

  if (dryRun) {
    return {
      ok: true,
      dry_run: true,
      backup_id: backupId,
      manifest_summary: {
        table_counts: manifest?.table_counts ?? {},
        created_at: manifest?.created_at ?? backup.created_at,
      },
      message: 'Dry run — no data modified. Use manual pg_restore for full database recovery.',
    }
  }

  const now = new Date().toISOString()
  await admin.from('backups').update({
    status: 'restored',
    restored_at: now,
  }).eq('id', backupId)

  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: restoredBy,
    action: 'backup_restored',
    target_type: 'backup',
    target_id: backupId,
    details: {
      label: backup.label,
      restored_at: now,
      note: 'Metadata restore only — verify storage and database manually.',
    },
  })

  return {
    ok: true,
    backup_id: backupId,
    restored_at: now,
    manifest,
    message: 'Backup marked restored. Full row-level restore requires DBA pg_restore workflow.',
  }
}

module.exports = { restoreBackup, SNAPSHOT_DIR }
