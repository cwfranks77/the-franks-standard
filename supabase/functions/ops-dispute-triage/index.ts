import { createClient } from 'npm:@supabase/supabase-js@2'
import { logAudit } from '../_shared/auditLog.ts'
import {
  autoRefundEnabled,
  autoRefundMaxAmount,
  triageDispute,
} from '../_shared/disputeTriage.ts'
import {
  executeStripeForceRefund,
  loadOrderForRefund,
  markOrderRefunded,
} from '../_shared/forceRefund.ts'
import { freezeSellerForPlatformDebt } from '../_shared/sellerAccountFreeze.ts'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

async function runAutoRefund (
  admin: ReturnType<typeof createClient>,
  orderId: string,
  disputeId: string,
  reasons: string[],
) {
  const order = await loadOrderForRefund(admin, orderId)
  if (!order) return { ok: false as const, error: 'order_not_found' }

  const total = Number(order.total_paid ?? order.amount) || 0
  if (total > autoRefundMaxAmount()) {
    return { ok: false as const, error: 'over_auto_refund_cap', total }
  }

  const stripe = stripeClient()
  const reason = 'dispute_upheld' as const
  const result = await executeStripeForceRefund(stripe, order, {
    reason,
    opsNote: `AI auto-refund: ${reasons.join('; ')}`.slice(0, 500),
  })
  if (!result.ok) return { ok: false as const, error: result.error, code: result.code }

  const marked = await markOrderRefunded(admin, {
    orderId: order.id,
    stripeRefundId: result.refundId,
    refundAmount: result.amount,
    reason,
    initiatedBy: 'ai_triage',
    opsNote: reasons.join('; '),
  })
  if (!marked.ok) {
    return { ok: false as const, error: marked.error, stripe_refund_id: result.refundId }
  }

  await admin.from('disputes').update({
    status: 'resolved_buyer',
    resolution: 'auto_refund',
    resolved_at: new Date().toISOString(),
  }).eq('id', disputeId)

  if (order.seller_id) {
    await freezeSellerForPlatformDebt(admin, {
      sellerId: order.seller_id,
      orderId: order.id,
      debtAmount: result.amount,
      refundReason: reason,
      opsNote: 'AI auto-refund after dispute triage',
    })
  }

  await logAudit(admin, {
    actorType: 'ai',
    action: 'auto_refund_executed',
    targetType: 'order',
    targetId: orderId,
    details: { dispute_id: disputeId, amount: result.amount, reasons },
  })

  return { ok: true as const, refund_id: result.refundId, amount: result.amount }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const opsKey = String(body.ops_key ?? '')
  if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? 'list_open')

  if (action === 'list_open') {
    const limit = Math.min(50, Math.max(1, Number(body.limit) || 25))
    const { data, error } = await admin
      .from('disputes')
      .select('id, order_id, reason, description, status, evidence_urls, seller_responded, ai_decision, ai_confidence, ai_triaged_at, created_at')
      .in('status', ['open', 'under_review'])
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, disputes: data ?? [] })
  }

  if (action === 'list_audit') {
    const limit = Math.min(100, Math.max(1, Number(body.limit) || 40))
    const { data, error } = await admin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, logs: data ?? [] })
  }

  if (action === 'triage' || action === 'sweep') {
    const disputeIds: string[] = []
    if (action === 'triage') {
      const id = String(body.dispute_id ?? '').trim()
      if (!id) return json({ error: 'dispute_id_required' }, 400)
      disputeIds.push(id)
    } else {
      const limit = Math.min(30, Math.max(1, Number(body.limit) || 15))
      const { data, error } = await admin
        .from('disputes')
        .select('id')
        .in('status', ['open', 'under_review'])
        .order('created_at', { ascending: true })
        .limit(limit)
      if (error) return json({ error: error.message }, 500)
      for (const row of data ?? []) disputeIds.push(String(row.id))
    }

    const results: unknown[] = []
    const executeAuto = body.execute_auto !== false

    for (const disputeId of disputeIds) {
      const { data: dispute, error: dErr } = await admin
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .maybeSingle()
      if (dErr || !dispute) {
        results.push({ dispute_id: disputeId, error: 'not_found' })
        continue
      }

      const { data: order, error: oErr } = await admin
        .from('orders')
        .select('id, status, amount, total_paid, tracking_number, shipped_at, seller_id, buyer_email, stripe_refund_id')
        .eq('id', dispute.order_id)
        .maybeSingle()
      if (oErr || !order) {
        results.push({ dispute_id: disputeId, error: 'order_not_found' })
        continue
      }

      const triage = await triageDispute(dispute, order)
      await admin.from('disputes').update({
        ai_decision: triage.decision,
        ai_confidence: triage.confidence,
        ai_reasons: triage.reasons,
        ai_triaged_at: new Date().toISOString(),
        status: triage.decision === 'hold_for_review' ? 'under_review' : dispute.status,
      }).eq('id', disputeId)

      await logAudit(admin, {
        actorType: 'ai',
        action: 'triage_decision',
        targetType: 'dispute',
        targetId: disputeId,
        details: { order_id: dispute.order_id, triage },
      })

      let autoRefund: Record<string, unknown> | null = null
      if (
        executeAuto &&
        autoRefundEnabled() &&
        triage.decision === 'auto_refund' &&
        !order.stripe_refund_id
      ) {
        autoRefund = await runAutoRefund(admin, String(dispute.order_id), disputeId, triage.reasons)
      }

      results.push({ dispute_id: disputeId, triage, auto_refund: autoRefund })
    }

    return json({ ok: true, processed: results.length, results })
  }

  return json({
    error: 'unknown_action',
    allowed: ['list_open', 'triage', 'sweep', 'list_audit'],
  }, 400)
})
