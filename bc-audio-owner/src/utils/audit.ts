import AuditLog from "../models/AuditLog";

export async function logAudit(actorType: string, actorId: string | null, action: string, targetType: string | null, targetId: string | null, details: any = {}) {
  try {
    await AuditLog.create({ actorType, actorId, action, targetType, targetId, details });
  } catch (err) {
    console.error("Audit log failed", err);
  }
}
