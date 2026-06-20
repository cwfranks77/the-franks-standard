import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

/**
 * GET /api/reports/law-enforcement/:case_id
 * Owner auth required. Returns packaged LE report JSON (includes lawful contact data).
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
    .from('law_enforcement_reports')
    .select('id, fraud_case_id, user_id, severity, report, prepared_at')
    .eq('fraud_case_id', caseId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Report not prepared. Use ops prepare_law_enforcement_report first.',
    })
  }

  return {
    ok: true,
    report_id: data.id,
    fraud_case_id: data.fraud_case_id,
    prepared_at: data.prepared_at,
    report: data.report,
    requires_owner_approval: true,
    auto_send: false,
  }
})
