export type BcTriageDecision = 'auto_refund' | 'hold_for_review' | 'deny'

export type BcTriageResult = {
  decision: BcTriageDecision
  confidence: number
  reasons: string[]
  actions?: Record<string, unknown>
}

function ruleBasedTriage (dispute: Record<string, unknown>, order: Record<string, unknown>): BcTriageResult {
  const reasons: string[] = []
  let decision: BcTriageDecision = 'hold_for_review'
  let confidence = 0.5

  const reason = String(dispute.reason || '')
  const openedAt = new Date(String(dispute.opened_at || dispute.openedAt || Date.now()))
  const now = new Date()
  const cureWindowMs = 72 * 60 * 60 * 1000

  if (reason === 'non-shipment') {
    const tracking = order.tracking_number || order.trackingNumber
    if (!tracking && now.getTime() - openedAt.getTime() > cureWindowMs) {
      decision = 'auto_refund'
      confidence = 0.9
      reasons.push('No tracking and 72-hour cure window passed')
    } else {
      reasons.push(tracking ? 'Tracking present' : 'Cure window not passed yet')
    }
  }

  if (reason === 'counterfeit') {
    const evidence = dispute.evidence as { photos?: unknown[] } | undefined
    if (evidence?.photos?.length) {
      decision = 'auto_refund'
      confidence = 0.85
      reasons.push('Counterfeit claim with photographic evidence')
    }
  }

  const orderTotal = Number(order.total_cents ? Number(order.total_cents) / 100 : order.total || 0)
  const maxAmount = Number(process.env.AUTO_REFUND_MAX_AMOUNT || 200)
  if (decision === 'auto_refund' && orderTotal > 0 && orderTotal <= maxAmount) {
    confidence = Math.min(0.95, confidence + 0.05)
    reasons.push('Order total under auto-refund threshold')
  }

  return { decision, confidence, reasons, actions: {} }
}

export async function triageBcDispute (
  dispute: Record<string, unknown>,
  order: Record<string, unknown>,
): Promise<BcTriageResult> {
  const aiKey = String(process.env.AI_PROVIDER_API_KEY || '').trim()
  const aiEndpoint = String(process.env.AI_PROVIDER_ENDPOINT || '').trim()

  if (!aiKey || !aiEndpoint) {
    return ruleBasedTriage(dispute, order)
  }

  try {
    const resp = await fetch(aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiKey}`,
      },
      body: JSON.stringify({ instruction: 'Triage this marketplace dispute', dispute, order }),
    })
    if (!resp.ok) return ruleBasedTriage(dispute, order)
    const data = await resp.json() as Partial<BcTriageResult>
    return {
      decision: (data.decision as BcTriageDecision) || 'hold_for_review',
      confidence: Number(data.confidence || 0.5),
      reasons: data.reasons || [],
      actions: data.actions || {},
    }
  } catch (err) {
    console.error('BC AI triage error', err)
    return ruleBasedTriage(dispute, order)
  }
}

export function autoRefundEnabled (): boolean {
  return String(process.env.AUTO_REFUND_ENABLED ?? 'true').toLowerCase() !== 'false'
}

export function orderTotalDollars (order: Record<string, unknown>): number {
  if (order.total_cents != null) return Number(order.total_cents) / 100
  return Number(order.total || 0)
}
