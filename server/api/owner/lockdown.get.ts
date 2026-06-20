import { requireOwnerAuth } from '../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const { finalLockdownCheck } = require('#backend/owner/final_lockdown_check.js')
  return finalLockdownCheck(sb)
})
