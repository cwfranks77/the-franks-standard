/**
 * List platform backups from database metadata.
 */

async function listBackups (admin, { limit = 50 } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const { data, error } = await admin
    .from('backups')
    .select('id, label, status, includes, storage_path, size_bytes, created_by, created_at, restored_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(100, limit))

  if (error) return { ok: false, error: error.message }
  return { ok: true, backups: data ?? [], count: (data ?? []).length }
}

module.exports = { listBackups }
