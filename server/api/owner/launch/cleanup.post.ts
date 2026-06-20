import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'
const { cleanupTestData } = require('#backend/launch/cleanup.js')

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const body = await readBody(event).catch(() => ({})) as { dry_run?: boolean; confirm?: boolean }
  const dryRun = body.dry_run !== false
  const ownerConfirmed = body.confirm === true

  return cleanupTestData(sb, { dryRun, ownerConfirmed })
})
