/** Generate fraud/report packages asynchronously. */

const { prepareLawEnforcementReport } = require('../reporting/law_enforcement/prepare_report.js')
const { prepareIndustryAlert } = require('../reporting/industry/prepare_alert.js')

module.exports = async function generateReportsJob (admin, payload) {
  const { fraud_case_id, report_type = 'law_enforcement' } = payload || {}
  if (!admin) throw new Error('supabase_required')
  if (!fraud_case_id) throw new Error('fraud_case_id_required')

  if (report_type === 'industry_alert') {
    const result = await prepareIndustryAlert(admin, fraud_case_id)
    if (!result.ok) throw new Error(result.error)
    return { ok: true, alert_id: result.alertId }
  }

  const result = await prepareLawEnforcementReport(admin, fraud_case_id)
  if (!result.ok) throw new Error(result.error)
  return { ok: true, report_id: result.reportId }
}
