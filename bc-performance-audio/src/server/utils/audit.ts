import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'

export async function logBcAudit (
  actorType: string,
  actorId: string | null,
  action: string,
  targetType: string | null,
  targetId: string | null,
  details: Record<string, unknown> = {},
) {
  const sb = getBcServiceSupabase()
  if (!sb) {
    console.log('[bc-audit]', { actorType, actorId, action, targetType, targetId, details })
    return
  }

  try {
    await sb.from('bc_audit_logs').insert({
      actor_type: actorType,
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    })
  } catch (err) {
    console.error('BC audit log failed', err)
  }
}
