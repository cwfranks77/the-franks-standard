import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'
const { lockLaunch, unlockLaunch } = require('#backend/launch/lock.js')

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const body = await readBody(event).catch(() => ({})) as { action?: string; reason?: string }
  const action = String(body.action ?? 'lock')

  if (action === 'unlock') {
    return unlockLaunch(sb, { unlockedBy: 'ops' })
  }

  return lockLaunch(sb, { lockedBy: null, reason: String(body.reason ?? 'pre_launch') })
})
