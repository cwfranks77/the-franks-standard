export type TriageDecision = 'auto_refund' | 'hold_for_review' | 'deny'

export type TriageResult = {
  decision: TriageDecision
  confidence: number
  reasons: string[]
  actions?: Record<string, unknown>
}

const AI_KEY = Deno.env.get('AI_PROVIDER_API_KEY') ?? ''
const AI_ENDPOINT = Deno.env.get('AI_PROVIDER_ENDPOINT') ?? ''

function orderTotalDollars (order: Record<string, unknown>): number {
  const paid = Number(order.total_paid)
  if (Number.isFinite(paid) && paid > 0) return paid
  return Number(order.amount) || 0
}

function ruleBasedTriage (dispute: Record<string, unknown>, order: Record<string, unknown>): TriageResult {
  const reasons: string[] = []
  let decision: TriageDecision = 'hold_for_review'
  let confidence = 0.5

  const reason = String(dispute.reason ?? '')
  const openedAt = new Date(String(dispute.created_at ?? dispute.openedAt ?? Date.now()))
  const now = new Date()
  const cureWindowMs = 72 * 60 * 60 * 1000
  const tracking = String(order.tracking_number ?? '').trim()

  if (reason === 'not_received' || reason === 'non-shipment') {
    if (!tracking && now.getTime() - openedAt.getTime() > cureWindowMs) {
      decision = 'auto_refund'
      confidence = 0.9
      reasons.push('No tracking and 72-hour cure window passed')
    } else {
      decision = 'hold_for_review'
      confidence = 0.6
      reasons.push('No tracking or cure window not passed yet')
    }
  }

  const evidence = (dispute.evidence_urls as string[] | undefined) ?? []
  if (reason === 'counterfeit' && evidence.length > 0) {
    decision = 'auto_refund'
    confidence = 0.85
    reasons.push('Counterfeit claim with uploaded evidence')
  }

  if ((reason === 'not_as_described' || reason === 'return') && dispute.seller_responded === false) {
    decision = 'hold_for_review'
    confidence = 0.6
    reasons.push('Buyer dispute open; seller has not responded')
  }

  const autoRefundMax = Number(Deno.env.get('AUTO_REFUND_MAX_AMOUNT') || 200)
  const total = orderTotalDollars(order)
  if (decision === 'auto_refund' && total > autoRefundMax) {
    decision = 'hold_for_review'
    confidence = 0.7
    reasons.push(`Order total $${total} exceeds auto-refund cap $${autoRefundMax}`)
  } else if (decision === 'auto_refund' && total <= autoRefundMax) {
    confidence = Math.min(0.95, confidence + 0.05)
    reasons.push('Order total within auto-refund threshold')
  }

  return { decision, confidence, reasons, actions: {} }
}

export async function triageDispute (
  dispute: Record<string, unknown>,
  order: Record<string, unknown>,
): Promise<TriageResult> {
  if (!AI_KEY || !AI_ENDPOINT) {
    return ruleBasedTriage(dispute, order)
  }

  try {
    const resp = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_KEY}`,
      },
      body: JSON.stringify({
        instruction: 'Triage this marketplace dispute. Return JSON: decision (auto_refund|hold_for_review|deny), confidence 0-1, reasons array.',
        dispute,
        order,
      }),
    })
    if (!resp.ok) return ruleBasedTriage(dispute, order)
    const data = await resp.json() as Record<string, unknown>
    const decision = String(data.decision ?? 'hold_for_review') as TriageDecision
    const safeDecision: TriageDecision =
      decision === 'auto_refund' || decision === 'deny' ? decision : 'hold_for_review'
    return {
      decision: safeDecision,
      confidence: Number(data.confidence ?? 0.5),
      reasons: Array.isArray(data.reasons) ? data.reasons.map(String) : [],
      actions: (data.actions as Record<string, unknown>) ?? {},
    }
  } catch (e) {
    console.error('ai_triage_error', e)
    return ruleBasedTriage(dispute, order)
  }
}

export function autoRefundEnabled (): boolean {
  return (Deno.env.get('AUTO_REFUND_ENABLED') ?? 'true') === 'true'
}

export function autoRefundMaxAmount (): number {
  return Number(Deno.env.get('AUTO_REFUND_MAX_AMOUNT') || 200)
}
