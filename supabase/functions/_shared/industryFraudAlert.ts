import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const PII_KEYS = new Set([
  'email', 'buyer_email', 'reporter_email', 'phone', 'name', 'buyer_name',
  'user_display_name', 'public_display_name', 'ip_address', 'last_known_ip',
  'device_fingerprint', 'browser_fingerprint', 'last_device_fingerprint',
])

function redactValue (key: string, value: unknown): unknown {
  if (PII_KEYS.has(key.toLowerCase())) return '[REDACTED]'
  if (typeof value === 'string' && /@/.test(value) && /\.[a-z]{2,}$/i.test(value)) return '[REDACTED_EMAIL]'
  if (typeof value === 'string' && /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(value)) return '[REDACTED_PHONE]'
  return value
}

function redactObject (obj: unknown, depth = 0): unknown {
  if (depth > 8) return '[TRUNCATED]'
  if (Array.isArray(obj)) return obj.map((v) => redactObject(v, depth + 1))
  if (!obj || typeof obj !== 'object') return obj

  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'object' && v !== null) {
      out[k] = redactObject(v, depth + 1)
    } else {
      out[k] = redactValue(k, v)
    }
  }
  return out
}

/** Industry fraud alert — behavior evidence only, PII stripped. Owner must approve before send. */
export async function prepareIndustryAlert (
  admin: SupabaseClient,
  caseId: string,
): Promise<{ ok: true; draftId: string; payload: Record<string, unknown> } | { ok: false; error: string }> {
  const { data: fraudCase, error: caseErr } = await admin
    .from('fraud_cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle()

  if (caseErr || !fraudCase) return { ok: false, error: caseErr?.message ?? 'case_not_found' }

  const userId = fraudCase.user_id as string | null

  const { data: violations } = await admin
    .from('violation_events')
    .select('violation_type, severity, matches, source_type, created_at, action_taken')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: listings } = await admin
    .from('listings')
    .select('id, title, category, integrity_status, integrity_flags, status, created_at')
    .eq('seller_id', userId)
    .limit(30)

  const behaviorEvidence = {
    fraud_case_id: caseId,
    severity: fraudCase.severity,
    status: fraudCase.status,
    violation_summary: (violations ?? []).map((v) => ({
      type: v.violation_type,
      severity: v.severity,
      action: v.action_taken,
      at: v.created_at,
      pattern_labels: (v.matches as { label?: string }[] | null)?.map((m) => m.label).filter(Boolean),
    })),
    listing_behavior: (listings ?? []).map((l) => ({
      listing_id: l.id,
      category: l.category,
      integrity_status: l.integrity_status,
      flags: l.integrity_flags,
      status: l.status,
    })),
    fraud_patterns: (fraudCase.evidence as Record<string, unknown>)?.matches ?? fraudCase.evidence,
  }

  const payload = redactObject({
    report_type: 'industry_fraud_alert',
    prepared_at: new Date().toISOString(),
    requires_owner_approval: true,
    auto_send: false,
    marketplace: 'The Franks Standard LLC',
    behavior_evidence: behaviorEvidence,
    disclaimer: 'No personal identifiers included. Owner approval required before external distribution.',
  }) as Record<string, unknown>

  const { data: draft, error: draftErr } = await admin.from('safety_report_drafts').insert({
    fraud_case_id: caseId,
    report_type: 'industry_alert',
    payload,
  }).select('id').single()

  if (draftErr || !draft?.id) return { ok: false, error: draftErr?.message ?? 'draft_failed' }

  await admin.from('fraud_cases').update({
    industry_alert_prepared: true,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  return { ok: true, draftId: draft.id, payload }
}
