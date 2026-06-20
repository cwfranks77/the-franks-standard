import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { redactObject } = require('../../../../backend/reporting/industry/prepare_alert.js')

/**
 * GET /api/reports/industry/:case_id
 * Owner auth required. Returns PII-redacted industry alert JSON only.
 */
export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)

  const caseId = getRouterParam(event, 'case_id')
  if (!caseId) {
    throw createError({ statusCode: 400, statusMessage: 'case_id required' })
  }

  const sb = getServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })
  }

  const { data, error } = await sb
    .from('industry_alerts')
    .select('id, fraud_case_id, alert, prepared_at')
    .eq('fraud_case_id', caseId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Industry alert not prepared. Use ops prepare_industry_alert first.',
    })
  }

  return {
    ok: true,
    alert_id: data.id,
    fraud_case_id: data.fraud_case_id,
    prepared_at: data.prepared_at,
    alert: redactObject(data.alert),
    requires_owner_approval: true,
    auto_send: false,
  }
})
