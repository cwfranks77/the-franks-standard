import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { logAudit } from './auditLog.ts'
import { notificationTriggers } from './notifications.ts'

export type FraudSeverity = 'low' | 'medium' | 'high' | 'critical'

export async function openFraudCase (
  admin: SupabaseClient,
  params: {
    userId: string
    severity?: FraudSeverity
    evidence?: Record<string, unknown>
  },
): Promise<{ ok: true; caseId: string } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const { data, error } = await admin.from('fraud_cases').insert({
    user_id: params.userId,
    severity: params.severity ?? 'high',
    evidence: params.evidence ?? {},
    status: 'open',
    updated_at: now,
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }

  await logAudit(admin, {
    actorType: 'system',
    actorId: params.userId,
    action: 'fraud_case_opened',
    targetType: 'fraud_case',
    targetId: data.id,
    details: { user_id: params.userId, severity: params.severity ?? 'high' },
  })

  await notificationTriggers.fraudCase(admin, {
    userId: params.userId,
    caseId: data.id,
    status: 'open',
  }).catch((e) => console.error('fraud case notification', e))

  return { ok: true, caseId: data.id }
}

export async function addFraudEvidence (
  admin: SupabaseClient,
  caseId: string,
  evidence: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: loadErr } = await admin
    .from('fraud_cases')
    .select('evidence')
    .eq('id', caseId)
    .maybeSingle()

  if (loadErr || !existing) return { ok: false, error: loadErr?.message ?? 'case_not_found' }

  const merged = {
    ...(existing.evidence as Record<string, unknown> || {}),
    ...evidence,
    _append_log: [
      ...((existing.evidence as { _append_log?: unknown[] })?._append_log || []),
      { at: new Date().toISOString(), ...evidence },
    ],
  }

  const { error } = await admin.from('fraud_cases').update({
    evidence: merged,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function closeFraudCase (
  admin: SupabaseClient,
  caseId: string,
  resolution?: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing } = await admin.from('fraud_cases').select('user_id, evidence').eq('id', caseId).maybeSingle()
  const evidence = {
    ...((existing?.evidence as Record<string, unknown>) || {}),
    resolution: resolution ?? { closed_at: new Date().toISOString() },
  }

  const { error } = await admin.from('fraud_cases').update({
    status: 'closed',
    evidence,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  if (error) return { ok: false, error: error.message }

  if (existing?.user_id) {
    await notificationTriggers.fraudCase(admin, {
      userId: existing.user_id,
      caseId,
      status: 'closed',
    }).catch((e) => console.error('fraud case close notification', e))
  }

  return { ok: true }
}
