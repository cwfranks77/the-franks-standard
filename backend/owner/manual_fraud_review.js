/**
 * Owner manual fraud case review.
 */

const { prepareLawEnforcementReport } = require('../reporting/law_enforcement/prepare_report.js')
const { prepareIndustryAlert } = require('../reporting/industry/prepare_alert.js')
const { logOwnerAction } = require('./_shared.js')

async function viewCase (admin, caseId) {
  const { data, error } = await admin
    .from('fraud_cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle()
  if (error || !data) return { ok: false, error: error?.message ?? 'case_not_found' }

  let profile = null
  if (data.user_id) {
    const { data: p } = await admin.from('profiles').select('id, store_name, contact_email, platform_banned_at, safety_frozen_at').eq('id', data.user_id).maybeSingle()
    profile = p
  }

  return { ok: true, case: data, profile }
}

async function addEvidence (admin, caseId, evidence) {
  if (!evidence || typeof evidence !== 'object') return { ok: false, error: 'evidence_object_required' }

  const { data: existing } = await admin.from('fraud_cases').select('evidence').eq('id', caseId).maybeSingle()
  if (!existing) return { ok: false, error: 'case_not_found' }

  const merged = {
    ...(existing.evidence ?? {}),
    ...evidence,
    owner_additions: [
      ...((existing.evidence?.owner_additions) ?? []),
      { added_at: new Date().toISOString(), ...evidence },
    ],
  }

  const { error } = await admin.from('fraud_cases').update({
    evidence: merged,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'fraud_add_evidence', targetType: 'fraud_case', targetId: caseId })
  return { ok: true, case_id: caseId }
}

async function escalate (admin, caseId) {
  const { data: existing } = await admin.from('fraud_cases').select('evidence, severity').eq('id', caseId).maybeSingle()
  if (!existing) return { ok: false, error: 'case_not_found' }

  const evidence = {
    ...(existing.evidence ?? {}),
    escalated_at: new Date().toISOString(),
    owner_escalated: true,
  }

  const { error } = await admin.from('fraud_cases').update({
    severity: 'high',
    status: 'open',
    evidence,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'fraud_escalate', targetType: 'fraud_case', targetId: caseId })
  return { ok: true, case_id: caseId, escalated: true }
}

async function closeCase (admin, caseId, { resolution = 'closed_by_owner' } = {}) {
  const { data: existing } = await admin.from('fraud_cases').select('evidence').eq('id', caseId).maybeSingle()
  if (!existing) return { ok: false, error: 'case_not_found' }

  const evidence = {
    ...(existing.evidence ?? {}),
    closed_at: new Date().toISOString(),
    resolution,
  }

  const { error } = await admin.from('fraud_cases').update({
    status: 'closed',
    evidence,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'fraud_close_case', targetType: 'fraud_case', targetId: caseId, details: { resolution } })
  return { ok: true, case_id: caseId, status: 'closed' }
}

async function prepareLawEnforcementReportForCase (admin, caseId) {
  const result = await prepareLawEnforcementReport(admin, caseId)
  if (result.ok) {
    await admin.from('fraud_cases').update({ law_enforcement_prepared: true }).eq('id', caseId)
    await logOwnerAction(admin, { action: 'fraud_prepare_le_report', targetType: 'fraud_case', targetId: caseId })
  }
  return result
}

async function prepareIndustryAlertForCase (admin, caseId) {
  const result = await prepareIndustryAlert(admin, caseId)
  if (result.ok) {
    await admin.from('fraud_cases').update({ industry_alert_prepared: true }).eq('id', caseId)
    await logOwnerAction(admin, { action: 'fraud_prepare_industry_alert', targetType: 'fraud_case', targetId: caseId })
  }
  return result
}

module.exports = {
  viewCase,
  addEvidence,
  escalate,
  closeCase,
  prepareLawEnforcementReport: prepareLawEnforcementReportForCase,
  prepareIndustryAlert: prepareIndustryAlertForCase,
}
