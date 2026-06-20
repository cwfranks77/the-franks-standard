import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'

const ACTIONS: Record<string, string> = {
  'freeze-user': 'freezeUser',
  'unfreeze-user': 'unfreezeUser',
  'ban-user': 'banUser',
  'unban-user': 'unbanUser',
  'ban-device': 'banDevice',
  'ban-ip': 'banIp',
  'reset-password': 'resetPassword',
  'force-logout': 'forceLogout',
  'clear-cache': 'clearCache',
  'reindex-search': 'reindexSearch',
  'run-backup': 'runBackup',
  'restore-backup': 'restoreBackupAction',
}

export function createActionHandler (actionKey: string) {
  return defineEventHandler(async (event) => {
    requireOwnerAuth(event)
    const sb = getServiceSupabase()
    if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })
    const method = ACTIONS[actionKey]
    if (!method) throw createError({ statusCode: 404, statusMessage: 'Unknown action' })
    const actions = require('#backend/owner/actions.js')
    const body = await readBody(event).catch(() => ({}))
    const fn = actions[method]
    let result
    if (method === 'reindexSearch') result = await fn(sb)
    else result = await fn(sb, body)

    const { logAdminAction } = require('#backend/activity/activity_recorder.js')
    await logAdminAction('ops', method, {
      ...(body && typeof body === 'object' ? body : {}),
      ok: result?.ok !== false,
    }, sb).catch(() => {})

    return result
  })
}
