/**
 * Platform backup — manifest snapshot (database rows + storage inventory).
 */

const fs = require('fs')
const path = require('path')

const SNAPSHOT_DIR = path.join(__dirname, 'snapshots')

const TABLE_MANIFEST = [
  'profiles', 'listings', 'orders', 'payouts', 'payment_events', 'ledger_entries',
  'fraud_cases', 'dispute_cases', 'coa_files', 'messages', 'notifications',
  'audit_logs', 'search_index_listings', 'background_jobs', 'refund_requests',
]

const STORAGE_BUCKETS = ['listings', 'coa-certificates', 'platform-reports']

async function ensureSnapshotDir () {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
  }
}

async function collectTableCounts (admin) {
  const counts = {}
  for (const table of TABLE_MANIFEST) {
    const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true })
    counts[table] = error ? { error: error.message } : (count ?? 0)
  }
  return counts
}

async function collectStorageInventory (admin) {
  const inventory = {}
  for (const bucket of STORAGE_BUCKETS) {
    try {
      const { data, error } = await admin.storage.from(bucket).list('', { limit: 1000 })
      inventory[bucket] = error
        ? { error: error.message, files: [] }
        : { files: (data ?? []).map((f) => f.name).slice(0, 500), count: (data ?? []).length }
    } catch (e) {
      inventory[bucket] = { error: e.message, files: [] }
    }
  }
  return inventory
}

async function createBackup (admin, { label = '', createdBy = 'ops' } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  await ensureSnapshotDir()
  const backupId = require('crypto').randomUUID()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}-${backupId.slice(0, 8)}.json`
  const localPath = path.join(SNAPSHOT_DIR, filename)

  const [tableCounts, storageInventory] = await Promise.all([
    collectTableCounts(admin),
    collectStorageInventory(admin),
  ])

  const { data: recentLogs } = await admin
    .from('audit_logs')
    .select('id, action, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: recentAlerts } = await admin
    .from('security_events')
    .select('id, event_type, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const manifest = {
    backup_id: backupId,
    created_at: new Date().toISOString(),
    label,
    includes: {
      database: TABLE_MANIFEST,
      storage_buckets: STORAGE_BUCKETS,
      logs: 'audit_logs_sample',
      reports: 'security_events_sample',
      alerts: 'security_events_sample',
    },
    table_counts: tableCounts,
    storage_inventory: storageInventory,
    audit_logs_sample: recentLogs ?? [],
    alerts_sample: recentAlerts ?? [],
  }

  const json = JSON.stringify(manifest, null, 2)
  fs.writeFileSync(localPath, json, 'utf8')
  const sizeBytes = Buffer.byteLength(json, 'utf8')

  const { data: row, error } = await admin.from('backups').insert({
    id: backupId,
    label: label || `snapshot-${timestamp}`,
    status: 'completed',
    includes: manifest.includes,
    storage_path: `backend/backups/snapshots/${filename}`,
    size_bytes: sizeBytes,
    manifest,
    created_by: createdBy,
  }).select('*').single()

  if (error) return { ok: false, error: error.message }

  await admin.from('audit_logs').insert({
    actor_type: 'ops',
    actor_id: createdBy,
    action: 'backup_created',
    target_type: 'backup',
    target_id: backupId,
    details: { label, size_bytes: sizeBytes, path: localPath },
  })

  return { ok: true, backup: row, local_path: localPath }
}

module.exports = { createBackup, collectTableCounts, collectStorageInventory, SNAPSHOT_DIR }
