import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { emergencyShutdown } = require('../../../../backend/launch/emergency.js')

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const body = await readBody(event).catch(() => ({})) as { confirm?: boolean }
  if (body.confirm !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Set confirm:true to trigger emergency shutdown.',
    })
  }

  return emergencyShutdown(sb, { triggeredBy: 'ops' })
})
