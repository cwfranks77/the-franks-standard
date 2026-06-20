import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function logAudit (
  admin: SupabaseClient,
  row: {
    actorType: string
    actorId?: string | null
    action: string
    targetType?: string | null
    targetId?: string | null
    details?: Record<string, unknown>
  },
) {
  try {
    await admin.from('audit_logs').insert({
      actor_type: row.actorType,
      actor_id: row.actorId ?? null,
      action: row.action,
      target_type: row.targetType ?? null,
      target_id: row.targetId ?? null,
      details: row.details ?? {},
    })
  } catch (e) {
    console.error('audit_log_failed', e)
  }
}
