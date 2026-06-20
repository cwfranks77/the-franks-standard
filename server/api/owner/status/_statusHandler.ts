import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'

const HANDLERS: Record<string, string> = {
  platform: '#backend/owner/get_platform_status.js',
  financial: '#backend/owner/get_financial_status.js',
  security: '#backend/owner/get_security_status.js',
  fraud: '#backend/owner/get_fraud_status.js',
  disputes: '#backend/owner/get_dispute_status.js',
  users: '#backend/owner/get_user_status.js',
  stores: '#backend/owner/get_store_status.js',
}

const METHODS: Record<string, string> = {
  platform: 'getPlatformStatus',
  financial: 'getFinancialStatus',
  security: 'getSecurityStatus',
  fraud: 'getFraudStatus',
  disputes: 'getDisputeStatus',
  users: 'getUserStatus',
  stores: 'getStoreStatus',
}

export function createStatusHandler (key: string) {
  return defineEventHandler(async (event) => {
    requireOwnerAuth(event)
    const sb = getServiceSupabase()
    if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })
    const modPath = HANDLERS[key]
    const method = METHODS[key]
    if (!modPath || !method) throw createError({ statusCode: 404, statusMessage: 'Unknown status domain' })
    const mod = require(modPath)
    return mod[method](sb)
  })
}
