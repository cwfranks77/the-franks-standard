import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const LOG_TYPES = ['activity', 'security', 'violations', 'fraud', 'disputes', 'payouts', 'emails', 'sms', 'jobs'] as const

export function createLogHandler (logType: string) {
  return defineEventHandler(async (event) => {
    requireOwnerAuth(event)
    const sb = getServiceSupabase()
    if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })
    if (!LOG_TYPES.includes(logType as typeof LOG_TYPES[number])) {
      throw createError({ statusCode: 404, statusMessage: 'Unknown log type' })
    }
    const { queryOwnerLogs } = require('../../../../backend/owner/logs.js')
    return queryOwnerLogs(sb, logType, getQuery(event))
  })
}
