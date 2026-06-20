import { createClient } from 'npm:@supabase/supabase-js@2'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import {
  banDevice,
  banIp,
  banUser,
  freezeAccount,
  unfreezeAccount,
} from '../_shared/accountSafety.ts'
import { addFraudEvidence, closeFraudCase, openFraudCase } from '../_shared/fraudCaseEngine.ts'
import {
  escalateToTfs,
  notifyOtherParty,
  openDispute,
  resolveDispute,
} from '../_shared/disputeResolutionEngine.ts'
import { prepareIndustryAlert } from '../_shared/industryFraudAlert.ts'
import { prepareLawEnforcementReport } from '../_shared/lawEnforcementReport.ts'
import { previewScan } from '../_shared/violationEnforcement.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (!(await verifyOpsKey(String(body.ops_key ?? '')))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? '')

  if (action === 'scan_preview') {
    const content = String(body.content ?? '')
    const source = String(body.source_type ?? 'other') as 'message' | 'listing' | 'other'
    return json({ ok: true, scan: previewScan(content, source) })
  }

  if (action === 'freeze_account') {
    const userId = String(body.user_id ?? '')
    const reason = String(body.reason ?? 'Ops freeze')
    if (!userId) return json({ error: 'user_id_required' }, 400)
    const result = await freezeAccount(admin, userId, reason)
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500)
  }

  if (action === 'unfreeze_account') {
    const userId = String(body.user_id ?? '')
    if (!userId) return json({ error: 'user_id_required' }, 400)
    const result = await unfreezeAccount(admin, userId)
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500)
  }

  if (action === 'ban_user') {
    const userId = String(body.user_id ?? '')
    const reason = String(body.reason ?? 'Ops ban')
    if (!userId) return json({ error: 'user_id_required' }, 400)
    const result = await banUser(admin, userId, reason, 'ops')
    if (!result.ok) return json({ error: result.error }, 500)
    if (body.device_fingerprint) await banDevice(admin, String(body.device_fingerprint), reason, userId, 'ops')
    if (body.ip_address) await banIp(admin, String(body.ip_address), reason, { userId, bannedBy: 'ops', fraudFlag: true })
    return json({ ok: true })
  }

  if (action === 'open_fraud_case') {
    const userId = String(body.user_id ?? '')
    if (!userId) return json({ error: 'user_id_required' }, 400)
    const result = await openFraudCase(admin, {
      userId,
      severity: (body.severity as 'low' | 'medium' | 'high' | 'critical') || 'high',
      evidence: (body.evidence as Record<string, unknown>) || {},
    })
    return result.ok ? json({ ok: true, case_id: result.caseId }) : json({ error: result.error }, 500)
  }

  if (action === 'add_fraud_evidence') {
    const caseId = String(body.case_id ?? '')
    if (!caseId) return json({ error: 'case_id_required' }, 400)
    const result = await addFraudEvidence(admin, caseId, (body.evidence as Record<string, unknown>) || {})
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500)
  }

  if (action === 'close_fraud_case') {
    const caseId = String(body.case_id ?? '')
    if (!caseId) return json({ error: 'case_id_required' }, 400)
    const result = await closeFraudCase(admin, caseId, (body.resolution as Record<string, unknown>) || {})
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500)
  }

  if (action === 'open_dispute') {
    const buyerId = String(body.buyer_id ?? '')
    const sellerId = String(body.seller_id ?? '')
    const orderId = String(body.order_id ?? '')
    const description = String(body.description ?? '')
    if (!buyerId || !sellerId || !orderId || !description) {
      return json({ error: 'missing_fields' }, 400)
    }
    const result = await openDispute(admin, {
      buyerId,
      sellerId,
      orderId,
      description,
      evidence: (body.evidence as Record<string, unknown>) || {},
    })
    return result.ok ? json({ ok: true, dispute_id: result.disputeId }) : json({ error: result.error }, 500)
  }

  if (action === 'notify_dispute_party') {
    const disputeId = String(body.dispute_id ?? '')
    if (!disputeId) return json({ error: 'dispute_id_required' }, 400)
    const result = await notifyOtherParty(admin, disputeId)
    return result.ok ? json({ ok: true, notified_user_id: result.notified_user_id }) : json({ error: result.error }, 500)
  }

  if (action === 'escalate_dispute') {
    const disputeId = String(body.dispute_id ?? '')
    if (!disputeId) return json({ error: 'dispute_id_required' }, 400)
    const result = await escalateToTfs(admin, disputeId)
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500)
  }

  if (action === 'resolve_dispute') {
    const disputeId = String(body.dispute_id ?? '')
    const ruling = String(body.ruling ?? '')
    if (!disputeId || !ruling) return json({ error: 'missing_fields' }, 400)
    const result = await resolveDispute(admin, disputeId, ruling, (body.ruling_metadata as Record<string, unknown>) || {})
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500)
  }

  if (action === 'prepare_law_enforcement_report') {
    const caseId = String(body.case_id ?? '')
    if (!caseId) return json({ error: 'case_id_required' }, 400)
    const result = await prepareLawEnforcementReport(admin, caseId)
    return result.ok
      ? json({ ok: true, report_id: result.reportId, payload: result.payload, requires_owner_approval: true })
      : json({ error: result.error }, 500)
  }

  if (action === 'prepare_industry_alert') {
    const caseId = String(body.case_id ?? '')
    if (!caseId) return json({ error: 'case_id_required' }, 400)
    const result = await prepareIndustryAlert(admin, caseId)
    return result.ok
      ? json({ ok: true, alert_id: result.draftId, payload: result.payload, requires_owner_approval: true })
      : json({ error: result.error }, 500)
  }

  return json({ error: 'unknown_action' }, 400)
})
