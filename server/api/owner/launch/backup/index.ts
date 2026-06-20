import { requireOwnerAuth } from '../../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'
const { createBackup } = require('#backend/backups/create_backup.js')
const { listBackups } = require('#backend/backups/list_backups.js')
const { restoreBackup } = require('#backend/backups/restore_backup.js')

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const method = event.method
  const body = method === 'POST' ? await readBody(event).catch(() => ({})) as Record<string, unknown> : {}
  const query = getQuery(event)

  if (method === 'GET') {
    return listBackups(sb, { limit: Number(query.limit) || 50 })
  }

  const action = String(body.action ?? query.action ?? 'create')

  if (action === 'restore') {
    const backupId = String(body.backup_id ?? query.backup_id ?? '')
    return restoreBackup(sb, backupId, {
      restoredBy: 'ops',
      dryRun: body.dry_run === true,
    })
  }

  return createBackup(sb, {
    label: String(body.label ?? ''),
    createdBy: 'ops',
  })
})
