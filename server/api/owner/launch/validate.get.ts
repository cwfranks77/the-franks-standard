import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { validatePlatform } = require('../../../../backend/launch/validate_platform.js')

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  return validatePlatform(sb)
})
