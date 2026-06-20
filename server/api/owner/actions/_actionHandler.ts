import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

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
    const actions = require('../../../../backend/owner/actions.js')
    const body = await readBody(event).catch(() => ({}))
    const fn = actions[method]
    if (method === 'reindexSearch') return fn(sb)
    return fn(sb, body)
  })
}
